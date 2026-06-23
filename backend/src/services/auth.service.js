const bcrypt = require('bcryptjs');
const { prisma } = require('../config/db');
const { findUserByEmail } = require('./user.service');

exports.registerUser = async ({ name, email, password, role, verificationOTP, verificationOTPExpiry }) => {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const userRole = role || 'user';
  const userStatus = 'approved';

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role: userRole,
      status: userStatus,
      verificationOTP,
      verificationOTPExpiry
    }
  });

  return user;
};

exports.verifyLogin = async (email, password) => {
  const user = await findUserByEmail(email);
  if (!user) {
    return { error: 'Invalid credentials', status: 401 };
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return { error: 'Invalid credentials', status: 401 };
  }

  if (!user.isEmailVerified) {
    return { error: 'Please verify your email address.', status: 403, requiresVerification: true, email: user.email };
  }

  if (user.status === 'pending') {
    return { error: 'Your account is pending admin approval. Please wait for an admin to approve your account.', status: 403 };
  }
  if (user.status === 'rejected') {
    return { error: 'Your account has been rejected. Please contact support.', status: 403 };
  }
  if (user.status === 'suspended') {
    return { error: 'Your account has been suspended. Please contact support.', status: 403 };
  }

  return { user };
};

exports.updateUserPassword = async (id, password) => {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  await prisma.user.update({
    where: { id },
    data: { password: hashedPassword }
  });
};
