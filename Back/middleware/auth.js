const jwt = require('jsonwebtoken');

exports.authenticateToken = (req, res, next) => {
    const token = req.header('Authorization') && req.header('Authorization').split(' ')[1]; // Extract the token
    if (!token) return res.status(401).json({ message: 'Access Denied' });

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: 'Invalid Token' });
        req.user = user;  // Attach the decoded user info to the request object
        next();
    });
};
