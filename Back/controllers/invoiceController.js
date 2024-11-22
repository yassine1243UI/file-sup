const { generateInvoicePDF } = require('./invoiceUtils');
const path = require('path');
const db = require('../config/db');

exports.generateInvoice = async (req, res) => {
    const { invoiceId } = req.params;
    console.log("DEBUG: Received request to generate invoice for invoiceId:", invoiceId);

    try {
        const pdfPath = await generateInvoicePDF(invoiceId);
        console.log("DEBUG: Invoice PDF generated successfully, sending to client.");
        res.download(pdfPath, `invoice_${invoiceId}.pdf`, (err) => {
            if (err) {
                console.error('DEBUG: Error downloading invoice:', err);
                res.status(500).json({ message: 'Error downloading invoice' });
            }
        });
    } catch (error) {
        console.error('DEBUG: Error generating invoice:', error);
        res.status(500).json({ message: 'Error generating invoice', error: error.message });
    }
};


// This function retrieves invoices for a specific user based on user_id
exports.getInvoicesByUserId = async (req, res) => {
    const userId = req.user.user_id; // Get the authenticated user ID

    console.log("DEBUG: Fetching invoices for userId:", userId);  // Debugging line

    try {
        // Query to fetch invoices for the user from the database
        const [invoices] = await db.query(
            'SELECT * FROM invoices WHERE user_id = ?',
            [userId]
        );

        if (invoices.length === 0) {
            console.log("DEBUG: No invoices found for userId:", userId);
            return res.status(404).json({ message: 'No invoices found for this user.' });
        }

        console.log("DEBUG: Invoices retrieved for userId:", userId, invoices);

        // Send the invoices as the response
        res.status(200).json({
            message: 'Invoices retrieved successfully',
            invoices: invoices
        });
    } catch (error) {
        console.error('DEBUG: Error retrieving invoices for userId:', userId, error);
        res.status(500).json({ message: 'Error retrieving invoices', error: error.message });
    }
};

