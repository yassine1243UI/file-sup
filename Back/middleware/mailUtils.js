const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // false for port 587, true for port 465
    auth: {
        user: 'fayesarah98@gmail.com',
        pass: 'rpzrsrrqodxxgfay'
    }
});

// Generic sendEmail function
exports.sendEmail = async (to, subject, text) => {
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

// Specific registration email wrapper
exports.sendRegistrationEmail = async (email, name, amountPaid, storageLimit) => {
    const subject = 'Welcome to FileSup!';
    const text = `Hello ${name},\n\nThank you for registering at FileSup. Your payment of €${amountPaid} for the 20GB plan with ${storageLimit} MB of storage has been successfully processed.\n\nWelcome aboard,\nFileSup Team`;
    return exports.sendEmail(email, subject, text);
};
