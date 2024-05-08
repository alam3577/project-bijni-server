const express = require('express');
const { protect, restrictTo } = require('../controllers/authController');
const {
  getAllAvailableLocation,
  addLocation,
  updateLocation,
  deleteLocation,
} = require('../controllers/locationControllers');
const router = express.Router();

router
  .route('/location')
  .get(getAllAvailableLocation)
  .post(protect, restrictTo('admin', 'super-admin'), addLocation);

router
  .route('/location/:id')
  .delete(protect, restrictTo('admin', 'super-admin'), deleteLocation)
  .patch(protect, restrictTo('admin', 'super-admin'), updateLocation);

module.exports = router;
