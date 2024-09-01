const express = require('express');
const { getAllUsers, getAllFiles } = require('../controllers/adminController');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

// Admin routes (should be protected with token and role checks)
router.get('/users', authenticateToken, getAllUsers);
router.get('/files', authenticateToken, getAllFiles);

module.exports = router;
