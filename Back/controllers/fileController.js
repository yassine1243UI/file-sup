const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../config/db');

// Configure Multer storage for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const userDir = './uploads/' + req.user.user_id;

        // Create user-specific directory if it doesn't exist
        if (!fs.existsSync(userDir)) {
            fs.mkdirSync(userDir, { recursive: true });
        }

        cb(null, userDir); // Save files to the user's directory
    },
    filename: (req, file, cb) => {
        // Save file with timestamp to avoid naming conflicts
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

// Configure Multer upload with size limit (50MB)
const upload = multer({
    storage: storage,
    limits: { fileSize: 50 * 1024 * 1024 } // 50 MB file size limit
}).single('file'); // Expecting a single file with the form field name 'file'

// File upload handler
exports.uploadFile = (req, res) => {
    const userId = req.user.user_id;

    // Check if the user has enough storage space
    const checkStorageSql = 'SELECT storage_used, storage_limit FROM users WHERE user_id = ?';
    db.query(checkStorageSql, [userId], (err, result) => {
        if (err) return res.status(500).json({ message: 'Error fetching user storage info' });
        
        const { storage_used, storage_limit } = result[0];
        const fileSize = req.file.size;  // Get the size of the file being uploaded

        if (storage_used + fileSize > storage_limit * 1024 * 1024) {
            return res.status(400).json({ message: 'Storage limit exceeded' });
        }

        // Proceed with file upload if storage limit is not exceeded
        upload(req, res, function (err) {
            if (err) return res.status(500).json({ message: 'Error uploading file' });

            const file = req.file;

            // Update the user's storage_used after the file is uploaded
            const updateStorageSql = 'UPDATE users SET storage_used = storage_used + ? WHERE user_id = ?';
            db.query(updateStorageSql, [file.size, userId], (err) => {
                if (err) {
                    console.log("Error updating user storage: ", err);
                }
            });

            res.status(201).json({ message: 'File uploaded successfully' });
        });
    });
};



exports.getUserFiles = (req, res) => {
    const sql = 'SELECT * FROM files WHERE user_id = ? AND is_deleted = 0';
    db.query(sql, [req.user.user_id], (err, result) => {
        if (err) {
            console.log("Database error: ", err);
            return res.status(500).json({ message: 'Error fetching files' });
        }
        res.status(200).json(result);  // Return the list of files
    });
};


exports.renameFile = (req, res) => {
    const { newFileName } = req.body;
    const fileId = req.params.id;

    const sql = 'UPDATE files SET file_name = ? WHERE file_id = ? AND user_id = ?';
    db.query(sql, [newFileName, fileId, req.user.user_id], (err, result) => {
        if (err) {
            console.log("Database error: ", err);
            return res.status(500).json({ message: 'Error renaming file' });
        }
        res.status(200).json({ message: 'File renamed successfully' });
    });
};


exports.deleteFile = (req, res) => {
    const fileId = req.params.id;

    const sql = 'UPDATE files SET is_deleted = 1 WHERE file_id = ? AND user_id = ?';
    db.query(sql, [fileId, req.user.user_id], (err, result) => {
        if (err) {
            console.log("Database error: ", err);
            return res.status(500).json({ message: 'Error deleting file' });
        }
        res.status(200).json({ message: 'File deleted successfully' });
    });
};




exports.downloadFile = (req, res) => {
    const fileId = req.params.id;

    const sql = 'SELECT * FROM files WHERE file_id = ? AND user_id = ? AND is_deleted = 0';
    db.query(sql, [fileId, req.user.user_id], (err, result) => {
        if (err || result.length === 0) {
            return res.status(404).json({ message: 'File not found' });
        }

        const file = result[0];
        const filePath = path.join(__dirname, '..', file.path);
        res.download(filePath);  // This will trigger the file download
    });
};
