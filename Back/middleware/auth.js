const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Authentication token missing or invalid' });
    }

    const token = authHeader.split(' ')[1];

    try {
        console.log('DEBUG: Verifying token:', token);
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Attache l'utilisateur décodé à la requête
        console.log('DEBUG: Token verified successfully:', decoded);
        next();
    } catch (error) {
        console.error('DEBUG: JWT verification failed:', error);
        return res.status(403).json({ message: 'Invalid or expired token' });
    }
};

module.exports = authMiddleware;
