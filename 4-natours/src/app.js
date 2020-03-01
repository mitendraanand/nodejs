const fs = require('fs');
const express = require('express');
const morgan = require('morgan');

const app = express();

// 1) MIDDLEWARES
// Include a simple middleware so that POST request object has the data from client.
// Middleware is just a function that modify the incoming data
app.use(morgan('dev')); // Logs info about HTTP requests e.g. GET /api/v1/tours/10 200 8.949 ms - 111
app.use(express.json());
app.use((req, res, next) => {
  console.log('Hello from middleware');
  next();
});
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// app.get('/', (req, res) => {
//   res
//     .status(200)
//     .json({ message: 'Hello from the server side.', app: 'Natours' });
// });

// app.post('/', (req, res) => {
//   res.send('You can post to this endpoint..');
// });

// 2) ROUTE HANDLERS
const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`)
);

const getAllTours = (req, res) => {
  res.status(200).json({
    status: 'success',
    results: tours.length,
    requestedTime: req.requestTime,
    data: {
      tours // From ES6 if key and value name is same then we need write key-value pair.
    }
  });
};

const getAllUsers = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not implemented'
  });
};

const createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not implemented'
  });
};

const getUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not implemented'
  });
};

const updateUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not implemented'
  });
};

const deleteUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not implemented'
  });
};

const getTour = (req, res) => {
  console.log(req.params);

  const id = req.params.id * 1; // JS trick to convert string to integer.
  // find takes a callback wchich runs the equality check on each element of the array
  const tour = tours.find(el => el.id === id);
  if (!tour) {
    return res.status(404).json({ status: 'fail', message: 'invalid id' });
  }

  res.status(200).json({
    status: 'success',
    results: 1,
    data: {
      tour // From ES6 if key and value name is same then we need write key-value pair.
    }
  });
};

const createTour = (req, res) => {
  //console.log(req.body);

  const newId = tours[tours.length - 1].id + 1;
  const newTour = Object.assign({ id: newId }, req.body); // Did not want to mutate the original body object.

  tours.push(newTour);
  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    err => {
      res.status(201).json({
        status: 'success',
        data: {
          tour: newTour
        }
      }); // 201 = crated new resource
    }
  );
};

const updateTour = (req, res) => {
  // not doing the code as it's simple java script stuff to read the json file and update.
  // simply sendign the response.
  const id = req.params.id * 1; // JS trick to convert string to integer.
  // find takes a callback wchich runs the equality check on each element of the array
  const tour = tours.find(el => el.id === id);
  if (!tour) {
    return res.status(404).json({ status: 'fail', message: 'invalid id' });
  }

  res
    .status(200)
    .json({ status: 'success', data: { tour: '<updated the tour...>' } });
};

const deleteTour = (req, res) => {
  // not doing the code as it's simple java script stuff to read the json file and update.
  // simply sendign the response.
  const id = req.params.id * 1; // JS trick to convert string to integer.
  // find takes a callback wchich runs the equality check on each element of the array
  const tour = tours.find(el => el.id === id);
  if (!tour) {
    return res.status(404).json({ status: 'fail', message: 'invalid id' });
  }

  res.status(204).json({ status: 'success', data: null });
};

// 3) ROUTES

// app.get('/api/v1/tours', getAllTours);
// app.get('/api/v1/tours/:id', getTour); // '/api/v1/tours/:id/:x/:y?' there can be multiple params, the ones with ? are optionals
// app.post('/api/v1/tours', createTour);
// app.patch('/api/v1/tours/:id', updateTour);
// app.delete('/api/v1/tours/:id', deleteTour);

const tourRouter = express.Router(); // A sub App for Tours resources
app.use('/api/v1/tours', tourRouter); // Mounting the router

tourRouter
  .route('/')
  .get(getAllTours)
  .post(createTour);

tourRouter
  .route('/:id')
  .get(getTour)
  .patch(updateTour)
  .delete(deleteTour);


const userRouter = express.Router(); // A sub App for Users resources
app.use('/api/v1/users', userRouter);  // Mounting the router

userRouter
  .route('/')
  .get(getAllUsers)
  .post(createUser);

userRouter
  .route('/:id')
  .get(getUser)
  .patch(updateUser)
  .delete(deleteUser);

// START THE SERVER
const port = 3000;
app.listen(port, () => {
  console.log(`App running on ${port}...`);
});