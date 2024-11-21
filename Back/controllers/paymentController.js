const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const db = require('../config/db');

// Crée une intention de paiement pour le plan 20GB
exports.createPaymentIntent = async (req, res) => {
    try {
        const { userId, email, billingAddress, purpose } = req.body;

        // Vérification des données requises
        if (!userId || !email || !billingAddress || !purpose) {
            return res.status(400).json({ message: 'Missing required fields (userId, email, billingAddress, purpose)' });
        }

        // Vérification des valeurs possibles pour `purpose`
        const validPurposes = ['registration', 'additional_storage'];
        if (!validPurposes.includes(purpose)) {
            return res.status(400).json({ message: `Invalid purpose. Must be one of: ${validPurposes.join(', ')}` });
        }

        const amount = 2000; // 20 euros en centimes
        const storageLimit = 20480; // 20 GB en MB

        console.log('DEBUG: Starting to create a payment intent');
        console.log(`DEBUG: userId=${userId}, email=${email}, billingAddress=${JSON.stringify(billingAddress)}, purpose=${purpose}`);

        const paymentIntent = await stripe.paymentIntents.create({
            amount,
            currency: 'eur',
            payment_method_types: ['card'],
            metadata: {
                userId,
                email,
                purpose,
                billingAddress: JSON.stringify(billingAddress),
                plan: purpose === 'additional_storage' ? 'Additional Storage' : '20GB',
            },
        });

        console.log('DEBUG: Payment intent created:', paymentIntent.id);

        // Insère une facture dans la base de données
        const query = `
            INSERT INTO invoices (user_id, amount, plan, currency, status, payment_intent_id) 
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        const values = [
            userId,
            amount / 100, // Convertir en euros
            purpose === 'additional_storage' ? 'Additional Storage' : '20GB',
            'EUR',
            'pending',
            paymentIntent.id,
        ];

        const [result] = await db.query(query, values);
        console.log('DEBUG: Invoice inserted:', result);

        res.status(200).json({
            clientSecret: paymentIntent.client_secret,
            message: 'Payment intent created successfully',
        });
    } catch (error) {
        console.error('Error creating payment intent:', error);
        res.status(500).json({ message: 'Error creating payment intent', error: error.message });
    }
};
