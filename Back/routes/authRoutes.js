const express = require('express');
const { signup, login, handlePaymentSuccess } = require('../controllers/authController');
const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/payment-success', handlePaymentSuccess);
module.exports = router;
