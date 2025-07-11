const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { auth } = require('../middleware/auth');

router.post('/login', authController.login);
router.post('/forgot', authController.forgotPassword);
router.post('/reset/:token', authController.resetPassword);
router.post('/register', authController.register);
router.post('/change-password', auth, authController.changePassword);

module.exports = router; 