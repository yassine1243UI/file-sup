const express = require('express');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/authRoutes');
// const fileRoutes = require('./routes/fileRoutes');
// const paymentRoutes = require('./routes/paymentRoutes');
require('dotenv').config();

const app = express();
app.use(bodyParser.json());

// Routes
app.use('/api/auth', authRoutes);
// app.use('/api/files', fileRoutes);
// app.use('/api/payments', paymentRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
