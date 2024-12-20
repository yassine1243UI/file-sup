const express = require('express');
const { signup, login , handlePaymentSuccess, deleteAccount,getStorageStats,increaseStorage,getUserProfile  } = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');
const { generateInvoice , getInvoicesByUserId} = require('../controllers/invoiceController');
const router = express.Router();
// router.delete('/delete-account', authMiddleware, deleteAccount);
router.get('/profile', authMiddleware, getUserProfile);
router.delete('/delete-account', (req, res, next) => {
  console.log("DEBUG: DELETE request to /delete-account");
  next();  // Proceed to the next middleware
}, authMiddleware, deleteAccount);
router.post('/increase-storage', authMiddleware, increaseStorage);
router.get('/invoices', authMiddleware, getInvoicesByUserId);
// Routes publiques
router.get('/storage-stats', authMiddleware, getStorageStats);
router.post('/signup', signup);
router.post('/login', login);
router.post('/payment-success', handlePaymentSuccess);
// router.delete('/delete-account', authMiddleware, deleteAccount);
router.get('/invoice/:invoiceId', authMiddleware,  generateInvoice);
// router.get('/invoice/:invoiceId', authMiddleware, (req, res, next) => {
//   console.log("DEBUG: Incoming request for generating invoice");
//   next();
// }, generateInvoice);
// Route protégée (exemple)
router.get('/protected', authMiddleware, (req, res) => {
    res.status(200).json({ message: 'You have accessed a protected route!', user: req.user });
});


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

module.exports = router;
