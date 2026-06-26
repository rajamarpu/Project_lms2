const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { prisma } = require('../config/db');
const { addEmailJob } = require('../queues/email.queue');
const { issueSession, rotateSession, revokeCurrentSession } = require('../services/session.service');
const { isStrongPassword } = require('../utils/platformRules');

const normalizeEmail = (value) => String(value ?? '').trim().toLowerCase();

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { name, password } = req.body;
    const email = normalizeEmail(req.body.email);

    if (!name?.trim() || !email || !password) {
      return res.status(400).json({ success: false, error: 'Please provide a name, email, and password' });
    }

    // Check if user already exists
    const userExists = await prisma.user.findUnique({ where: { email } });
    if (userExists) {
      return res.status(400).json({ success: false, error: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Determine status — self-registration supports learners and instructors only
    const requestedRole = String(req.body.role || 'user').trim().toLowerCase();
    const userRole = ['user', 'instructor'].includes(requestedRole) ? requestedRole : 'user';
    const userStatus = 'approved'; // Simplified for testing/integration phase

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: userRole,
        status: userStatus
      }
    });

    // Don't issue token yet — user needs admin approval (except admins)
    if (userStatus === 'pending') {
      return res.status(201).json({
        success: true,
        pending: true,
        message: 'Registration successful! Your account is pending admin approval. You will be able to log in once approved.'
      });
    }

    const token = await issueSession(user, req, res);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { password } = req.body;
    const email = normalizeEmail(req.body.email);

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Please provide an email and password' });
    }

    // Find user
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    // Check account approval status
    if (user.status === 'pending') {
      return res.status(403).json({ success: false, error: 'Your account is pending admin approval. Please wait for an admin to approve your account.' });
    }
    if (user.status === 'rejected') {
      return res.status(403).json({ success: false, error: 'Your account has been rejected. Please contact support.' });
    }
    if (user.status === 'suspended') {
      return res.status(403).json({ success: false, error: 'Your account has been suspended. Please contact support.' });
    }

    const token = await issueSession(user, req, res);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
exports.logout = async (req, res, next) => {
  try {
    await revokeCurrentSession(req, res);
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};

exports.refresh = async (req, res, next) => {
  try {
    const session = await rotateSession(req, res);
    if (!session) return res.status(401).json({ success: false, error: 'Session expired. Please sign in again.' });
    res.status(200).json({
      success: true,
      token: session.token,
      user: { id: session.user.id, name: session.user.name, email: session.user.email, role: session.user.role },
    });
  } catch (error) {
    next(error);
  }
};

exports.logoutAll = async (req, res, next) => {
  try {
    await prisma.session.updateMany({ where: { userId: req.user.id, revokedAt: null }, data: { revokedAt: new Date() } });
    await revokeCurrentSession(req, res);
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, name: true, email: true, role: true, createdAt: true }
    });
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res, next) => {
  try {
    const email = normalizeEmail(req.body.email);
    if (!email) {
      return res.status(400).json({ success: false, error: 'Please provide an email' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Return 200 even if user not found to prevent email enumeration
      return res.status(200).json({ success: true, message: 'If that email is registered, a reset link has been sent.' });
    }

    // Generate token valid for 15 minutes, signed with user's current password
    const secret = process.env.JWT_SECRET + user.password;
    const token = jwt.sign({ email: user.email, id: user.id }, secret, { expiresIn: '15m' });

    const resetLink = `${process.env.CLIENT_URL || 'http://localhost:3000'}/reset-password/${user.id}/${token}`;
    
    // Dispatch async email job
    await addEmailJob({
      to: user.email,
      subject: 'Password Reset Request - LMS',
      body: `You requested a password reset. Click the link below to reset it:\n\n${resetLink}\n\nThis link is valid for 15 minutes.`
    });

    const response = {
      success: true, 
      message: 'If that email is registered, a reset link has been sent.'
    };
    if (process.env.NODE_ENV !== 'production') response.resetLink = resetLink;
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

// @desc    Reset password
// @route   PUT /api/auth/reset-password/:id/:token
// @access  Public
exports.resetPassword = async (req, res, next) => {
  try {
    const { id, token } = req.params;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ success: false, error: 'Please provide a new password' });
    }
    if (!isStrongPassword(password)) {
      return res.status(400).json({ success: false, error: 'Password must be 8–128 characters and include uppercase, lowercase, and a number' });
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return res.status(400).json({ success: false, error: 'Invalid or expired token' });
    }

    const secret = process.env.JWT_SECRET + user.password;
    try {
      jwt.verify(token, secret);
    } catch (err) {
      return res.status(400).json({ success: false, error: 'Invalid or expired token' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await prisma.user.update({
      where: { id },
      data: { password: hashedPassword }
    });
    await prisma.session.updateMany({ where: { userId: id, revokedAt: null }, data: { revokedAt: new Date() } });

    res.status(200).json({ success: true, message: 'Password has been reset successfully' });
  } catch (error) {
    next(error);
  }
};
