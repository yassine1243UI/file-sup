const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = { userId: decoded.user_id, role: decoded.role }; // Attach user info to req
        console.log('DEBUG: Authenticated user:', req.user);
        next();
    } catch (error) {
        console.error('DEBUG: JWT verification failed:', error);
        res.status(400).json({ message: 'Invalid token.' });
    }
};

module.exports = authMiddleware;
