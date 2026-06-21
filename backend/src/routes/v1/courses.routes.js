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
  .post(protect, authorize('admin'), validate(courseSchema), createCourse);

router.route('/learning-paths')
  .get(getLearningPaths);

router.route('/instructor/stats')
  .get(protect, authorize('instructor', 'admin'), getInstructorStats);

router.route('/:id')
  .get(optionalProtect, getCourse)
  .put(protect, authorize('admin'), updateCourse)
  .delete(protect, authorize('admin'), deleteCourse);

router.post('/:id/duplicate', protect, authorize('admin'), duplicateCourse);

router.route('/:courseId/lessons')
  .post(protect, authorize('admin'), validate(lessonSchema), addLesson);

router.put('/:courseId/lessons/reorder', protect, authorize('admin'), reorderLessons);

router.route('/:courseId/generate-lessons')
  .post(protect, authorize('admin'), generateLessonsAI);

router.route('/:courseId/lessons/:lessonId')
  .put(protect, authorize('admin'), updateLesson)
  .delete(protect, authorize('admin'), deleteLesson);

module.exports = router;
