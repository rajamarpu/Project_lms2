const express = require('express');
const {
  getCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
  addLesson,
  deleteLesson,
  getInstructorStats,
  getLearningPaths,
  generateLessonsAI,
  duplicateCourse,
  updateLesson,
  reorderLessons
} = require('../../controllers/courses.controller');

const { protect, optionalProtect, authorize } = require('../../middlewares/auth.middleware');
const { validate } = require('../../middlewares/validate.middleware');
const { courseSchema, lessonSchema } = require('../../validations/course.validation');
const { cacheMiddleware } = require('../../middlewares/cache.middleware');

const router = express.Router();

router.route('/')
  .get(cacheMiddleware(300), getCourses)
  .post(protect, authorize('admin', 'instructor'), validate(courseSchema), createCourse);

router.route('/learning-paths')
  .get(getLearningPaths);

router.route('/instructor/stats')
  .get(protect, authorize('instructor', 'admin'), getInstructorStats);

router.route('/:id')
  .get(optionalProtect, getCourse)
  .put(protect, authorize('admin', 'instructor'), updateCourse)
  .delete(protect, authorize('admin', 'instructor'), deleteCourse);

router.post('/:id/duplicate', protect, authorize('admin', 'instructor'), duplicateCourse);

router.route('/:courseId/lessons')
  .post(protect, authorize('admin', 'instructor'), validate(lessonSchema), addLesson);

router.put('/:courseId/lessons/reorder', protect, authorize('admin', 'instructor'), reorderLessons);

router.route('/:courseId/generate-lessons')
  .post(protect, authorize('admin', 'instructor'), generateLessonsAI);

router.route('/:courseId/lessons/:lessonId')
  .put(protect, authorize('admin', 'instructor'), updateLesson)
  .delete(protect, authorize('admin', 'instructor'), deleteLesson);

module.exports = router;
