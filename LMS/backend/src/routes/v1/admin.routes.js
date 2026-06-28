const express = require('express');
const {
  getDashboardStats,
  getAdminUsers,
  updateUserStatus,
  deleteAdminUser,
  getAdminCourses,
  updateCourseStatus,
  deleteAdminCourse,
  getAdminProfile,
  updateAdminProfile
} = require('../../controllers/admin.controller');
const { adminRegister } = require('../../controllers/auth.controller');
const { protect, authorize } = require('../../middlewares/auth.middleware');
const { validate } = require('../../middlewares/validate.middleware');
const { registerSchema } = require('../../validations/auth.validation');

const router = express.Router();

router.route('/register').post(validate(registerSchema), adminRegister);

router.use(protect);
router.use(authorize('admin')); // All admin routes are admin only

router.route('/profile').get(getAdminProfile).put(updateAdminProfile);

// Stats
router.route('/stats').get(getDashboardStats);

// User management
router.route('/users').get(getAdminUsers);
router.route('/users/:id').put(updateUserStatus).delete(deleteAdminUser);

// Course management
router.route('/courses').get(getAdminCourses);
router.route('/courses/:id').put(updateCourseStatus).delete(deleteAdminCourse);

// Certificate management
router.route('/certificates/pending').get(require('../../controllers/admin.controller').getPendingCertificates);
router.route('/certificates/approved').get(require('../../controllers/admin.controller').getApprovedCertificates);
router.route('/certificates/:id/approve').put(require('../../controllers/admin.controller').approveCertificate);

module.exports = router;
