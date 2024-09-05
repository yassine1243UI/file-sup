const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Signup user with plan selection and Stripe payment intent creation
// Create Stripe payment intent with no redirect-based payment methods
exports.signup = async (req, res) => {
    const { name, email, password, phone, billing_address, plan } = req.body;
    
    // Check if user already exists
    const checkUserQuery = 'SELECT * FROM users WHERE email = ?';
    db.query(checkUserQuery, [email], async (err, result) => {
        if (result.length) return res.status(400).json({ message: 'User already exists' });

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Define plans with updated base plan price
        const plans = {
            base: { storageLimit: 20480, price: 20 },  // 20 GB for €20
            premium: { storageLimit: 51200, price: 50 },  // 50 GB for €50
            pro: { storageLimit: 102400, price: 100 }  // 100 GB for €100
        };

        const selectedPlan = plans[plan];
        if (!selectedPlan) {
            return res.status(400).json({ message: 'Invalid plan selected' });
        }

        try {
            // Create Stripe payment intent without redirect-based payment methods
            const paymentIntent = await stripe.paymentIntents.create({
                amount: selectedPlan.price * 100,  // Price in cents
                currency: 'eur',
                payment_method_types: ['card'],
                automatic_payment_methods: {
                    enabled: true,
                    allow_redirects: 'never'
                },
                metadata: {
                    name: name,
                    email: email,
                    storageLimit: selectedPlan.storageLimit,
                    phone: phone,
                    billing_address: JSON.stringify(billing_address)
                }
            });

            res.status(200).json({
                message: 'Payment intent created successfully, no redirection required.',
                // clientSecret: paymentIntent.client_secret  // You might want to handle this differently depending on your security setup
            });
        } catch (err) {
            console.log("Error creating payment intent: ", err);
            res.status(500).json({
                message: 'Error creating payment intent',
                error: err.message
            });
        }
    });
};


// Handle payment success and complete the registration
exports.handlePaymentSuccess = async (req, res) => {
    const { paymentIntentId, password } = req.body;

    try {
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

        const { name, email, storageLimit, phone, billing_address } = paymentIntent.metadata;
        const hashedPassword = await bcrypt.hash(password, 10);

        const insertUserQuery = 'INSERT INTO users (name, email, password_hash, storageLimit, phone, billing_address) VALUES (?, ?, ?, ?, ?, ?)';
        db.query(insertUserQuery, [name, email, hashedPassword, storageLimit, phone, JSON.parse(billing_address)], (err, result) => {
            if (err) {
                console.log("Database error: ", err);
                return res.status(500).json({ message: 'Error creating user' });
            }

            res.status(201).json({ message: 'User registered successfully after payment' });
        });
    } catch (err) {
        console.log("Error retrieving payment intent: ", err);
        return res.status(500).json({ message: 'Error retrieving payment intent', error: err.message });
    }
};

// Login user
exports.login = async (req, res) => {
    const { email, password } = req.body;

    const getUserQuery = 'SELECT * FROM users WHERE email = ?';
    db.query(getUserQuery, [email], async (err, result) => {
        if (err || !result.length) return res.status(400).json({ message: 'Invalid credentials' });

        const user = result[0];
        const validPassword = await bcrypt.compare(password, user.password_hash);
        if (!validPassword) return res.status(400).json({ message: 'Invalid password' });

        const token = jwt.sign({ user_id: user.user_id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token });
    });
};
