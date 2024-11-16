const express = require('express');
const { uploadMiddleware, uploadFile, getUserFiles, deleteFile, getFiles } = require('../controllers/fileController');
const authMiddleware = require('../middleware/auth');
const verifyPayment = require('../middleware/verifyPayment');

const router = express.Router();

// File management routes
router.post('/upload', authMiddleware, verifyPayment, uploadMiddleware, uploadFile);
router.get('/', authMiddleware, verifyPayment, getFiles);
router.delete('/:fileId', authMiddleware, verifyPayment, deleteFile);

module.exports = router;
