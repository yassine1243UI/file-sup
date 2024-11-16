const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../config/db');

// Configure Multer
const upload = multer({
    dest: path.join(__dirname, '../uploads'),
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max file size
});


exports.uploadFile = async (req, res) => {
    const { userId } = req.user; // Assuming userId is set in req.user via middleware
    const file = req.file;

    if (!file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }

    try {
        // Check current storage usage
        console.log(`DEBUG: Checking current storage usage for user: ${userId}`);
        const [result] = await db.query(
            'SELECT SUM(size) as totalSize FROM files WHERE user_id = ?',
            [userId]
        );
        const currentStorage = result[0]?.totalSize || 0;

        const storageLimit = 20 * 1024 * 1024 * 1024; // 20GB in bytes
        console.log(
            `DEBUG: Current storage used: ${currentStorage} bytes, File size: ${file.size} bytes, Limit: ${storageLimit} bytes`
        );

        if (currentStorage + file.size > storageLimit) {
            // Remove uploaded file if storage exceeds
            fs.unlinkSync(file.path);
            return res.status(400).json({ message: 'Storage limit exceeded' });
        }

        // Insert file metadata into the database
        console.log('DEBUG: Inserting file metadata into the database');
        const query = `
            INSERT INTO files (user_id, file_name, name, path, size, file_size, mimeType, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
        `;
        const values = [
            userId,            // user_id
            file.originalname, // file_name
            file.originalname, // name
            file.path,         // path
            file.size,         // size
            file.size,         // file_size
            file.mimetype      // mimeType
        ];

        const [insertResult] = await db.query(query, values);
        console.log('DEBUG: File metadata inserted into database:', insertResult);

        res.status(201).json({ message: 'File uploaded successfully' });
    } catch (error) {
        console.error('File upload error:', error);
        res.status(500).json({ message: 'Error uploading file', error: error.message });
    }
};





// Middleware for handling file uploads
exports.uploadMiddleware = upload.single('file');
exports.getFiles = async (req, res) => {
    const { userId } = req.user; // Assuming userId is set in req.user via middleware

    try {
        console.log(`DEBUG: Retrieving files for user: ${userId}`);

        // Adjust column names to match the actual database schema
        const [files] = await db.query(
            'SELECT id, file_name AS name, size, mimeType, created_at AS uploaded_at FROM files WHERE user_id = ?',
            [userId]
        );

        if (files.length === 0) {
            console.log('DEBUG: No files found for user:', userId);
            return res.status(404).json({ message: 'No files found' });
        }

        console.log(`DEBUG: Retrieved ${files.length} files for user: ${userId}`);
        res.status(200).json({
            message: 'Files retrieved successfully',
            files,
        });
    } catch (error) {
        console.error('Error fetching user files:', error);
        res.status(500).json({
            message: 'Error retrieving files',
            error: error.message,
        });
    }
};

exports.getUserFiles = async (req, res) => {
    const { userId } = req.user;

    try {
        const [files] = await db.query(
            'SELECT id, file_name, file_size, file_type, uploaded_at FROM files WHERE user_id = ?',
            [userId]
        );

        res.status(200).json({ files });
    } catch (error) {
        console.error('Error fetching user files:', error);
        res.status(500).json({ message: 'Error fetching files', error: error.message });
    }
};
exports.deleteFile = async (req, res) => {
    const { userId } = req.user;
    const { fileId } = req.params;

    try {
        const [files] = await db.query(
            'SELECT file_path FROM files WHERE id = ? AND user_id = ?',
            [fileId, userId]
        );

        if (!files.length) {
            return res.status(404).json({ message: 'File not found' });
        }

        const filePath = files[0].file_path;

        // Remove file from the filesystem
        fs.unlinkSync(filePath);

        // Remove file record from the database
        await db.query('DELETE FROM files WHERE id = ?', [fileId]);

        res.status(200).json({ message: 'File deleted successfully' });
    } catch (error) {
        console.error('Error deleting file:', error);
        res.status(500).json({ message: 'Error deleting file', error: error.message });
    }
};

