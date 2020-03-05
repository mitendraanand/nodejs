const fs = require('fs');
const express = require('express');
const morgan = require('morgan');
const reteLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const appError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routers/tourRouters');
const userRouter = require('./routers/userRouters');

const app = express();

// GLOBAL MIDDLEWARES
// middleware to set Security.HTTP headers
// e.g. dnsPrefetchControl, frameguard etc.
app.use(helmet());

// Include a simple middleware so that POST request object has the data from client.
// Middleware is just a function that modify the incoming data
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev')); // Logs info about HTTP requests e.g. GET /api/v1/tours/10 200 8.949 ms - 111
}

// RateLimit middleware to limit how many request can come from one IP per hour.
const limiter = reteLimit({
  max: 100,
  windowM: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!'
});
app.use('/api', limiter);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' })); // body larger than 10 Kilo Byte is not accepted. Security!!!

// MIDDLEWARE for Data Sanitization against NoSQL query injection
// mongoSanitize() will remove all '$' and '.' from the body.
// this will help the situation when {"$gt": ""} as email was able
// to pull users for any easily guessable password in the system
app.use(mongoSanitize());

// MIDDLEWARE for Data Sanitization again Cross Site Scripting(XSS)
// Cleans any user input from malasciouse html
app.use(xss());

// MIDDLEWARE for HTTP Parameter Polution
// e.g. {{URL}}/api/v1/tours?sort=duration&sort=price
// sorting twice breaks the API
// But this breaks sort=duration5&duration=7
// So we can whitelist 'duration'
app.use(
  hpp({
    whitelist: ['duration', 'ratingAverage', '']
  })
);

// MIDDLEWARE to allow to serve static html/img/etc files.
app.use(express.static(`${__dirname}/public`));

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();

  next();
});

// ROUTES
app.use('/api/v1/tours', tourRouter); // Mounting the router
app.use('/api/v1/users', userRouter); // Mounting the router

// handling bad requests
app.all('*', (req, res, next) => {
  // whenever we pass anything it will be assumed that there is ERROR.
  // all the middleware will be skipped and the ERROR MIDDLEWARE will be
  // executed.
  next(new appError(`can't find the ${req.originalUrl} on this server!`, 404));
});

// globalErrorHandler has 4 parameters so express already knows that
// this is ERROR handling MIDDLEWARE
app.use(globalErrorHandler);

module.exports = app;

// app.get('/', (req, res) => {
//   res
//     .status(200)
//     .json({ message: 'Hello from the server side.', app: 'Natours' });
// });

// app.post('/', (req, res) => {
//   res.send('You can post to this endpoint..');
// });

// ROUTES

// app.get('/api/v1/tours', getAllTours);
// app.get('/api/v1/tours/:id', getTour); // '/api/v1/tours/:id/:x/:y?' there can be multiple params, the ones with ? are optionals
// app.post('/api/v1/tours', createTour);
// app.patch('/api/v1/tours/:id', updateTour);
// app.delete('/api/v1/tours/:id', deleteTour);
