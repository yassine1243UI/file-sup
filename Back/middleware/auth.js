const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    // Récupérer l'en-tête Authorization
    const authHeader = req.headers.authorization;

    // Vérification si l'en-tête Authorization est présent et commence par 'Bearer '
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Authentication token missing or invalid' });
    }

    // Extraire le token de l'en-tête
    const token = authHeader.split(' ')[1];

    try {
        console.log('DEBUG: Verifying token:', token);

        // Vérification du token avec la clé secrète
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Attacher les informations de l'utilisateur décodé à la requête
        req.user = decoded;

        // Log du succès de la vérification
        console.log('DEBUG: Token verified successfully:', decoded);

        // Passer au middleware suivant ou à la route
        next();
    } catch (error) {
        // En cas d'échec de la vérification du JWT
        console.error('DEBUG: JWT verification failed:', error);
        return res.status(403).json({ message: 'Invalid or expired token' });
    }
};

module.exports = authMiddleware;
