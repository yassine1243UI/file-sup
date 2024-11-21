const express = require('express');
const { signup, login , handlePaymentSuccess, deleteAccount  } = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');
const { generateInvoice } = require('../controllers/invoiceController');
const router = express.Router();

// Routes publiques
router.post('/signup', signup);
router.post('/login', login);
router.post('/payment-success', handlePaymentSuccess);
router.delete('/delete-account', authMiddleware, deleteAccount);
router.get('/invoice/:invoiceId', authMiddleware,  generateInvoice);
// Route protégée (exemple)
router.get('/protected', authMiddleware, (req, res) => {
    res.status(200).json({ message: 'You have accessed a protected route!', user: req.user });
});

<<<<<<< HEAD
=======

// Tester la clé secrète et créer une intention de paiement
router.get('/test-payment', async (req, res) => {
  const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

  try {
    // Créer une intention de paiement pour tester la clé
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 2000, // 20 EUR
      currency: 'eur',
      payment_method_types: ['card'],
    });

    console.log('Payment Intent Created:', paymentIntent);
    res.status(200).json({ message: 'Payment intent created successfully', paymentIntent });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({ message: 'Error creating payment intent', error: error.message });
  }
});

module.exports = router;

>>>>>>> 2e5465a5d6e81682ad41c143e644b9a6e6c0a175
module.exports = router;
