const fs = require('fs');
const express = require('express');

const tourController = require('./../controllers/tourController');

const router = express.Router(); // A sub App for Tours resources

router
  .route('/top-5-cheap')
  .get(tourController.aliasTopTours, tourController.getAllTours); // Middleware

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
