const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/login', authController.login);
router.post('/forgot', authController.forgotPassword);
router.post('/reset/:token', authController.resetPassword);
router.post('/register', authController.register);

module.exports = router; 