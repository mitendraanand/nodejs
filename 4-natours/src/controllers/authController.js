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
    passwordConfirm: req.body.passwordConfirm
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
