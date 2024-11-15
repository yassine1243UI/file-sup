const db = require('../config/db');

const verifyPayment = async (req, res, next) => {
    const userId = req.user.id;

    try {
        const [invoices] = await db.query(
            'SELECT status FROM invoices WHERE user_id = ? ORDER BY created_at DESC LIMIT 1',
            [userId]
        );

        if (!invoices.length || invoices[0].status !== 'paid') {
            return res.status(403).json({ message: 'Access denied. Please complete your payment.' });
        }

        next();
    } catch (error) {
        console.error('Error verifying payment:', error);
        res.status(500).json({ message: 'Error verifying payment', error: error.message });
    }
};

module.exports = verifyPayment;
