const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

exports.signup = (req, res) => {
    const { name, email, password } = req.body;

    // Check if user already exists
    const checkUserQuery = 'SELECT * FROM users WHERE email = ?';
    db.query(checkUserQuery, [email], async (err, result) => {
        if (result.length) return res.status(400).json({ message: 'User already exists' });

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const insertUserQuery = 'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)';
        db.query(insertUserQuery, [name, email, hashedPassword], (err, result) => {
            if (err) return res.status(500).json({ message: 'Error creating user' });
            res.status(201).json({ message: 'User registered successfully' });
        });
    });
};

exports.login = (req, res) => {
    const { email, password } = req.body;

    const getUserQuery = 'SELECT * FROM users WHERE email = ?';
    db.query(getUserQuery, [email], async (err, result) => {
        if (err || !result.length) return res.status(400).json({ message: 'Invalid credentials' });

        const user = result[0];
        const validPassword = await bcrypt.compare(password, user.password_hash);
        if (!validPassword) return res.status(400).json({ message: 'Invalid password' });

        const token = jwt.sign({ user_id: user.user_id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token });
    });
};
