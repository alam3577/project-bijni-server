const jwt = require('jsonwebtoken');
const { promisify } = require('util');
// eslint-disable-next-line import/no-extraneous-dependencies
const fast2sms = require('fast-two-sms');
const User = require('../models/authModel');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

const signInToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

const sendOTP = async (phone, otp, next) => {
  const options = {
    authorization: process.env.F2F_API_KEY,
    message: otp,
    numbers: [phone],
  };
  console.log({options});
  const resData = await fast2sms.sendMessage(options);
  console.log({ resData });
  if (!resData) {
    return next(new AppError(`Error In sending OTP, Please try again`, 400));
  }
  return resData.return;
};

// TO DO
const createSendToken = (user, statusCode, res) => {
  const token = signInToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  // if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
  console.log({ cookieOptions });
  res.cookie('jwt', token, cookieOptions);

  // Remove password from output
  user.password = undefined;
  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

exports.singnup = catchAsync(async (req, res, next) => {
  const { name, phone, password, confirmPassword } = req.body;
  if (!phone || !password || !name || !confirmPassword) {
    return next(new AppError('Some fields are missing', 400));
  }
  const userExist = await User.findOne({ phone });

  if (userExist && userExist.isActive) {
    return next(new AppError('User exist, Please Login', 400));
  }

  const otp = Math.floor(100000 + Math.random() * 900000)
    .toString()
    .slice(0, 4);

  const otpExpires = Date.now() + 5 * 60 * 1000;

  const isOtpSent = await sendOTP(phone, otp, next);
  if (!isOtpSent) {
    return next(new AppError(`Error In sending OTP, Please try again`, 400));
  }

  if (userExist && !userExist.isActive) {
    userExist.otp = otp;
    userExist.OTPExpires = otpExpires;
    await userExist.save({ validateBeforeSave: false });
  } else {
    const user = await User.create({
      name,
      phone,
      otp,
      OTPExpires: otpExpires,
      password,
      confirmPassword,
    });

    if (!user) {
      return next(new AppError('Email or password is wrong', 404));
    }
  }

  res.status(200).json({
    status: 'success',
    message: 'OTP Sent',
  });
  // createSendToken(user, 200, res);
});

exports.verifyOTP = catchAsync(async (req, res, next) => {
  const { phone, otp } = req.body;
  const user = await User.findOne({ phone, otp });

  if (!user) {
    return next(new AppError(`Invalid OTP`, 400));
  }

  if (user.OTPExpires < Date.now()) {
    return next(new AppError(`OTP Expires`, 400));
  }

  // Update user status to verified
  user.isActive = true;
  user.otp = undefined;
  user.OTPExpires = undefined;
  await user.save({
    validateBeforeSave: false,
  });

  createSendToken(user, 200, res);
});

exports.login = catchAsync(async (req, res, next) => {
  //1.check email and password
  //2.check if user is exist and compare password.
  //3.if everything is ok send token
  const { phone, password } = req.body;
  console.log({ phone, password });
  if (!phone || !password) {
    return next(new AppError('Some fields are missing', 400));
  }
  const user = await User.findOne({ phone });
  if (!user || !user.isActive) {
    return next(new AppError('User not registered', 401));
  }

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Phone or password is wrong', 401));
  }
  createSendToken(user, 200, res);
});

exports.logout = (req, res) => {
  res.cookie('jwt', 'loggedOut', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({ status: 'success' });
};

// authentication
exports.protect = catchAsync(async (req, res, next) => {
  console.log({ head: req.headers.authorization });
  //1.get the token
  //2.Verification of tokens with payload(_id).
  //3.Check if User Still exists
  //4.Check if user changed password after JWT was issued

  //1.get the token
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  if (!token) {
    return next(
      new AppError('you are not logged In please login to get access', 401)
    );
  }
  // 2. Verification of tokens with payload(_id)
  const decode = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3. Check if User Still exists
  const user = await User.findById(decode.id);

  // 4. Check if user changed password after JWT was issued
  // if (user.changedPasswordAfter(decode.iat)) {
  //   return next(
  //     new AppError(`user changed password recently, please login again`, 401)
  //   );
  // }

  req.user = user;
  next();
});

//authorization
exports.restrictTo =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('you are not authorized to perform this operation', 403)
      );
    }
    next();
  };

exports.forgotPassword = catchAsync(async (req, res, next) => {
  const { phone } = req.body;
  const user = await User.findOne({ phone });
  const otp = Math.floor(100000 + Math.random() * 900000)
    .toString()
    .slice(0, 4);

  if (!user || !user.isActive) {
    return next(new AppError('User not Found, please Signup', 404));
  }
  const isOtpSent = await sendOTP(phone, otp, next);
  if (!isOtpSent) {
    return next(new AppError(`Error In sending OTP, Please try again`, 400));
  }
  user.otp = otp;
  user.OTPExpires = Date.now() + 5 * 60 * 1000;
  user.save({ validateBeforeSave: false });
  res.status(200).json({
    status: 'success',
    message: 'OTP Sent',
  });
});

exports.verifyResetPasswordOTP = catchAsync(async (req, res, next) => {
  const { phone, otp } = req.body;
  const user = await User.findOne({ phone, otp });
  if (!user || !user.isActive) {
    return next(new AppError(`Invalid OTP`, 400));
  }

  if (user.OTPExpires < Date.now()) {
    return next(new AppError(`OTP Expires`, 400));
  }

  // Update user status to verified
  await user.save({
    validateBeforeSave: false,
  });
  res.status(200).json({
    status: 'success',
    message: 'OTP verified',
  });
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  const { phone, otp, password, confirmPassword } = req.body;
  const user = await User.findOne({ phone, otp });

  if (!user || !user.isActive) {
    return next(new AppError(`Invalid OTP`, 400));
  }

  if (user.OTPExpires < Date.now()) {
    return next(new AppError(`OTP Expires`, 400));
  }

  user.password = password;
  user.confirmPassword = confirmPassword;
  user.otp = undefined;
  user.OTPExpires = undefined;

  await user.save();
  createSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  if (!user.correctPassword(req.body.currentPassword, user.password)) {
    return next(new AppError('your current password is wrong', 401));
  }

  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  await user.save();
  createSendToken(user, 200, res);
});

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find({});
  res.status(200).json({
    status: 'success',
    users,
  });
});
