const fs = require('fs');
const express = require('express');
const morgan = require('morgan');

const appError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routers/tourRouters');
const userRouter = require('./routers/userRouters');

const app = express();

// MIDDLEWARES
// Include a simple middleware so that POST request object has the data from client.
// Middleware is just a function that modify the incoming data
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev')); // Logs info about HTTP requests e.g. GET /api/v1/tours/10 200 8.949 ms - 111
}

app.use(express.json());
app.use(express.static(`${__dirname}/public`)); // MIDDLEWARE to allow to serve static html/img/etc files.

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
