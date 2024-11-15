const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { createPaymentIntent } = require('./paymentController');
const { sendRegistrationEmail } = require('./mailUtils');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Fonction pour insérer un utilisateur dans la base de données
const insertUser = async (name, email, hashedPassword, phone, billingAddress, plan) => {
    const [result] = await db.query(
        'INSERT INTO users (name, email, password_hash, phone, billing_address, plan) VALUES (?, ?, ?, ?, ?, ?)',
        [name, email, hashedPassword, phone, JSON.stringify(billingAddress), plan]
    );
    return result.insertId;
};

exports.signup = async (req, res) => {
    const { name, email, password, phone, billing_address } = req.body;

    if (!name || !email || !password || !phone || !billing_address) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        // Vérifie si l'utilisateur existe déjà
        const [userExists] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (userExists.length > 0) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash du mot de passe
        const hashedPassword = await bcrypt.hash(password, 10);

        // Crée l'utilisateur dans la base de données
        const userId = await insertUser(name, email, hashedPassword, phone, billing_address, '20GB');

        // Crée l'intention de paiement
        const clientSecret = await createPaymentIntent(userId, email, billing_address);

        // Envoie l'e-mail de confirmation
        await sendRegistrationEmail(email, name, 20, 20480);

        res.status(201).json({
            message: 'Signup and payment successful',
            clientSecret,
        });
    } catch (error) {
        console.error('Signup/payment error:', error);
        res.status(500).json({ message: 'Error during signup/payment process', error: error.message });
    }
};

exports.handlePaymentSuccess = async (req, res) => {
    console.log('DEBUG: Entering handlePaymentSuccess');
    console.log('DEBUG: Request body:', req.body);

    const { paymentIntentId, password } = req.body;

    if (!paymentIntentId || !password) {
        console.error('DEBUG: Missing paymentIntentId or password');
        return res.status(400).json({ message: 'PaymentIntentId and password are required' });
    }

    try {
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
        console.log('DEBUG: Payment intent retrieved:', paymentIntent);

        if (!paymentIntent) {
            console.error(`DEBUG: Payment intent ${paymentIntentId} not found`);
            return res.status(404).json({ message: 'Payment Intent not found' });
        }

        if (paymentIntent.status !== 'succeeded') {
            console.error(`DEBUG: Payment not successful. Status: ${paymentIntent.status}`);
            return res.status(400).json({ message: 'Payment not successful' });
        }

        const { userId } = paymentIntent.metadata;

        // Mettre à jour la facture dans la base
        await db.query('UPDATE invoices SET status = ? WHERE payment_intent_id = ?', ['paid', paymentIntentId]);
        console.log('DEBUG: Invoice updated to paid for paymentIntentId:', paymentIntentId);

        // Hacher le mot de passe pour des raisons de sécurité
        const hashedPassword = await bcrypt.hash(password, 10);

        // Mettre à jour l'utilisateur dans la base
        await db.query('UPDATE users SET password_hash = ? WHERE id = ?', [hashedPassword, userId]);
        console.log('DEBUG: User password updated for userId:', userId);

        res.status(201).json({ message: 'Payment successful and user registered' });
    } catch (err) {
        console.error('DEBUG: Error in handlePaymentSuccess:', err);
        res.status(500).json({ message: 'Error completing payment success process', error: err.message });
    }
};



exports.login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    try {
        const getUserQuery = 'SELECT * FROM users WHERE email = ?';
        const [result] = await db.query(getUserQuery, [email]);

        if (!result.length) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const user = result[0];
        const validPassword = await bcrypt.compare(password, user.password_hash);

        if (!validPassword) {
            return res.status(400).json({ message: 'Invalid password' });
        }

        const token = jwt.sign({ user_id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.json({ token });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Error during login process', error: error.message });
    }
};
