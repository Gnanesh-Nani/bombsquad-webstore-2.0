const jwt = require('jsonwebtoken');
require('dotenv').config();

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
    // Get token from cookie or Authorization header
    const token = req.cookies.token || req.headers['authorization']?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ 
            success: false,
            message: 'Access denied. No token provided.' 
        });
    }

    // Verify the token
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ 
                success: false,
                message: 'Invalid or expired token.' 
            });
        }
        
        // Attach user data to the request object
        req.user = user;
        
        // Proceed to the next middleware or route handler
        next();
    });
};

module.exports = { authenticateToken };