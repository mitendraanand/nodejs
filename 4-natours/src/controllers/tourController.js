const fs = require('fs');

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
);

// MIDDLEWARE to handle the validations of id, if sent
exports.checkID = (req, res, next, val) => {
  if (req.params.id * 1 > tours.length) {
    return res.status(404).json({ status: 'fail', message: 'invalid id' });
  }
  next();
};

// ROUTE HANDLERS
exports.getAllTours = (req, res) => {
  res.status(200).json({
    status: 'success',
    results: tours.length,
    requestedTime: req.requestTime,
    data: {
      tours // From ES6 if key and value name is same then we need write key-value pair.
    }
  });
};

exports.getTour = (req, res) => {
  console.log(req.params);

  id = req.params.id * 1; //JS trick to conver string to number
  // find takes a callback wchich runs the equality check on each element of the array
  const tour = tours.find(el => el.id === id);

  res.status(200).json({
    status: 'success',
    results: 1,
    data: {
      tour // From ES6 if key and value name is same then we need write key-value pair.
    }
  });
};

exports.createTour = (req, res) => {
  //console.log(req.body);

  const newId = tours[tours.length - 1].id + 1;
  const newTour = Object.assign({ id: newId }, req.body); // Did not want to mutate the original body object.

  tours.push(newTour);
  fs.writeFile(
    `${__dirname}/../dev-data/data/tours-simple.json`,
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

exports.updateTour = (req, res) => {
  // not doing the code as it's simple java script stuff to read the json file and update.
  // simply sendign the response.

  res
    .status(200)
    .json({ status: 'success', data: { tour: '<updated the tour...>' } });
};

exports.deleteTour = (req, res) => {
  // not doing the code as it's simple java script stuff to read the json file and update.
  // simply sendign the response.

  res.status(204).json({ status: 'success', data: null });
};
