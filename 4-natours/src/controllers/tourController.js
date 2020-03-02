const fs = require('fs');

const Tour = require('./../models/tourModel');

// ROUTE HANDLERS
exports.getAllTours = async (req, res) => {
  try {
    const tours = await Tour.find();

    res.status(200).json({
      status: 'success',
      results: tours.length,
      data: {
        tours // From ES6 if key and value name is same then we need write key-value pair.
      }
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err
    });
  }
};

exports.getTour = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);
    // Tour.findOne({_id: req.params.id})

    res.status(200).json({
      status: 'success',
      results: 1,
      data: {
        tour // From ES6 if key and value name is same then we need write key-value pair.
      }
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err
    });
  }
};

exports.createTour = async (req, res) => {
  try {
    const newTour = await Tour.create(req.body);
    res.status(201).json({
      status: 'success',
      data: {
        tour: newTour
      }
    }); // 201 = crated new resource
  } catch (err) {
    console.log(`ERROR: ${err}`);
    res.status(400).json({
      status: 'fail',
      message: 'Invalid data sent!'
    });
  }
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