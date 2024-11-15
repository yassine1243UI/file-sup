const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const db = require('../config/db');

// Crée une intention de paiement pour le plan 20GB
exports.createPaymentIntent = async (userId, email, billingAddress) => {
    try {
        const amount = 2000; // 20 euros en centimes
        const storageLimit = 20480; // 20 GB en MB

        console.log('DEBUG: Starting to create a payment intent');
        console.log(`DEBUG: userId=${userId}, email=${email}, billingAddress=${JSON.stringify(billingAddress)}`);

        const paymentIntent = await stripe.paymentIntents.create({
            amount,
            currency: 'eur',
            payment_method_types: ['card'],
            metadata: {
                userId: userId, // Correction : Utilisation du `userId` directement passé en paramètre
                email: email,
                billingAddress: JSON.stringify(billingAddress),
                plan: '20GB',
                storageLimit,
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
            '20GB',
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
