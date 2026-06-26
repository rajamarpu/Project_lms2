const jwt = require('jsonwebtoken');
const { prisma } = require('../config/db');

// Protect routes - verify JWT token
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: { id: true, name: true, email: true, role: true, status: true }
      });

      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Not authorized, user not found' });
      }

      if (req.user.status !== 'approved') {
        return res.status(403).json({ success: false, error: 'This account is not active' });
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

// Attach a valid active user when a bearer token is supplied, while keeping the
// route public for anonymous visitors. Invalid tokens are treated as anonymous.
const optionalProtect = async (req, _res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) return next();

  try {
    const decoded = jwt.verify(header.slice(7), process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, name: true, email: true, role: true, status: true }
    });
    if (user?.status === 'approved') req.user = user;
  } catch {
    // Public routes remain accessible when a stale token is present.
  }
  next();
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

module.exports = { protect, optionalProtect, authorize };
