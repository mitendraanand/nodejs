const express = require('express');

const userController = require('./../controllers/userController');
const authController = require('./../controllers/authController');

const router = express.Router(); // A sub App for Users resources

// SPECIAL USER RELATED ROUTES
router.post('/signup', authController.signup);
router.post('/login', authController.login);

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
