const nodemailer = require('nodemailer');

// Configure the transporter
const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // Use false for port 587, true for port 465
    auth: {
        user: 'fayesarah98@gmail.com',
        pass: 'rpzrsrrqodxxgfay'
    }
});

// Generic email sender function
const sendEmail = async (to, subject, text) => {
    const mailOptions = {
        from: 'fayesarah98@gmail.com',
        to,
        subject,
        text,
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

// Specific wrapper for registration email
const sendRegistrationEmail = async (email, name, amountPaid, storageLimit) => {
    const subject = 'Confirmation of Your Registration';
    const text = `Hello ${name},\n\nThank you for registering at FileSup. Your payment of €${amountPaid} for the 20GB plan with ${storageLimit} MB of storage has been successfully processed.\n\nWelcome aboard,\nFileSup Team`;

    return sendEmail(email, subject, text);
};

module.exports = {
    sendEmail,
    sendRegistrationEmail
};
