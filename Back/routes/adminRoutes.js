const express = require('express');
const { 
    getAllUserFiles, 
    getSystemStats, 
    deleteUserFile, 
    getAllUsersWithStats,
    deleteUser,
    getUploadStats,
    getTotalStorageUsed,
    getUserStats,
    filterFiles,
    downloadFile
} = require('../controllers/adminController');
const authMiddleware = require('../middleware/auth');
const adminMiddleware = require('../middleware/adminMiddleware');
const { generateInvoice } = require('../controllers/invoiceController');
const router = express.Router();

// View all users with file stats and remaining storage
// router.get('/users', authMiddleware, adminMiddleware, getAllUsersWithStats);
router.get('/stats/uploads', authMiddleware, adminMiddleware, getUploadStats);
router.get('/files/filter', authMiddleware, adminMiddleware, filterFiles);
router.get('/files/download/:fileId', authMiddleware, adminMiddleware, downloadFile);

// Get total storage used
router.get('/stats/storage', authMiddleware, adminMiddleware, getTotalStorageUsed);

// Get user statistics (active/inactive)
router.get('/stats/users', authMiddleware, adminMiddleware, getUserStats);

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
