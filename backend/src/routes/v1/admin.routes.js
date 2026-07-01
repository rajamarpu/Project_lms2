const express = require('express');
const {
  getDashboardStats,
  getInstructors,
  getTopPerformers,
  getRecentActivity,
  getStudentGrowth,
  getAnalytics,
  getAdminUsers,
  getAdminUser,
  updateUserStatus,
  deleteAdminUser,
  getAdminCourses,
  updateCourseStatus,
  deleteAdminCourse,
  getPendingCertificates,
  getApprovedCertificates,
  approveCertificate
} = require('../../controllers/admin.controller');
const { protect, authorize } = require('../../middlewares/auth.middleware');

const router = express.Router();

router.use(protect);
router.use(authorize('admin'));

// Dashboard Stats
router.route('/stats').get(getDashboardStats);

// Dashboard widgets (real data)
router.route('/dashboard/top-performers').get(getTopPerformers);
router.route('/dashboard/recent-activity').get(getRecentActivity);
router.route('/dashboard/student-growth').get(getStudentGrowth);

// Analytics
router.route('/analytics').get(getAnalytics);

// Instructors / Teachers
router.route('/instructors').get(getInstructors);

// User management
router.route('/users').get(getAdminUsers);
router.route('/users/:id').get(getAdminUser).put(updateUserStatus).delete(deleteAdminUser);

// Course management
router.route('/courses').get(getAdminCourses);
router.route('/courses/:id').put(updateCourseStatus).delete(deleteAdminCourse);

// Certificate management
router.route('/certificates/pending').get(getPendingCertificates);
router.route('/certificates/approved').get(getApprovedCertificates);
router.route('/certificates/:id/approve').put(approveCertificate);

module.exports = router;
