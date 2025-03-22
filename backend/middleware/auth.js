const jwt = require('jsonwebtoken');

// Secret key for JWT (must match the one used for signing tokens)
const JWT_SECRET = 'your-secret-key';

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
    const token = req.cookies.token; // Get token from cookie

    if (!token) {
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    // Verify the token
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid or expired token.' });
        }
        req.user = user; // Attach user data to the request object
        next(); // Proceed to the next middleware or route handler
    });
};

module.exports = { authenticateToken };