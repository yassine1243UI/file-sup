const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../config/db');


exports.getAllUserFiles = async (req, res) => {
    try {
        console.log('DEBUG: Fetching all user files');

        const [files] = await db.query(
            'SELECT f.id, f.file_name, f.size, f.mimeType, f.created_at, u.name as user_name, u.email ' +
            'FROM files f JOIN users u ON f.user_id = u.id'
        );

        res.status(200).json({ files });
    } catch (error) {
        console.error('Error fetching all user files:', error);
        res.status(500).json({ message: 'Error fetching all user files', error: error.message });
    }
};


exports.getSystemStats = async (req, res) => {
    try {
        console.log('DEBUG: Fetching system statistics');

        const [totalStorage] = await db.query('SELECT SUM(size) as totalStorage FROM files');
        const [totalFiles] = await db.query('SELECT COUNT(*) as totalFiles FROM files');
        const [userStats] = await db.query(
            'SELECT u.id as userId, u.name, u.email, COUNT(f.id) as fileCount, SUM(f.size) as storageUsed ' +
            'FROM users u LEFT JOIN files f ON u.id = f.user_id GROUP BY u.id'
        );

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


exports.deleteUserFile = async (req, res) => {
    const { fileId } = req.params;

    try {
        console.log(`DEBUG: Admin deleting file with ID: ${fileId}`);

        // Retrieve file path for deletion
        const [fileResult] = await db.query('SELECT path FROM files WHERE id = ?', [fileId]);

        if (fileResult.length === 0) {
            return res.status(404).json({ message: 'File not found' });
        }

        const filePath = fileResult[0].path;

        // Remove file from the server
        fs.unlinkSync(filePath);
        console.log(`DEBUG: File deleted from server: ${filePath}`);

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


