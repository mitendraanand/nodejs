class AppError extends Error {
  constructor(message, statusCode) {
    super(message);

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    // When a new object is created and there is constructor called
    // the constructor call will not show in the stack to not pollute.
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
