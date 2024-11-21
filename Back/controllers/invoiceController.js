const { generateInvoicePDF } = require('./invoiceUtils');
const path = require('path');
const db = require('../config/db');
exports.generateInvoice = async (req, res) => {
    const { invoiceId } = req.params;

    try {
        const pdfPath = await generateInvoicePDF(invoiceId);
        res.download(pdfPath, `invoice_${invoiceId}.pdf`, (err) => {
            if (err) {
                console.error('Error downloading invoice:', err);
                res.status(500).json({ message: 'Error downloading invoice' });
            }
        });
    } catch (error) {
        console.error('Error generating invoice:', error);
        res.status(500).json({ message: 'Error generating invoice', error: error.message });
    }
};

