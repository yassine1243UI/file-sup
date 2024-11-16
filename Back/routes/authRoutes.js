const express = require('express');
const { signup, login , handlePaymentSuccess, deleteAccount  } = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Routes publiques
router.post('/signup', signup);
router.post('/login', login);
router.post('/payment-success', handlePaymentSuccess);
router.delete('/delete-account', authMiddleware, deleteAccount);
// Route protégée (exemple)
router.get('/protected', authMiddleware, (req, res) => {
    res.status(200).json({ message: 'You have accessed a protected route!', user: req.user });
});

module.exports = router;
