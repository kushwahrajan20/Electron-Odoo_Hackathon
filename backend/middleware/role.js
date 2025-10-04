// General purpose middleware to check for multiple roles
const checkRole = (roles) => (req, res, next) => {
    if (req.user && roles.includes(req.user.role)) {
        next();
    } else {
        res.status(403).json({ message: 'Access Denied: You do not have the required role.' });
    }
};

exports.isAdmin = checkRole(['ADMIN']);
exports.isManagerOrAdmin = checkRole(['ADMIN', 'MANAGER']);
