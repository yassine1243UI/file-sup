const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1]; // Récupère le token à partir des headers

    if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET); // Vérifie le token
        req.user = decoded; // Ajoute les informations utilisateur à la requête
        next(); // Passe à la prochaine étape
    } catch (error) {
        res.status(403).json({ message: 'Invalid token' });
    }
};

module.exports = authMiddleware;
