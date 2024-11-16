const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { createPaymentIntent } = require('./paymentController');
const { sendEmail, sendRegistrationEmail } = require('./mailUtils');


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
    const { paymentIntentId, password } = req.body;

    if (!paymentIntentId || !password) {
        return res.status(400).json({ message: 'PaymentIntentId and password are required' });
    }

    try {
        console.log(`DEBUG: Retrieving PaymentIntent with ID: ${paymentIntentId}`);
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

        if (!paymentIntent) {
            console.error(`DEBUG: Payment intent ${paymentIntentId} not found`);
            return res.status(404).json({ message: 'Payment Intent not found' });
        }

        console.log('DEBUG: PaymentIntent status:', paymentIntent.status);

        const { userId } = paymentIntent.metadata;

        // Check if the payment has already succeeded
        if (paymentIntent.status === 'succeeded') {
            console.log('DEBUG: PaymentIntent already succeeded. Updating invoice...');

            const [result] = await db.query(
                'UPDATE invoices SET status = ? WHERE payment_intent_id = ?',
                ['paid', paymentIntentId]
            );

            if (result.affectedRows === 0) {
                console.error(`DEBUG: Invoice update failed for PaymentIntent ID: ${paymentIntentId}`);
                return res.status(500).json({ message: 'Failed to update invoice status' });
            }

            console.log(`DEBUG: Invoice updated to 'paid' for PaymentIntent ID: ${paymentIntentId}`);
            return res.status(200).json({ message: 'Payment already completed and invoice updated' });
        }

        // If the status is not succeeded, check if confirmation is required
        if (paymentIntent.status !== 'requires_confirmation') {
            console.error(
                `DEBUG: PaymentIntent cannot be confirmed in its current state: ${paymentIntent.status}`
            );
            return res.status(400).json({
                message: `PaymentIntent cannot be processed in its current state: ${paymentIntent.status}`,
            });
        }

        // Hash the password and update the user information
        const hashedPassword = await bcrypt.hash(password, 10);
        await db.query('UPDATE users SET password_hash = ? WHERE id = ?', [hashedPassword, userId]);

        // Update the invoice status to paid
        const [invoiceResult] = await db.query(
            'UPDATE invoices SET status = ? WHERE payment_intent_id = ?',
            ['paid', paymentIntentId]
        );

        if (invoiceResult.affectedRows === 0) {
            console.error(`DEBUG: Failed to update invoice for PaymentIntent ID: ${paymentIntentId}`);
            return res.status(500).json({ message: 'Failed to update invoice status' });
        }

        console.log(`DEBUG: User and invoice updated successfully for PaymentIntent ID: ${paymentIntentId}`);
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
        // Get user data
        const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (!users.length) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        const user = users[0];

        // Check password
        const validPassword = await bcrypt.compare(password, user.password_hash);
        if (!validPassword) {
            return res.status(400).json({ message: 'Invalid password' });
        }

        // Check payment status
        const [invoices] = await db.query(
            'SELECT status FROM invoices WHERE user_id = ? ORDER BY created_at DESC LIMIT 1',
            [user.id]
        );

        if (!invoices.length || invoices[0].status !== 'paid') {
            return res.status(403).json({ message: 'Access denied. Please complete your payment.' });
        }

        // Generate token if all checks pass
        const token = jwt.sign({ user_id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.json({ token });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Error during login process', error: error.message });
    }
};


exports.deleteAccount = async (req, res) => {
    const { userId } = req.user;

    try {
        // Start a transaction
        await db.query('START TRANSACTION');

        // Get user details
        const [users] = await db.query('SELECT email, name FROM users WHERE id = ?', [userId]);
        if (!users.length) {
            return res.status(404).json({ message: 'User not found' });
        }
        const user = users[0];

        // Get count of user files
        const [fileCountResult] = await db.query('SELECT COUNT(*) as fileCount FROM files WHERE user_id = ?', [userId]);
        const fileCount = fileCountResult[0]?.fileCount || 0;

        // Delete user files
        await db.query('DELETE FROM files WHERE user_id = ?', [userId]);

        // Delete user record
        await db.query('DELETE FROM users WHERE id = ?', [userId]);

        // Send confirmation email
        const subject = 'Account Deletion Confirmation';
        const text = `
        Dear ${user.name},
        
        Your account has been successfully deleted. All your ${fileCount} files have been permanently removed.
        
        Thank you for using our service.
        
        Best regards,  
        FileSup Team`;

        console.log('DEBUG: Sending email to:', user.email);
        await sendEmail(user.email, subject, text);
        console.log('DEBUG: Email sent successfully');

        // Commit the transaction if everything succeeds
        await db.query('COMMIT');

        res.status(200).json({ message: 'Account and files deleted successfully' });
    } catch (error) {
        console.error('Error deleting account:', error);

        // Roll back the transaction in case of an error
        await db.query('ROLLBACK');
        res.status(500).json({ message: 'Error deleting account. No changes were made.', error: error.message });
    }
};
