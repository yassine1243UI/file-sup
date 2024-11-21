const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const db = require('../config/db'); // Assurez-vous d'importer la configuration de la DB

exports.generateInvoicePDF = async (invoiceId) => {
    return new Promise(async (resolve, reject) => {
        try {
            const invoiceDir = path.join(__dirname, '../invoices');

            // Vérifiez et créez le dossier "invoices" s'il n'existe pas
            if (!fs.existsSync(invoiceDir)) {
                console.log('DEBUG: Creating invoices directory');
                fs.mkdirSync(invoiceDir, { recursive: true });
            }

            // Charger les détails de la facture depuis la base de données
            const [result] = await db.query(
                `SELECT i.id, i.amount, i.created_at as date, u.name as clientName, u.billing_address 
                 FROM invoices i 
                 JOIN users u ON i.user_id = u.id 
                 WHERE i.id = ?`, 
                [invoiceId]
            );

            if (result.length === 0) {
                return reject(new Error('Invoice not found'));
            }

            const invoice = result[0];

            // Valider et convertir les données de la facture
            const amount = parseFloat(invoice.amount); // Conversion en nombre
            if (isNaN(amount)) {
                console.error('Invoice amount is invalid:', invoice.amount);
                return reject(new Error('Invalid invoice amount'));
            }

            // Informations de l'entreprise
            const companyDetails = {
                name: 'Filesup',
                address: '123 Rue de la Technologie, 75000 Paris, France',
                siret: '123 456 789 00012',
                phone: '+33 1 23 45 67 89',
                email: 'support@filesup.com',
            };

            // Génération du chemin du fichier PDF
            const pdfPath = path.join(invoiceDir, `invoice_${invoice.id}.pdf`);
            const doc = new PDFDocument();

            // Crée un flux d'écriture vers le fichier PDF
            const stream = fs.createWriteStream(pdfPath);

            stream.on('finish', () => {
                console.log(`DEBUG: Invoice PDF generated at ${pdfPath}`);
                resolve(pdfPath);
            });

            stream.on('error', (err) => {
                console.error('Error writing invoice PDF:', err);
                reject(new Error('Error writing invoice PDF'));
            });

            doc.pipe(stream);

            // Contenu de la facture
            // Entête de l'entreprise
            doc.fontSize(20).text(companyDetails.name, { align: 'center' });
            doc.fontSize(12).text(companyDetails.address, { align: 'center' });
            doc.text(`SIRET: ${companyDetails.siret}`, { align: 'center' });
            doc.text(`Phone: ${companyDetails.phone}`, { align: 'center' });
            doc.text(`Email: ${companyDetails.email}`, { align: 'center' });
            doc.moveDown(2);

            // Informations du client
            doc.fontSize(16).text('Facture', { align: 'left' });
            doc.moveDown();
            doc.text(`Invoice ID: ${invoice.id}`);
            doc.text(`Client Name: ${invoice.clientName}`);
            doc.text(`Billing Address: ${invoice.billing_address}`);
            doc.text(`Date: ${new Date(invoice.date).toLocaleDateString()}`);
            doc.moveDown();

            // Montant
            doc.fontSize(14).text(`Montant Total: €${amount.toFixed(2)}`, { align: 'right' });
            doc.moveDown();

            // Message de remerciement
            doc.fontSize(12).text('Merci d’avoir choisi Filesup. Pour toute question, contactez notre support.', { align: 'center' });
            doc.end();
        } catch (error) {
            console.error('Error generating invoice PDF:', error);
            reject(new Error('Error generating invoice PDF'));
        }
    });
};
