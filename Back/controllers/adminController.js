const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../config/db');

// Get all users with their file counts and storage usage
exports.getAllUsers = async (req, res) => {
    try {
        console.log('DEBUG: Fetching all users with file stats');

        const [users] = await db.query(`
            SELECT 
                u.id, u.name, u.email, u.role,
                COUNT(f.id) AS file_count,
                COALESCE(SUM(f.size), 0) AS total_storage
            FROM users u
            LEFT JOIN files f ON u.id = f.user_id
            GROUP BY u.id
        `);

        res.status(200).json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Error fetching users', error: error.message });
    }
};

// Get all files from all users
exports.getAllUserFiles = async (req, res) => {
    try {
        console.log('DEBUG: Fetching all user files');

        const [files] = await db.query(`
            SELECT 
                f.id, f.file_name, f.size, f.mimeType, f.created_at, 
                u.name as user_name, u.email 
            FROM files f 
            JOIN users u ON f.user_id = u.id
        `);

        res.status(200).json({ files });
    } catch (error) {
        console.error('Error fetching all user files:', error);
        res.status(500).json({ message: 'Error fetching all user files', error: error.message });
    }
};

// Get system-wide statistics
exports.getSystemStats = async (req, res) => {
    try {
        console.log('DEBUG: Fetching system statistics');

        const [totalStorage] = await db.query('SELECT COALESCE(SUM(size), 0) as totalStorage FROM files');
        const [totalFiles] = await db.query('SELECT COUNT(*) as totalFiles FROM files');
        const [userStats] = await db.query(`
            SELECT 
                u.id as userId, u.name, u.email, 
                COUNT(f.id) as fileCount, 
                COALESCE(SUM(f.size), 0) as storageUsed 
            FROM users u 
            LEFT JOIN files f ON u.id = f.user_id 
            GROUP BY u.id
        `);

        res.status(200).json({
            totalStorageUsed: totalStorage[0]?.totalStorage || 0,
            totalFilesUploaded: totalFiles[0]?.totalFiles || 0,
            userStats,
        });
    } catch (error) {
        console.error('Error fetching system statistics:', error);
        res.status(500).json({ message: 'Error fetching system statistics', error: error.message });
    }
};

// Admin deletes a specific file
exports.deleteUserFile = async (req, res) => {
    const { fileId } = req.params;

    try {
        console.log(`DEBUG: Admin attempting to delete file with ID: ${fileId}`);

        // Retrieve file path for deletion
        const [fileResult] = await db.query('SELECT path FROM files WHERE id = ?', [fileId]);

        if (fileResult.length === 0) {
            return res.status(404).json({ message: 'File not found' });
        }

        const filePath = fileResult[0].path;

        // Remove file from the server
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.log(`DEBUG: File deleted from server: ${filePath}`);
        } else {
            console.warn(`WARNING: File path does not exist: ${filePath}`);
        }

        // Delete file record from the database
        const [result] = await db.query('DELETE FROM files WHERE id = ?', [fileId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'File not found or no permission to delete' });
        }

        console.log('DEBUG: File metadata deleted from database:', result);
        res.status(200).json({ message: 'File deleted successfully' });
    } catch (error) {
        console.error('Error deleting user file:', error);
        res.status(500).json({ message: 'Error deleting file', error: error.message });
    }
};
exports.getAllUsersWithStats = async (req, res) => {
    try {
        console.log('DEBUG: Fetching all users with file stats and remaining storage');

        const storageQuota = 20 * 1024 * 1024 * 1024; // 20GB in bytes

        const [users] = await db.query(`
            SELECT 
                u.id, 
                u.name, 
                u.email, 
                u.role,
                COUNT(f.id) AS file_count,
                COALESCE(SUM(f.size), 0) AS total_storage_used,
                ? - COALESCE(SUM(f.size), 0) AS remaining_storage
            FROM users u
            LEFT JOIN files f ON u.id = f.user_id
            GROUP BY u.id
        `, [storageQuota]);

        res.status(200).json(users);
    } catch (error) {
        console.error('Error fetching users with stats:', error);
        res.status(500).json({ message: 'Error fetching users with stats', error: error.message });
    }
};
