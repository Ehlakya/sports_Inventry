const jwt = require('jsonwebtoken');
const { User } = require('../models');

const authenticateJWT = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Access token required. Please sign in.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretjwtkeyforaccess123!');

    const user = await User.findByPk(decoded.id);
    if (!user) {
      return res.status(401).json({ error: 'User associated with this token not found.' });
    }

    // Attach user information to request
    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication Error:', error.message);
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Access token expired. Please refresh your token.' });
    }
    return res.status(401).json({ error: 'Invalid access token.' });
  }
};

const authenticateOptional = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretjwtkeyforaccess123!');

    const user = await User.findByPk(decoded.id);
    if (user) {
      req.user = user;
    }
    next();
  } catch (error) {
    // Proceed without user if token is invalid
    next();
  }
};

const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: `Access denied. Role '${req.user.role}' is not authorized to access this resource.` 
      });
    }

    if (req.user.role === 'ADMIN' && req.user.email !== 'adminR') {
      return res.status(403).json({ 
        error: 'Access denied. Unauthorized admin account.' 
      });
    }

    next();
  };
};

module.exports = {
  authenticateJWT,
  authenticateOptional,
  authorizeRoles
};
