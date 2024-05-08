const express = require('express');
const { protect, restrictTo } = require('../controllers/authController');
const {
  getAllProducts,
  getProduct,
  addProduct,
  updateProduct,
  deleteProduct,
  deleteAllProduct,
} = require('../controllers/productController');
const router = express.Router();

router
  .route('/product')
  .get(getAllProducts)
  .post(protect, restrictTo('super-admin'), addProduct)
  .delete(protect, restrictTo('super-admin'), deleteAllProduct);

router
  .route('/product/:id')
  .get(protect, restrictTo('super-admin'), getProduct)
  .patch(protect, restrictTo('super-admin'), updateProduct)
  .delete(protect, restrictTo('super-admin'), deleteProduct);

module.exports = router;
