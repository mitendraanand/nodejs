const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');

const AppError = require('./../utils/appError');

const signToken = id => {
  // CREATE TOKEN
  return jwt.sign(
    {
      id
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN
    }
  );
};
exports.signup = catchAsync(async (req, res, next) => {
  // CREATE USER
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    role: req.body.role
  });

  // CREATE TOKEN
  const token = signToken(newUser._id);

  // RESPOND TO CLIENT
  res.status(201).json({
    status: 'success',
    token,
    user: newUser
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body; // ES6 destructuring feature to read peopeties.

  // 1. Check if email and password actually exist.
  if (!email || !password) {
    // use return so that the middleware ends here itself, otherwise next() and res.status()
    // both will end up sending response and there will be error.
    return next(new AppError('Please provide email & passworkd', 500));
  }

  // 2. Check if User is exist && password is correct.
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.correctPassword(password, user.password))) {
    // use return so that the middleware ends here itself, otherwise next() and res.status()
    // both will end up sending response and there will be error.
    return next(new AppError('Incorrect email & passworkd', 401));
  }

  // 3. If everything ok, send token to the client.
  const token = signToken(user._id);

  res.status(200).json({
    status: 'success',
    token
  });
});

exports.protect = catchAsync(async (req, res, next) => {
  // 1. Getting the token and check if it's there.
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) {
    return next(new AppError('You are not logged in.', 401));
  }
  // 2. Verify the token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3) Check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError(
        'The user belonging to this token does no longer exist.',
        401
      )
    );
  }

  // 4) Check if user changed password after the token was issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password! Please log in again.', 401)
    );
  }

  // GRANT ACCESS TO PROTECTED ROUTE
  req.user = currentUser;
  next();
});

// Passing parameters to MIDDLEWARE is tricky as it takes only req, res and next.
// We will write a wrapper function which takes roles array(ES6 Rest Syntax: ...roles)
// then returns the MIDDLEWARE. This MIDDELWARE will be able to access roles array
// as it's a clousure which can access it's parent function scope members.
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // roles = ['admin', 'lead-guy']
    if (!roles.includes(req.user.role)) {
      // Remember that protect() MIDDLEWARE is called before 'restrictTo'
      // and puts the logged in user into 'req' object.
      return next(
        new AppError('You do not have permission to perform this actions', 403)
      );
    }
    next();
  };
};
