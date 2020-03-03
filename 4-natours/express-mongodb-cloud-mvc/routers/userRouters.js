const express = require('express')

const userController = require('./../controllers/userController');

const router = express.Router(); // A sub App for Users resources

router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);

router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

  module.exports = router;