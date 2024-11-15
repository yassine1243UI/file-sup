const express = require('express');
const { createPaymentIntent } = require('../controllers/paymentController');

const router = express.Router();

// Route pour créer un PaymentIntent
router.post('/create-payment-intent', createPaymentIntent);

module.exports = router;
