const express = require('express');
const { uploadFile, getUserFiles, renameFile, deleteFile, downloadFile } = require('../controllers/fileController');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

// File Upload
router.post('/upload', authenticateToken, uploadFile);

// List all files for the user
router.get('/', authenticateToken, getUserFiles);

// Rename a file
router.put('/:id', authenticateToken, renameFile);

// Delete a file (soft delete)
router.delete('/:id', authenticateToken, deleteFile);

// Download a file
router.get('/download/:id', authenticateToken, downloadFile);

module.exports = router;
