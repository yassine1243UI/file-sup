const express = require('express');
const { createPaymentIntent } = require('../controllers/paymentController');

const router = express.Router();

<<<<<<< HEAD
// Route pour créer un PaymentIntent
=======
>>>>>>> 2e5465a5d6e81682ad41c143e644b9a6e6c0a175
router.post('/create-payment-intent', createPaymentIntent);

module.exports = router;
