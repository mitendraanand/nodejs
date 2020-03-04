const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');

const AppError = require('./../utils/appError');
const sendEmail = require('./../utils/email');

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

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1. Get User based on POSTed email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('There is no user with this email', 404));
  }

  // 2. Generate the random reset token
  const resetToken = user.createPasswordResetToken();
  // passwordResetToken and passwordResetExpires got created above but
  // it was not saved in User Model. So we will call .save() on it.
  // But .save() will not be allowed due to validators of email and name.
  // So we need to disable to validators just for this case by
  // validateBeforeSave: false
  await user.save({ validateBeforeSave: false });

  // 3. Send it to user's email
  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}}`;

  const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}. \nIf you didn't forget your password, please ignore this.`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Your password reset token, valid for 10 minutes.',
      message
    });

    res.status(200).json({
      status: 'success',
      message: 'Reset token sent to your email.'
    });
  } catch (err) {
    user.createPasswordResetToken = undefined;
    user.passswordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(new AppError('There was an error while sending email, please try again', 500))
  }
});

exports.resetPassword = (req, res, next) => {};
