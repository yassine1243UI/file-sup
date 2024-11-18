const express = require('express');
const { uploadMiddleware, uploadFile,getFilteredAndSortedFiles, getUserFiles, deleteFile, getFiles ,updateFileMetadata, downloadFile} = require('../controllers/fileController');
const authMiddleware = require('../middleware/auth');
const verifyPayment = require('../middleware/verifyPayment');

const router = express.Router();

// File management routes
router.post('/upload', authMiddleware, verifyPayment, uploadMiddleware, uploadFile);
router.get('/', authMiddleware, verifyPayment, getFiles);
router.put('/:fileId', authMiddleware, verifyPayment, updateFileMetadata);
router.get('/download/:fileId', authMiddleware, downloadFile);
router.get('/files', authMiddleware, getFilteredAndSortedFiles);
// Delete a file
router.delete('/:fileId', authMiddleware, verifyPayment, deleteFile);


module.exports = router;
