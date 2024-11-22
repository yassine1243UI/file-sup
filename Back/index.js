const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');

// Importation des routes
const authRoutes = require('./routes/authRoutes');
const fileRoutes = require('./routes/fileRoutes');
const adminRoutes = require('./routes/adminRoutes'); 
const paymentRoutes = require('./routes/paymentRoutes')
// Configuration de l'application
dotenv.config();
const app = express();

// Middleware
// app.use(cors());
app.use(cors({
    origin: 'http://localhost:3000',  // Make sure to allow the frontend's origin
    methods: ['GET', 'POST', 'DELETE'],  // Allow relevant methods
    credentials: true
  }));
  
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Gestion des fichiers statiques (accès aux fichiers uploadés si nécessaire)
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use("/api", fileRoutes);
// app.use('/api/files', fileRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payment', paymentRoutes)
// Gestion des erreurs globales (optionnel)
app.use((err, req, res, next) => {
    console.error('Global Error Handler:', err.stack);
    res.status(500).json({ message: 'Internal Server Error' });
});

// Démarrage du serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log('Environment variables:', {
        DB_HOST: process.env.DB_HOST,
        STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY ? 'Set' : 'Not Set',
    });
});
