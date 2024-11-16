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
    const { userId } = req.user; // Assuming userId is set in req.user via middleware
    const { fileId } = req.params; // File ID from request parameters

    try {
        console.log(`DEBUG: Deleting file with ID: ${fileId} by user: ${userId}`);

        // Retrieve file path for deletion
        const [fileResult] = await db.query(
            'SELECT path FROM files WHERE id = ? AND user_id = ?',
            [fileId, userId]
        );

        if (fileResult.length === 0) {
            return res.status(404).json({ message: 'File not found or no permission to delete' });
        }

        const filePath = fileResult[0].path;

        // Remove file from the server
        fs.unlinkSync(filePath);
        console.log(`DEBUG: File deleted from server: ${filePath}`);

        // Delete file record from the database
        const [result] = await db.query(
            'DELETE FROM files WHERE id = ? AND user_id = ?',
            [fileId, userId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'File not found or no permission to delete' });
        }

        console.log('DEBUG: File metadata deleted from database:', result);
        res.status(200).json({ message: 'File deleted successfully' });
    } catch (error) {
        console.error('Error deleting file:', error);
        res.status(500).json({ message: 'Error deleting file', error: error.message });
    }
};
exports.updateFileMetadata = async (req, res) => {
    const { userId } = req.user; // Assuming userId is set in req.user via middleware
    const { fileId } = req.params; // File ID from request parameters
    const { name } = req.body; // New file name from request body

    if (!name) {
        return res.status(400).json({ message: 'File name is required' });
    }

    try {
        console.log(`DEBUG: Updating file metadata for file ID: ${fileId} by user: ${userId}`);

        // Update file metadata in the database
        const [result] = await db.query(
            'UPDATE files SET file_name = ? WHERE id = ? AND user_id = ?',
            [name, fileId, userId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'File not found or no permission to update' });
        }

        console.log('DEBUG: File metadata updated successfully:', result);
        res.status(200).json({ message: 'File metadata updated successfully' });
    } catch (error) {
        console.error('Error updating file metadata:', error);
        res.status(500).json({ message: 'Error updating file metadata', error: error.message });
    }
};

exports.downloadFile = async (req, res) => {
    const { fileId } = req.params;
    const { userId } = req.user; // Assuming userId is available in req.user from authentication middleware

    try {
        // Retrieve file metadata from the database
        const [result] = await db.query('SELECT * FROM files WHERE id = ? AND user_id = ?', [fileId, userId]);

        if (result.length === 0) {
            return res.status(404).json({ message: 'File not found or access denied' });
        }

        const file = result[0];
        const filePath = file.path;

        // Check if the file exists on the server
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ message: 'File not found on the server' });
        }

        // Send the file to the user
        return res.download(filePath, file.file_name, (err) => {
            if (err) {
                console.error('File download error:', err);
                res.status(500).json({ message: 'Error downloading file' });
            }
        });
    } catch (error) {
        console.error('Error in downloadFile:', error);
        res.status(500).json({ message: 'Error processing file download', error: error.message });
    }
};


