// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const { User } = require('../models');

// Protect routes - Verify Token
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Fetch user from DB and attach to request object (excluding password)
      req.user = await User.findByPk(decoded.id, { attributes: { exclude: ['password'] } });
      
      if (!req.user) {
        return res.status(401).json({ message: 'Not authorized, user not found.' });
      }

      next();
    } catch (error) {
      return res.status(401).json({ message: 'Not authorized, token failed.' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token provided.' });
  }
};

// Restrict access to specific roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: `Role (${req.user?.role}) is not authorized to access this resource.` });
    }
    next();
  };
};

module.exports = { protect, authorize };