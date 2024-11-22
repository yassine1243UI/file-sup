const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const db = require('../config/db'); // Assurez-vous d'importer la configuration de la DB

exports.generateInvoicePDF = async (invoiceId) => {
    return new Promise(async (resolve, reject) => {
        try {
            console.log("DEBUG: Generating invoice for invoiceId:", invoiceId);
            
            const invoiceDir = path.join(__dirname, '../invoices');
            if (!fs.existsSync(invoiceDir)) {
                console.log('DEBUG: Creating invoices directory');
                fs.mkdirSync(invoiceDir, { recursive: true });
            }

            // Load invoice details from the database
            const [result] = await db.query(
                `SELECT i.id, i.amount, i.created_at as date, u.name as clientName, u.billing_address 
                 FROM invoices i 
                 JOIN users u ON i.user_id = u.id 
                 WHERE i.id = ?`, 
                [invoiceId]
            );

            if (result.length === 0) {
                console.error(`DEBUG: Invoice not found for invoiceId: ${invoiceId}`);
                return reject(new Error('Invoice not found'));
            }

            const invoice = result[0];
            const amount = parseFloat(invoice.amount);
            if (isNaN(amount)) {
                console.error('DEBUG: Invalid invoice amount:', invoice.amount);
                return reject(new Error('Invalid invoice amount'));
            }

            const pdfPath = path.join(invoiceDir, `invoice_${invoice.id}.pdf`);
            const doc = new PDFDocument();
            const stream = fs.createWriteStream(pdfPath);

            stream.on('finish', () => {
                console.log(`DEBUG: Invoice PDF generated at ${pdfPath}`);
                resolve(pdfPath);
            });

            stream.on('error', (err) => {
                console.error('DEBUG: Error writing invoice PDF:', err);
                reject(new Error('Error writing invoice PDF'));
            });

            doc.pipe(stream);
            doc.fontSize(20).text("Filesup", { align: 'center' });
            doc.fontSize(16).text(`Invoice ID: ${invoice.id}`);
            doc.text(`Client: ${invoice.clientName}`);
            doc.text(`Amount: €${amount.toFixed(2)}`);
            doc.text(`Date: ${new Date(invoice.date).toLocaleDateString()}`);
            doc.end();
        } catch (error) {
            console.error('DEBUG: Error generating invoice PDF:', error);
            reject(new Error('Error generating invoice PDF'));
        }
    });
};
