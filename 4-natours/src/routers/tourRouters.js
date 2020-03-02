const fs = require('fs');
const express = require('express');

const tourController = require('./../controllers/tourController');

const router = express.Router(); // A sub App for Tours resources

// router.param('id', tourController.checkID); // Another middle ware to look into parameters and validate.

router
  .route('/')
  .get(tourController.getAllTours)
  .post(tourController.createTour); 

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(tourController.deleteTour);

module.exports = router;
