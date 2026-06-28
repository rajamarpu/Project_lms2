const bcrypt = require('bcryptjs');
const { prisma } = require('../config/db');

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
exports.getUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc', search, role, status } = req.query;

    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    const skip = (pageNumber - 1) * limitNumber;

    const where = {};

    if (role) where.role = role;
    if (status) where.status = status;

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }

    const orderBy = {};
    if (sortBy) {
      orderBy[sortBy] = sortOrder === 'asc' ? 'asc' : 'desc';
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          status: true,
          createdAt: true
        },
        skip,
        take: limitNumber,
        orderBy
      }),
      prisma.user.count({ where })
    ]);

    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
      meta: {
        total,
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(total / limitNumber)
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private/Admin
exports.getUser = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      }
    });

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin
exports.updateUser = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.params.id } });

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const { name, email, role, status, bio, avatar, password } = req.body;
    const updateData = {};

    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (role !== undefined) updateData.role = role;
    if (status !== undefined) updateData.status = status;
    if (bio !== undefined) updateData.bio = bio;
    if (avatar !== undefined) updateData.avatar = avatar;
    if (password !== undefined) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.params.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        bio: true,
        avatar: true
      }
    });

    res.status(200).json({ success: true, data: updatedUser });
  } catch (error) {
    next(error);
  }
};

// @desc    Create user
// @route   POST /api/users
// @access  Private/Admin
exports.createUser = async (req, res, next) => {
  try {
    const { name, email, role = 'user', status = 'approved', bio, avatar, password } = req.body;

    if (!name || !email) {
      return res.status(400).json({ success: false, error: 'Name and email are required' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ success: false, error: 'User with that email already exists' });
    }

    const plainPassword = password || `${Math.random().toString(36).slice(-10)}${Date.now()}`;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(plainPassword, salt);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        status,
        bio,
        avatar
      }
    });

    res.status(201).json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        bio: user.bio,
        avatar: user.avatar
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Invite user
// @route   POST /api/users/invite
// @access  Private/Admin
exports.inviteUser = async (req, res, next) => {
  try {
    const { email, name, role = 'instructor' } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, error: 'Email is required for invitation' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ success: false, error: 'User with that email already exists' });
    }

    const plainPassword = `${Math.random().toString(36).slice(-10)}${Date.now()}`;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(plainPassword, salt);

    const user = await prisma.user.create({
      data: {
        name: name || 'Invited Instructor',
        email,
        password: hashedPassword,
        role,
        status: 'pending'
      }
    });

    res.status(201).json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.params.id } });

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    await prisma.user.delete({ where: { id: req.params.id } });

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};
