const fs = require('fs');
const express = require('express');

const app = express();

// Include a simple middleware so that POST request object has the data from client.
// Middleware is just a function that modify the incoming data
app.use(express.json());

// app.get('/', (req, res) => {
//   res
//     .status(200)
//     .json({ message: 'Hello from the server side.', app: 'Natours' });
// });

// app.post('/', (req, res) => {
//   res.send('You can post to this endpoint..');
// });

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`)
);

app.get('/api/v1/tours', (req, res) => {
  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      tours // From ES6 if key and value name is same then we need write key-value pair.
    }
  });
});

app.post('/api/v1/tours', (req, res) => {
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
});

// '/api/v1/tours/:id/:x/:y?' there can be multiple params, the ones with ? are optionals
app.get('/api/v1/tours/:id', (req, res) => {
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
});

const port = 3000;
app.listen(port, () => {
  console.log(`App running on ${port}...`);
});
