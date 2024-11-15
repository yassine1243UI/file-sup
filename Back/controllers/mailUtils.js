const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com", 
    port: 587,
    secure: false, // Note: pour Gmail, `secure` est false pour le port 587, true pour le port 465
    auth: {
        user: 'fayesarah98@gmail.com',
        pass: 'rpzrsrrqodxxgfay'
    }
});

exports.sendRegistrationEmail = async (email, name, amountPaid, storageLimit) => {
    const subject = 'Confirmation of Your Registration';
    const text = `Hello ${name},\n\nThank you for registering at FileSup. Your payment of €${amountPaid} for the 20GB plan with ${storageLimit} MB of storage has been successfully processed.\n\nWelcome aboard,\nFileSup Team`;

    const mailOptions = {
        from: 'fayesarah98@gmail.com',
        to: email,
        subject: subject,
        text: text,
    };

    return new Promise((resolve, reject) => {
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Email send error:', error);
                return reject(error);
            }
            console.log('Email sent:', info.response);
            resolve(info);
        });
    });
};
