const jwt = require('jsonwebtoken');
const User = require('../models/user');

/**
 * Protects routes by verifying the JWT from the Authorization header.
 * If the token is valid, it attaches the authenticated user's
 * information to the request object (`req.user`).
 */
exports.protect = async (req, res, next) => {
    let token;
    const authHeader = req.headers.authorization;

    // Check if the Authorization header exists and is in the correct format "Bearer <token>"
    if (authHeader && authHeader.startsWith('Bearer')) {
        try {
            // Extract the token from the header
            token = authHeader.split(' ')[1];

            // Verify the token using the secret key
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            // Find the user by the ID from the token's payload.
            // We exclude the password field for security.
            req.user = await User.findById(decoded.id).select('-password');
            
            // If the user associated with the token no longer exists
            if (!req.user) {
                return res.status(401).json({ message: 'Not authorized, user not found' });
            }
            
            // Proceed to the next middleware or route handler
            next();
        } catch (error) {
            console.error('Authentication Error:', error.message);
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    // If no token is found in the header
    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token provided' });
    }
};

