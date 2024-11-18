const express = require('express');
const { 
    getAllUserFiles, 
    getSystemStats, 
    deleteUserFile, 
    getAllUsersWithStats,
    deleteUser
} = require('../controllers/adminController');
const authMiddleware = require('../middleware/auth');
const adminMiddleware = require('../middleware/adminMiddleware');
const { generateInvoice } = require('../controllers/invoiceController');
const router = express.Router();

// View all users with file stats and remaining storage
// router.get('/users', authMiddleware, adminMiddleware, getAllUsersWithStats);

// View all user files
router.get('/files', authMiddleware, adminMiddleware, getAllUserFiles);

// View system statistics
router.get('/stats', authMiddleware, adminMiddleware, getSystemStats);

// Delete a specific user file
router.delete('/delete-user/:id', authMiddleware, adminMiddleware, deleteUser);


router.delete('/files/:fileId', authMiddleware, adminMiddleware, deleteUserFile);
router.get('/invoice/:invoiceId', authMiddleware,  generateInvoice);
// router.post('/users/:userId', authMiddleware, adminMiddleware, deleteOrDeactivateUser);
router.get('/users/:userId', authMiddleware, adminMiddleware, getAllUsersWithStats);


module.exports = router;
