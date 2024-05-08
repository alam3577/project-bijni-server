const express = require('express');
const {
  login,
  logout,
  protect,
  singnup,
  verifyOTP,
  resetPassword,
  updatePassword,
  forgotPassword,
  verifyResetPasswordOTP,
  getAllUsers,
  restrictTo,
} = require('../controllers/authController');

const router = express.Router();

router.post('/login', login);
router.post('/verify-otp', verifyOTP);
router.post('/signup', singnup);
router.get('/logout', logout);
router.post('/forgot-password', forgotPassword);
router.post('/verify-reset-password-otp', verifyResetPasswordOTP);
router.post('/reset-password', resetPassword);
router.post('/update-password', protect, updatePassword);
router.post(
  '/get-all-users',
  protect,
  restrictTo('admin', 'super-admin'),
  getAllUsers
);

module.exports = router;
