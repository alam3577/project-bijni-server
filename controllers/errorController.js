const AppError = require('../utils/AppError');

const ErrorProduction = (res, error) => {
  console.log('ERROR IN PRODUCTION');
  if (error.isOperational) {
    res.status(error.statusCode).json({
      status: error.status,
      message: error.message,
    });
  } else {
    console.log(error);
    res.status(500).json({
      status: 'error',
      message: 'Something gone wrong',
    });
  }
};

const ErrorDevelopment = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    error: err,
    stack: err.stack,
  });
};

const handleCastErrorDB = (error) => {
  const message = `Invalid ${error.path}: ${error.value}`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (error) => {
  const message = `Duplicate Input Fields: ${error.keyValue.name} please use Another value`;
  return new AppError(message, 400);
};

const handleTokenError = () =>
  new AppError(`Invalid token. Please login again !`, 401);

const handleValidationErrorDB = (error) => {
  const value = Object.values(error.errors)
    .map((err) => err.message)
    .join('. ');
  return new AppError(value, 400);
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') ErrorDevelopment(err, res);

  if (process.env.NODE_ENV.trim() === 'production') {
    console.log({ err: err.message });
    // eslint-disable-next-line node/no-unsupported-features/es-syntax
    let error = { ...err };
    error.name = err.name;
    error.message = err.message;

    // for invalid ids
    if (error.name === 'CastError') {
      error = handleCastErrorDB(error);
    }

    // for duplicate fields
    if (error.code === 11000) {
      error = handleDuplicateFieldsDB(error);
    }

    // for Input validation (mongoose validation)
    if (error.name === 'ValidationError') {
      error = handleValidationErrorDB(error);
    }
    if (error.name === 'JsonWebTokenError') error = handleTokenError(error);

    ErrorProduction(res, error);
  }
};
