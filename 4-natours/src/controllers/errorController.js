const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    error: err,
    status: err.status,
    message: err.message,
    stack: err.stack
  });
};

const sendErrorProd = (err, res) => {
  // Oeprational, trusted error: send message to client
  if (err.isOperationl) {
    res.status(err.statusCode).json({
      error: err,
      status: err.status
    });

    // Programming or other unknown error: don't want to leak error details
  } else {
    // Log the error
    console.error('ERROR', err);
    // Send a generic message
    res.status(500).json({
      status: 'error',
      message: 'something went very error'
    });
  }
};

// By providing 4 parameter express already knows that this is ERROR
// handling MIDDLEWARE
module.exports = (err, req, res, next) => {
  //console.log(err.stack);

  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    sendErrorProd(err, res);
  }
};
