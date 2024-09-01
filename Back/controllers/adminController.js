const db = require('../config/db');

// Get all users
exports.getAllUsers = (req, res) => {
    const sql = 'SELECT * FROM users';
    db.query(sql, (err, result) => {
        if (err) return res.status(500).json({ message: 'Error fetching users' });
        res.json(result);
    });
};

// Get all files
exports.getAllFiles = (req, res) => {
    const sql = 'SELECT * FROM files';
    db.query(sql, (err, result) => {
        if (err) return res.status(500).json({ message: 'Error fetching files' });
        res.json(result);
    });
};
