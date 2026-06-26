const { prisma } = require('../config/db'); // Trigger restart for history endpoint
const { safePage } = require('../utils/platformRules');
const bcrypt = require('bcryptjs');
const { audit } = require('../services/audit.service');
const { clearCache } = require('../middlewares/cache.middleware');
const { formatPrice } = require('../utils/priceHelper');

// @desc    Get dashboard statistics for admin
// @route   GET /api/admin/stats
// @access  Private/Admin
exports.getDashboardStats = async (req, res, next) => {
  try {
    const totalUsers = await prisma.user.count();
    const totalStudents = await prisma.user.count({ where: { role: 'user' } });
    const totalInstructors = await prisma.user.count({ where: { role: 'instructor' } });
    const totalAdmins = await prisma.user.count({ where: { role: 'admin' } });
    const totalCourses = await prisma.course.count();
    const totalEnrollments = await prisma.enrollment.count();
    const activeEnrollments = await prisma.enrollment.count({ where: { status: 'active' } });
    const pendingUsers = await prisma.user.count({ where: { status: 'pending' } });
    const pendingCourses = await prisma.course.count({ where: { status: 'pending' } });

    // Revenue is recognized only from persisted, verified paid billing records.
    const paidRevenue = await prisma.billingRecord.aggregate({ where: { status: 'paid' }, _sum: { amount: true } });
    const totalRevenue = Number(paidRevenue._sum.amount || 0);

    // Get recent 5 users for activity feed
    const recentUsers = await prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: { id: true, name: true, email: true, role: true, status: true, createdAt: true }
    });

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalStudents,
        totalInstructors,
        totalAdmins,
        totalCourses,
        totalEnrollments,
        activeEnrollments,
        totalRevenue,
        pendingUsers,
        pendingCourses,
        recentUsers
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users (admin)
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getAdminUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc', search, role, status } = req.query;

    const { page: pageNumber, limit: limitNumber, skip, orderBy } = safePage(req.query, ['createdAt', 'name', 'email', 'status', 'role']);

    const where = {};

    if (role) where.role = role;
    if (status) where.status = status;

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy,
        skip,
        take: limitNumber,
        select: { id: true, name: true, email: true, avatar: true, role: true, status: true, createdAt: true }
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

exports.createAdminUser = async (req, res, next) => {
  try {
    const { name, email, password, avatar, role = 'user', status = 'approved' } = req.body;
    if (!name?.trim() || !email?.trim() || !password) return res.status(400).json({ success: false, error: 'Name, email, and temporary password are required' });
    if (!['user', 'instructor'].includes(role)) return res.status(400).json({ success: false, error: 'Only learner or instructor accounts can be created here' });
    if (!['pending', 'approved'].includes(status)) return res.status(400).json({ success: false, error: 'Invalid initial account status' });
    const normalizedEmail = email.trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) return res.status(400).json({ success: false, error: 'A valid email is required' });
    const { isStrongPassword } = require('../utils/platformRules');
    if (!isStrongPassword(password)) return res.status(400).json({ success: false, error: 'Temporary password must be 8–128 characters with uppercase, lowercase, and a number' });
    if (avatar && !/^\/uploads\/[a-zA-Z0-9._-]+$/.test(avatar)) return res.status(400).json({ success: false, error: 'Invalid avatar upload URL' });
    const user = await prisma.user.create({ data: { name: name.trim(), email: normalizedEmail, password: await bcrypt.hash(password, 10), avatar: avatar || null, role, status }, select: { id: true, name: true, email: true, avatar: true, role: true, status: true, createdAt: true } });
    await audit(req, 'user.create', 'User', user.id, null, { email: user.email, role, status });
    res.status(201).json({ success: true, data: user });
  } catch (error) { next(error); }
};

