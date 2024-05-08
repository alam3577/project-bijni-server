const express = require('express');
const { protect, restrictTo } = require('../controllers/authController');
const {
  uploadProductImage,
  removeProductImage,
} = require('../controllers/productController');

const router = express.Router();

router.post(
  '/upload-image',
  protect,
  restrictTo('super-admin'),
  uploadProductImage
);
router.post(
  '/remove-image',
  protect,
  restrictTo('super-admin'),
  removeProductImage
);

module.exports = router;
