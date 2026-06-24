const { prisma } = require('../config/db');
const { clearCache } = require('../middlewares/cache.middleware');
const { safePage } = require('../utils/platformRules');
const { audit } = require('../services/audit.service');
const { formatPrice } = require('../utils/priceHelper');

// @desc    Get all courses
// @route   GET /api/courses
// @access  Public
exports.getCourses = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc', search, category, level } = req.query;

    const { page: pageNumber, limit: limitNumber, skip, orderBy } = safePage(req.query, ['createdAt', 'title', 'rating', 'price']);

    const where = { AND: [{ status: 'approved' }] };

    if (category) where.category = category;
    if (level) where.level = level;

    if (search) {
      where.AND.push({ OR: [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { celebrityTeacher: { contains: search, mode: 'insensitive' } }
      ] });
    }

    const [courses, total] = await Promise.all([
      prisma.course.findMany({
        where,
        include: {
          instructor: { select: { id: true, name: true, email: true } },
          lessons: true,
          _count: { select: { enrollments: true } }
        },
        skip,
        take: limitNumber,
        orderBy
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

// @desc    Get single course
// @route   GET /api/courses/:id
// @access  Public
exports.getCourse = async (req, res, next) => {
  try {
    const course = await prisma.course.findUnique({
      where: { id: req.params.id },
      include: {
        instructor: { select: { id: true, name: true, email: true } },
        lessons: { orderBy: { order: 'asc' } },
        _count: { select: { enrollments: true } }
      }
    });
    if (!course) {
      return res.status(404).json({ success: false, error: 'Course not found' });
    }
    // Only admins and the course instructor can view non-approved courses
    const isPublished = course.status === 'approved';
    if (!isPublished) {
      const isOwner = req.user && course.instructorId === req.user.id;
      const isAdmin = req.user && req.user.role === 'admin';
      if (!isOwner && !isAdmin) {
        return res.status(404).json({ success: false, error: 'Course not found' });
      }
    }
    res.status(200).json({ success: true, data: formatPrice(course) });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new course
// @route   POST /api/courses
// @access  Private (Admin/Instructor)
exports.createCourse = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'instructor') {
      return res.status(403).json({ success: false, error: 'Only admins and instructors can create courses' });
    }
    const { title, description, category, level, thumbnail, celebrityTeacher, price, duration, rating, outcomes, xp, gradient, icon, status, generateAI } = req.body;
    const publishNow = status === 'approved';
    const course = await prisma.course.create({
      data: {
        title,
        description,
        category,
        level,
        thumbnail,
        celebrityTeacher,
        price: price ? Math.round(parseFloat(price) * 100) : 0,
        duration: duration || 'Self-paced',
        rating: rating ? parseFloat(rating) : 4.5,
        outcomes: outcomes || [],
        xp: xp || '1000 XP',
        gradient: gradient || 'from-blue-600 via-blue-500 to-cyan-400',
        icon: icon || '🤖',
        status: publishNow ? 'approved' : 'pending',
        publishedAt: publishNow ? new Date() : null,
        instructorId: req.user.id
      }
    });

    if (generateAI) {
      const { generateLessonsForCourse } = require('../utils/aiGenerator');
      const lessonsData = await generateLessonsForCourse(title, category, level);
      for (const l of lessonsData) {
        await prisma.lesson.create({
          data: {
            title: l.title,
            content: l.content,
            videoUrl: l.videoUrl,
            order: l.order,
            courseId: course.id
          }
        });
      }
      // Update course duration count (assume lessonsData length * 20 Mins)
      await prisma.course.update({
        where: { id: course.id },
        data: {
          duration: `${lessonsData.length * 20} Mins`
        }
      });
    }

    // Invalidate course cache
    await clearCache('cache:/api/courses');
    await audit(req, publishNow ? 'course.create.publish' : 'course.create.draft', 'Course', course.id, null, { title: course.title, status: course.status });
    res.status(201).json({ success: true, data: formatPrice(course) });
  } catch (error) {
    next(error);
  }
};

// @desc    Update course
// @route   PUT /api/courses/:id
// @access  Private (Admin/Instructor)
exports.updateCourse = async (req, res, next) => {
  try {
    const course = await prisma.course.findUnique({ where: { id: req.params.id } });
    if (!course) {
      return res.status(404).json({ success: false, error: 'Course not found' });
    }

    if (req.user.role !== 'admin' && (req.user.role !== 'instructor' || course.instructorId !== req.user.id)) {
      return res.status(403).json({ success: false, error: 'Not authorized to update this course.' });
    }

    const allowedFields = ['title', 'description', 'category', 'level', 'thumbnail', 'celebrityTeacher', 'price', 'duration', 'rating', 'outcomes', 'xp', 'gradient', 'icon'];
    const dataToUpdate = Object.fromEntries(Object.entries(req.body).filter(([key]) => allowedFields.includes(key)));
    if (dataToUpdate.price !== undefined) {
      dataToUpdate.price = Math.round(parseFloat(dataToUpdate.price) * 100) || 0;
    }
    if (dataToUpdate.rating !== undefined) {
      dataToUpdate.rating = parseFloat(dataToUpdate.rating) || 4.5;
    }

    const updated = await prisma.course.update({
      where: { id: req.params.id },
      data: dataToUpdate
    });
    // Invalidate course cache
    await clearCache('cache:/api/courses');
    res.status(200).json({ success: true, data: formatPrice(updated) });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete course
// @route   DELETE /api/courses/:id
// @access  Private (Admin/Instructor)
exports.deleteCourse = async (req, res, next) => {
  try {
    const course = await prisma.course.findUnique({ where: { id: req.params.id } });
    if (!course) {
      return res.status(404).json({ success: false, error: 'Course not found' });
    }

    if (req.user.role !== 'admin' && (req.user.role !== 'instructor' || course.instructorId !== req.user.id)) {
      return res.status(403).json({ success: false, error: 'Not authorized to delete this course.' });
    }

    await prisma.course.delete({ where: { id: req.params.id } });
    // Invalidate course cache
    await clearCache('cache:/api/courses');
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};

// @desc    Add lesson to course
// @route   POST /api/courses/:courseId/lessons
// @access  Private (Admin/Instructor)
exports.addLesson = async (req, res, next) => {
  try {
    const course = await prisma.course.findUnique({ where: { id: req.params.courseId } });
    if (!course) {
      return res.status(404).json({ success: false, error: 'Course not found' });
    }

    if (req.user.role !== 'admin' && (req.user.role !== 'instructor' || course.instructorId !== req.user.id)) {
      return res.status(403).json({ success: false, error: 'Not authorized to add lessons to this course.' });
    }

    const { title, content, videoUrl, order } = req.body;
    const lesson = await prisma.lesson.create({
      data: {
        title,
        content,
        videoUrl,
        order: Number(order),
        courseId: req.params.courseId
      }
    });
    // Invalidate course cache
    await clearCache('cache:/api/courses');
    res.status(201).json({ success: true, data: lesson });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete lesson from course
// @route   DELETE /api/courses/:courseId/lessons/:lessonId
// @access  Private (Admin/Instructor)
exports.deleteLesson = async (req, res, next) => {
  try {
    const course = await prisma.course.findUnique({ where: { id: req.params.courseId } });
    if (!course) {
      return res.status(404).json({ success: false, error: 'Course not found' });
    }

    if (req.user.role !== 'admin' && (req.user.role !== 'instructor' || course.instructorId !== req.user.id)) {
      return res.status(403).json({ success: false, error: 'Not authorized to delete lessons from this course.' });
    }

    const lesson = await prisma.lesson.findUnique({ where: { id: req.params.lessonId } });
    if (!lesson || lesson.courseId !== req.params.courseId) {
      return res.status(404).json({ success: false, error: 'Lesson not found' });
    }

    await prisma.lesson.delete({ where: { id: req.params.lessonId } });
    // Invalidate course cache
    await clearCache('cache:/api/courses');
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};

// @desc    Get instructor statistics
// @route   GET /api/courses/instructor/stats
// @access  Private (Instructor/Admin)
exports.getInstructorStats = async (req, res, next) => {
  try {
    const instructorId = req.user.id;

    // Get all courses by this instructor
    const courses = await prisma.course.findMany({
      where: { instructorId },
      select: { id: true, price: true }
    });

    const courseIds = courses.map(c => c.id);

    // Get all enrollments for these courses
    const enrollments = await prisma.enrollment.findMany({
      where: { courseId: { in: courseIds } },
      include: { course: { select: { price: true } } }
    });

    const totalStudents = enrollments.length;
    const totalCourses = courses.length;
    const totalRevenue = enrollments.reduce((sum, enr) => sum + (enr.course?.price || 0), 0);

    res.status(200).json({
      success: true,
      data: {
        totalStudents,
        totalCourses,
        totalRevenue
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all learning paths
// @route   GET /api/courses/learning-paths
// @access  Public
exports.getLearningPaths = async (req, res, next) => {
  try {
    const paths = await prisma.learningPath.findMany({
      include: {
        courses: {
          select: { id: true, title: true, duration: true, thumbnail: true }
        }
      }
    });
    res.status(200).json({ success: true, data: paths });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate course lessons with AI
// @route   POST /api/courses/:courseId/generate-lessons
// @access  Private (Admin/Instructor)
exports.generateLessonsAI = async (req, res, next) => {
  try {
    const courseId = req.params.courseId;
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: { lessons: true }
    });

    if (!course) {
      return res.status(404).json({ success: false, error: 'Course not found' });
    }

    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Not authorized to generate lessons for this course. Admin only.' });
    }

    // Delete existing lessons to give a fresh AI syllabus
    await prisma.lesson.deleteMany({
      where: { courseId }
    });

    const { generateLessonsForCourse } = require('../utils/aiGenerator');
    const lessonsData = await generateLessonsForCourse(course.title, course.category, course.level);

    // Create the lessons
    const createdLessons = [];
    for (const l of lessonsData) {
      const created = await prisma.lesson.create({
        data: {
          title: l.title,
          content: l.content,
          videoUrl: l.videoUrl,
          order: l.order,
          courseId
        }
      });
      createdLessons.push(created);
    }

    // Update course duration count
    await prisma.course.update({
      where: { id: courseId },
      data: {
        duration: `${lessonsData.length * 20} Mins`
      }
    });

    // Invalidate course cache
    await clearCache('cache:/api/courses');

    res.status(200).json({ success: true, data: createdLessons });
  } catch (error) {
    next(error);
  }
};

exports.duplicateCourse = async (req, res, next) => {
  try {
    const source = await prisma.course.findUnique({ where: { id: req.params.id }, include: { lessons: { orderBy: { order: 'asc' } } } });
    if (!source) return res.status(404).json({ success: false, error: 'Course not found' });
    const copy = await prisma.$transaction(async (tx) => tx.course.create({ data: {
      title: `${source.title} (Copy)`, description: source.description, category: source.category, level: source.level,
      price: source.price, thumbnail: source.thumbnail, celebrityTeacher: source.celebrityTeacher, duration: source.duration,
      rating: source.rating, outcomes: source.outcomes, xp: source.xp, gradient: source.gradient, icon: source.icon,
      status: 'pending', instructorId: source.instructorId,
      lessons: { create: source.lessons.map((lesson) => ({ title: lesson.title, content: lesson.content, videoUrl: lesson.videoUrl, order: lesson.order, type: lesson.type, durationSeconds: lesson.durationSeconds, resources: lesson.resources, transcript: lesson.transcript })) },
    }, include: { lessons: true } }));
    await clearCache('cache:/api/courses');
    await audit(req, 'course.duplicate', 'Course', copy.id, { sourceId: source.id }, { title: copy.title });
    res.status(201).json({ success: true, data: formatPrice(copy) });
  } catch (error) { next(error); }
};

exports.updateLesson = async (req, res, next) => {
  try {
    const lesson = await prisma.lesson.findFirst({ where: { id: req.params.lessonId, courseId: req.params.courseId } });
    if (!lesson) return res.status(404).json({ success: false, error: 'Lesson not found' });
    const allowed = ['title', 'content', 'videoUrl', 'type', 'durationSeconds', 'resources', 'transcript'];
    const data = Object.fromEntries(Object.entries(req.body).filter(([key]) => allowed.includes(key)));
    if (data.title !== undefined && !String(data.title).trim()) return res.status(400).json({ success: false, error: 'Lesson title cannot be empty' });
    const updated = await prisma.lesson.update({ where: { id: lesson.id }, data });
    await clearCache('cache:/api/courses');
    await audit(req, 'lesson.update', 'Lesson', lesson.id, lesson, updated);
    res.json({ success: true, data: updated });
  } catch (error) { next(error); }
};

exports.reorderLessons = async (req, res, next) => {
  try {
    const orderedIds = req.body.lessonIds;
    if (!Array.isArray(orderedIds) || !orderedIds.length || new Set(orderedIds).size !== orderedIds.length) return res.status(400).json({ success: false, error: 'A unique ordered lessonIds array is required' });
    const lessons = await prisma.lesson.findMany({ where: { courseId: req.params.courseId }, select: { id: true } });
    if (lessons.length !== orderedIds.length || lessons.some((lesson) => !orderedIds.includes(lesson.id))) return res.status(400).json({ success: false, error: 'lessonIds must contain every lesson in this course exactly once' });
    await prisma.$transaction(async (tx) => {
      for (let index = 0; index < orderedIds.length; index += 1) await tx.lesson.update({ where: { id: orderedIds[index] }, data: { order: -(index + 1) } });
      for (let index = 0; index < orderedIds.length; index += 1) await tx.lesson.update({ where: { id: orderedIds[index] }, data: { order: index + 1 } });
    });
    await clearCache('cache:/api/courses');
    await audit(req, 'lesson.reorder', 'Course', req.params.courseId, null, { lessonIds: orderedIds });
    res.json({ success: true, data: { lessonIds: orderedIds } });
  } catch (error) { next(error); }
};
