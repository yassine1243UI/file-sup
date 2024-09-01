const multer = require('multer');
const path = require('path');
const db = require('../config/db');

// Configure Multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const userDir = './uploads/' + req.user.user_id;
        cb(null, userDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Save file with timestamp
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 50 * 1024 * 1024 } // 50 MB file size limit
}).single('file');

exports.uploadFile = (req, res) => {
    upload(req, res, function(err) {
        if (err) return res.status(500).json({ message: 'Error uploading file' });

        const file = req.file;
        const sql = 'INSERT INTO files (user_id, file_name, file_size, file_type, file_path) VALUES (?, ?, ?, ?, ?)';
        db.query(sql, [req.user.user_id, file.filename, file.size, file.mimetype, file.path], (err, result) => {
            if (err) return res.status(500).json({ message: 'Error saving file info' });
            res.status(201).json({ message: 'File uploaded successfully' });
        });
    });
};
