// 'catchAsync' is an improvement over having each RouteHandler function to have it's own try catch.
// 'fn' is an async function that return PROMISE so having a catch will let it caputure the
// REJECTED promises that may arise due to ERROR. Doing next(err) will take the error handling
// to global error handler.
module.exports = fn => {
  return (req, res, next) => {
    fn(req, res, next).catch(next); // 'catch(next)' is equivalent to 'catch(err => next(err))'
  };
};
