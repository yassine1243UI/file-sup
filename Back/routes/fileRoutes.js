const express = require('express');
const { uploadFile } = require('../controllers/fileController');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

router.post('/upload', authenticateToken, uploadFile);

module.exports = router;