// @desc    Update user status/role (admin)
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
exports.updateUserStatus = async (req, res, next) => {
  try {
    const { status, role } = req.body;
    if (status && !['pending', 'approved', 'rejected', 'suspended'].includes(status)) return res.status(400).json({ success: false, error: 'Invalid account status' });
    if (role && !['user', 'instructor', 'admin'].includes(role)) return res.status(400).json({ success: false, error: 'Invalid role' });
    if (req.params.id === req.user.id && (status === 'suspended' || role && role !== 'admin')) return res.status(409).json({ success: false, error: 'You cannot remove your own admin access' });
    const updateData = {};
    if (status) updateData.status = status;
    if (role) updateData.role = role;

    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: updateData,
      select: { id: true, name: true, email: true, role: true, status: true }
    });
    if (status && status !== 'approved') await prisma.session.updateMany({ where: { userId: user.id, revokedAt: null }, data: { revokedAt: new Date() } });
    await audit(req, 'user.access.update', 'User', user.id, null, updateData);
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user (admin)
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
exports.deleteAdminUser = async (req, res, next) => {
  try {
    if (req.params.id === req.user.id) return res.status(409).json({ success: false, error: 'You cannot delete your own admin account' });
    const previous = await prisma.user.findUnique({ where: { id: req.params.id }, select: { id: true, email: true, role: true, status: true } });
    if (!previous) return res.status(404).json({ success: false, error: 'User not found' });
    await prisma.user.delete({ where: { id: req.params.id } });
    await audit(req, 'user.delete', 'User', req.params.id, previous, null);
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all courses (admin, including non-approved)
// @route   GET /api/admin/courses
// @access  Private/Admin
exports.getAdminCourses = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc', search, status, category, level } = req.query;

    const { page: pageNumber, limit: limitNumber, skip, orderBy } = safePage(req.query, ['createdAt', 'title', 'status', 'category', 'price']);

    const where = {};

    if (status) where.status = status;
    if (category) where.category = category;
    if (level) where.level = level;

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { celebrityTeacher: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [courses, total] = await Promise.all([
      prisma.course.findMany({
        where,
        orderBy,
        skip,
        take: limitNumber,
        include: {
          instructor: { select: { id: true, name: true, email: true } },
          _count: { select: { enrollments: true } }
        }
      }),
      prisma.course.count({ where })
    ]);

    res.status(200).json({
      success: true,
      count: courses.length,
      data: formatPrice(courses),
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

// @desc    Update course status (admin approve/reject)
// @route   PUT /api/admin/courses/:id
// @access  Private/Admin
exports.updateCourseStatus = async (req, res, next) => {
  try {
    const { status, rejectionReason } = req.body;
    const allowed = ['pending', 'approved', 'rejected'];
    if (!allowed.includes(status)) return res.status(400).json({ success: false, error: 'Invalid course status' });
    if (status === 'rejected' && !rejectionReason?.trim()) return res.status(400).json({ success: false, error: 'A rejection reason is required' });
    const previous = await prisma.course.findUnique({ where: { id: req.params.id } });
    if (!previous) return res.status(404).json({ success: false, error: 'Course not found' });
    const lifecycle = {
      status,
      scheduledAt: null,
      publishedAt: status === 'approved' ? new Date() : previous.publishedAt,
      archivedAt: null,
      rejectionReason: status === 'rejected' ? rejectionReason.trim() : null,
    };
    const course = await prisma.course.update({
      where: { id: req.params.id },
      data: lifecycle,
      include: { instructor: { select: { id: true, name: true } } }
    });
    await audit(req, 'course.status.update', 'Course', course.id, { status: previous.status }, lifecycle);
    await clearCache('cache:/api/courses');
    res.status(200).json({ success: true, data: formatPrice(course) });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete course (admin)
// @route   DELETE /api/admin/courses/:id
// @access  Private/Admin
exports.deleteAdminCourse = async (req, res, next) => {
  try {
    const previous = await prisma.course.findUnique({ where: { id: req.params.id }, select: { id: true, title: true, status: true } });
    if (!previous) return res.status(404).json({ success: false, error: 'Course not found' });
    await prisma.course.delete({ where: { id: req.params.id } });
    await audit(req, 'course.delete', 'Course', previous.id, previous, null);
    await clearCache('cache:/api/courses');
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all pending certificates
// @route   GET /api/admin/certificates/pending
// @access  Private/Admin
exports.getPendingCertificates = async (req, res, next) => {
  try {
    const enrollments = await prisma.enrollment.findMany({
      where: {
        progress: 100,
        certificateApproved: false
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        course: { select: { id: true, title: true } }
      },
      orderBy: { updatedAt: 'asc' }
    });
    res.status(200).json({ success: true, data: enrollments });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve a certificate
// @route   PUT /api/admin/certificates/:id/approve
// @access  Private/Admin
exports.approveCertificate = async (req, res, next) => {
  try {
    const enrollment = await prisma.enrollment.update({
      where: { id: req.params.id },
      data: { certificateApproved: true }
    });
    res.status(200).json({ success: true, data: enrollment });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all approved certificates (History)
// @route   GET /api/admin/certificates/approved
// @access  Private/Admin
exports.getApprovedCertificates = async (req, res, next) => {
  try {
    const enrollments = await prisma.enrollment.findMany({
      where: {
        progress: 100,
        certificateApproved: true
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        course: { select: { id: true, title: true } }
      },
      orderBy: { updatedAt: 'desc' }
    });
    res.status(200).json({ success: true, data: enrollments });
  } catch (error) {
    next(error);
  }
};
