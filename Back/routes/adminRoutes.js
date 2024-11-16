const express = require('express');
const { getAllUserFiles, getSystemStats, deleteUserFile } = require('../controllers/adminController');
const authMiddleware = require('../middleware/auth');
const adminMiddleware = require('../middleware/adminMiddleware');

const router = express.Router();

// View all user files
router.get('/files', authMiddleware, adminMiddleware, getAllUserFiles);

// View system statistics
router.get('/stats', authMiddleware, adminMiddleware, getSystemStats);

// Delete a specific user file
router.delete('/files/:fileId', authMiddleware, adminMiddleware, deleteUserFile);

module.exports = router;
