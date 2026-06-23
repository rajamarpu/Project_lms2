const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { prisma } = require('../config/db');
const { generateToken } = require('../utils/jwt.util');
const { addEmailJob } = require('../queues/email.queue');
const { findUserByEmail, findUserById } = require('../services/user.service');
const { registerUser, verifyLogin, updateUserPassword } = require('../services/auth.service');
const env = require('../config/env');

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    const verificationOTP = generateOTP();
    const verificationOTPExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

    // Check if user already exists
    const userExists = await findUserByEmail(email);
    let user;

    if (userExists) {
      if (userExists.isEmailVerified) {
        return res.status(400).json({ success: false, error: 'User already exists' });
      }
      // User exists but is not verified. Allow them to re-register / update their info.
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      user = await prisma.user.update({
        where: { email },
        data: {
          name,
          password: hashedPassword,
          verificationOTP,
          verificationOTPExpiry
        }
      });
    } else {
      user = await registerUser({ name, email, password, role, verificationOTP, verificationOTPExpiry });
    }

    await addEmailJob({
      to: user.email,
      subject: 'Verify Your Email — UptoSkills',
      template: 'verify-otp',
      data: { userName: user.name, otp: verificationOTP }
    });

    res.status(201).json({
      success: true,
      message: 'Registration successful. Please verify your email.',
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

// @desc    Verify Email OTP
// @route   POST /api/auth/verify-email
// @access  Public
exports.verifyEmail = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ success: false, error: 'Email and OTP are required' });

    const user = await findUserByEmail(email);
    if (!user) return res.status(400).json({ success: false, error: 'User not found' });

    if (user.isEmailVerified) return res.status(400).json({ success: false, error: 'Email already verified' });

    if (user.verificationOTP !== otp || new Date() > new Date(user.verificationOTPExpiry)) {
      return res.status(400).json({ success: false, error: 'Invalid or expired OTP' });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { isEmailVerified: true, verificationOTP: null, verificationOTPExpiry: null }
    });

    const token = generateToken(user.id, user.role);

    // Send welcome email (fire-and-forget)
    addEmailJob({
      to: user.email,
      subject: 'Welcome to UptoSkills! 🎉',
      template: 'welcome',
      data: { userName: user.name }
    }).catch(() => {});

    res.status(200).json({ 
      success: true, 
      token, 
      user: { id: user.id, name: user.name, email: user.email, role: user.role } 
    });
  } catch (error) { 
    next(error); 
  }
};

// @desc    Resend Verification OTP
// @route   POST /api/auth/resend-verification
// @access  Public
exports.resendVerification = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, error: 'Email is required' });

    const user = await findUserByEmail(email);
    if (!user) return res.status(200).json({ success: true, message: 'If registered, an OTP has been sent.' });

    if (user.isEmailVerified) return res.status(400).json({ success: false, error: 'Email already verified' });

    const verificationOTP = generateOTP();
    const verificationOTPExpiry = new Date(Date.now() + 15 * 60 * 1000);
    
    await prisma.user.update({
      where: { id: user.id },
      data: { verificationOTP, verificationOTPExpiry }
    });

    await addEmailJob({
      to: user.email,
      subject: 'Verify Your Email — UptoSkills',
      template: 'verify-otp',
      data: { userName: user.name, otp: verificationOTP }
    });

    res.status(200).json({ success: true, message: 'OTP sent successfully.' });
  } catch (error) { 
    next(error); 
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Please provide an email and password' });
    }

    const loginResult = await verifyLogin(email, password);

    if (loginResult.error) {
      // If verification is required, pass that detail along
      const payload = { success: false, error: loginResult.error };
      if (loginResult.requiresVerification) {
        payload.requiresVerification = true;
        payload.email = loginResult.email;
      }
      return res.status(loginResult.status).json(payload);
    }

    const user = loginResult.user;
    const token = generateToken(user.id, user.role);

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
    // JWT logout is handled client-side by discarding the token
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
    const user = await findUserById(req.user.id, { id: true, name: true, email: true, role: true, createdAt: true });
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
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, error: 'Please provide an email' });
    }

    const user = await findUserByEmail(email);
    if (!user) {
      // Return 200 even if user not found to prevent email enumeration
      return res.status(200).json({ success: true, message: 'If that email is registered, a reset OTP has been sent.' });
    }

    const resetPasswordOTP = generateOTP();
    const resetPasswordOTPExpiry = new Date(Date.now() + 15 * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: { resetPasswordOTP, resetPasswordOTPExpiry }
    });

    await addEmailJob({
      to: user.email,
      subject: 'Password Reset — UptoSkills',
      template: 'reset-otp',
      data: { userName: user.name, otp: resetPasswordOTP }
    });

    res.status(200).json({ 
      success: true, 
      message: 'If that email is registered, a reset OTP has been sent.'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify Reset OTP
// @route   POST /api/auth/verify-reset-otp
// @access  Public
exports.verifyResetOTP = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ success: false, error: 'Email and OTP are required' });

    const user = await findUserByEmail(email);
    if (!user) return res.status(400).json({ success: false, error: 'Invalid or expired OTP' });

    if (user.resetPasswordOTP !== otp || new Date() > new Date(user.resetPasswordOTPExpiry)) {
      return res.status(400).json({ success: false, error: 'Invalid or expired OTP' });
    }

    // Generate token valid for 15 minutes, signed with user's current password
    const secret = env.JWT_SECRET + user.password;
    const token = jwt.sign({ email: user.email, id: user.id }, secret, { expiresIn: '15m' });

    // Clear OTP
    await prisma.user.update({
      where: { id: user.id },
      data: { resetPasswordOTP: null, resetPasswordOTPExpiry: null }
    });

    res.status(200).json({ success: true, id: user.id, token });
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

    const user = await findUserById(id);
    if (!user) {
      return res.status(400).json({ success: false, error: 'Invalid or expired token' });
    }

    const secret = env.JWT_SECRET + user.password;
    try {
      jwt.verify(token, secret);
    } catch (err) {
      return res.status(400).json({ success: false, error: 'Invalid or expired token' });
    }

    await updateUserPassword(id, password);

    // Send password changed confirmation (fire-and-forget)
    addEmailJob({
      to: user.email,
      subject: 'Password Changed — UptoSkills',
      template: 'reset-success',
      data: { userName: user.name }
    }).catch(() => {});

    res.status(200).json({ success: true, message: 'Password has been reset successfully' });
  } catch (error) {
    next(error);
  }
};
