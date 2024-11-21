const db = require('../config/db');

const verifyPayment = async (req, res, next) => {
    const { userId } = req.user; // Ensure userId is retrieved from `authMiddleware`

    try {
        // Check the latest invoice for the user
        const [invoices] = await db.query(
            'SELECT status FROM invoices WHERE user_id = ? ORDER BY created_at DESC LIMIT 1',
            [userId]
        );

        if (!invoices.length) {
            console.error('DEBUG: No invoices found for user:', userId);
            return res.status(403).json({ message: 'Access denied. Please complete your payment.' });
        }

        const latestInvoice = invoices[0];

        if (latestInvoice.status !== 'paid') {
            console.error('DEBUG: Invoice status is not paid:', latestInvoice.status);
            return res.status(403).json({ message: 'Access denied. Please complete your payment.' });
        }

        console.log('DEBUG: Invoice verified as paid for user:', userId);
        next(); // Allow access to the route
    } catch (error) {
        console.error('Error verifying payment:', error);
        res.status(500).json({ message: 'Error verifying payment', error: error.message });
    }
};

module.exports = verifyPayment;
