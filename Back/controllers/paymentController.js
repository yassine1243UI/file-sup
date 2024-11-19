const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const db = require('../config/db');

// Crée une intention de paiement pour le plan 20GB
exports.createPaymentIntent = async ({ userId, email, billingAddress, purpose }) => {
    try {
        if (!userId || !email || !billingAddress || !purpose) {
            throw new Error('Missing required fields (userId, email, billingAddress, purpose)');
        }

        const validPurposes = ['registration', 'additional_storage'];
        if (!validPurposes.includes(purpose)) {
            throw new Error(`Invalid purpose. Must be one of: ${validPurposes.join(', ')}`);
        }

        const amount = 2000; // 20 euros en centimes

        console.log(`DEBUG: Creating payment intent for userId=${userId}, purpose=${purpose}`);

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

        console.log(`DEBUG: Payment intent created with ID: ${paymentIntent.id}`);

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

        return paymentIntent.client_secret;
    } catch (error) {
        console.error('Error creating payment intent:', error);
        throw new Error('Payment intent creation failed');
    }
};
