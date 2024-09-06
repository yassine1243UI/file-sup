const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY); 
const bodyParser = require('body-parser');
const authRoutes = require('./routes/authRoutes');
const fileRoutes = require('./routes/fileRoutes');
const adminRoutes = require('./routes/adminRoutes');
// const paymentRoutes = require('./routes/paymentRoutes');
const cors = require('cors');

const app = express();
// Use CORS with default options - This will allow all cross-origin requests
app.use(cors());

// Alternatively, configure CORS with specific options for more security
app.use(cors({
    origin: 'http://localhost:3000', // Allow only this origin to access
    methods: ['GET', 'POST'], // Allow only these methods
    credentials: true // Allow cookies to be sent across origins
}));

require('dotenv').config();

app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/admin', adminRoutes);
// app.use('/api/files', fileRoutes);
// app.use('/api/payments', paymentRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    // Additional debug info for environment setup verification
    console.log('Environment Check:', process.env.STRIPE_SECRET_KEY ? 'Stripe Key Set' : 'Stripe Key Not Set');
});