const jwt = require('jsonwebtoken');
const { prisma } = require('../config/db');
const env = require('../config/env');

// Protect routes - verify JWT token
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, env.JWT_SECRET);

      req.user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: { id: true, name: true, email: true, role: true, status: true }
      });

      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Not authorized, user not found' });
      }

      if (['suspended', 'rejected', 'pending'].includes(req.user.status)) {
        return res.status(403).json({ success: false, error: `Account is ${req.user.status}. Access denied.` });
      }

      next();
    } catch (error) {
      return res.status(401).json({ success: false, error: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, error: 'Not authorized, no token provided' });
  }
};

// Grant access to specific roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `Role '${req.user.role}' is not authorized to access this route`
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
