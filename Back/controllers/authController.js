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
        const [insertResult] = await db.query(
            'INSERT INTO users (name, email, password_hash, phone, billing_address, plan) VALUES (?, ?, ?, ?, ?, ?)',
            [name, email, hashedPassword, phone, JSON.stringify(billing_address), '20GB']
        );

        const userId = insertResult.insertId;

        // Crée l'intention de paiement
        const clientSecret = await createPaymentIntent({
            userId,
            email,
            billingAddress: billing_address,
            purpose: 'registration'
        });
        

        // Réponse de succès
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

    if (!paymentIntentId) {
        return res.status(400).json({ message: 'PaymentIntentId is required' });
    }

    try {
        console.log(`DEBUG: Retrieving PaymentIntent with ID: ${paymentIntentId}`);
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

        if (!paymentIntent || paymentIntent.status !== 'succeeded') {
            return res.status(400).json({ message: 'Payment not successful or invalid PaymentIntent' });
        }

        const { userId, purpose } = paymentIntent.metadata;

        if (!purpose || (purpose !== 'additional_storage' && purpose !== 'registration')) {
            console.error(`DEBUG: Unknown purpose for PaymentIntent ID: ${paymentIntentId}. Purpose: ${purpose}`);
            return res.status(400).json({ message: 'Unknown purpose for this payment' });
        }

        // Vérifiez si une facture existe pour ce PaymentIntent
        const [invoiceCheck] = await db.query('SELECT * FROM invoices WHERE payment_intent_id = ?', [paymentIntentId]);
        if (!invoiceCheck.length) {
            return res.status(404).json({ message: 'Invoice not found for this payment intent' });
        }

        // Mettre à jour la facture en "paid"
        await db.query('UPDATE invoices SET status = ? WHERE payment_intent_id = ?', ['paid', paymentIntentId]);

        // Gérer les actions selon `purpose`
        if (purpose === 'additional_storage') {
            const additionalStorage = 20480; // 20GB
            const [updateStorageResult] = await db.query(
                'UPDATE users SET total_storage = total_storage + ? WHERE id = ?',
                [additionalStorage, userId]
            );
    
            console.log('DEBUG: Storage updated for user:', updateStorageResult);
    
            const [user] = await db.query('SELECT name, email FROM users WHERE id = ?', [userId]);
            const subject = 'Confirmation d\'achat de stockage supplémentaire';
            const text = `
Bonjour ${user[0].name},

Merci pour votre achat de 20GB supplémentaires pour 20 €. Votre espace de stockage a été augmenté.

Meilleures salutations,  
L'équipe Filesup`;

            await sendEmail(user[0].email, subject, text);
        }

        if (purpose === 'registration') {
            const hashedPassword = await bcrypt.hash(password, 10);
            await db.query('UPDATE users SET password_hash = ? WHERE id = ?', [hashedPassword, userId]);

            const [user] = await db.query('SELECT name, email FROM users WHERE id = ?', [userId]);
            const subject = 'Bienvenue chez Filesup !';
            const text = `
Bonjour ${user[0].name},

Merci pour votre inscription à Filesup. Votre paiement de 20 € pour le plan de 20GB a été traité avec succès.

Bienvenue dans notre communauté,  
L'équipe Filesup`;

            await sendEmail(user[0].email, subject, text);
        }

        res.status(200).json({ message: 'Payment completed successfully' });
    } catch (error) {
        console.error('Error handling payment success:', error);
        res.status(500).json({ message: 'Error handling payment success', error: error.message });
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
        // Commencer une transaction pour garantir la cohérence des données
        await db.query('START TRANSACTION');

        // Récupérer les détails de l'utilisateur
        const [users] = await db.query('SELECT email, name FROM users WHERE id = ?', [userId]);
        if (!users.length) {
            return res.status(404).json({ message: 'User not found' });
        }
        const user = users[0];

        // Récupérer le nombre de fichiers de l'utilisateur
        const [fileCountResult] = await db.query('SELECT COUNT(*) as fileCount FROM files WHERE user_id = ?', [userId]);
        const fileCount = fileCountResult[0]?.fileCount || 0;

        // Supprimer les fichiers de l'utilisateur
        const [files] = await db.query('SELECT path FROM files WHERE user_id = ?', [userId]);
        for (const file of files) {
            try {
                fs.unlinkSync(file.path); // Supprime le fichier du système
            } catch (err) {
                console.error(`Error deleting file: ${file.path}`, err);
            }
        }
        await db.query('DELETE FROM files WHERE user_id = ?', [userId]);

        // Supprimer l'utilisateur de la base de données
        await db.query('DELETE FROM users WHERE id = ?', [userId]);

        // Envoyer un email de confirmation à l'utilisateur
        const userSubject = 'Account Deletion Confirmation';
        const userText = `
        Dear ${user.name},

        Your account has been successfully deleted. All your ${fileCount} files have been permanently removed.

        Thank you for using our service.

        Best regards,  
        FileSup Team`;

        await sendEmail(user.email, userSubject, userText);

        // Récupérer l'email de l'administrateur
        const [admins] = await db.query('SELECT email FROM users WHERE role = ?', ['admin']);
        if (admins.length) {
            const adminEmail = admins[0].email;

            // Envoyer un email à l'administrateur
            const adminSubject = 'User Account Deletion Notification';
            const adminText = `
            Hello Administrator,

            The account of ${user.name} has been deleted, and all ${fileCount} files associated with the account have been permanently removed.

            Best regards,  
            FileSup System`;

            await sendEmail(adminEmail, adminSubject, adminText);
        }

        // Commit de la transaction si tout est réussi
        await db.query('COMMIT');

        res.status(200).json({ message: 'Account and files deleted successfully' });
    } catch (error) {
        console.error('Error deleting account:', error);

        // Rollback de la transaction en cas d'erreur
        await db.query('ROLLBACK');
        res.status(500).json({ message: 'Error deleting account. No changes were made.', error: error.message });
    }
};
