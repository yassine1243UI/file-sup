const adminMiddleware = (req, res, next) => {
    const { role } = req.user; // Assuming `role` is set in `req.user` via authentication middleware

    if (role !== 'admin') {
        return res.status(403).json({ message: 'Access denied. Admins only.' });
    }

    next();
};

module.exports = adminMiddleware;
