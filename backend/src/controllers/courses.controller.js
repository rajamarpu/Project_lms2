const { prisma } = require('../config/db');
const { safePage } = require('../utils/platformRules');
const { audit } = require('../services/audit.service');
const { clearCourseCaches } = require('../utils/courseCache');

// @desc    Get all courses
// @route   GET /api/courses
// @access  Public
exports.getCourses = async (req, res, next) => {
  try {
    const { category, level, search } = req.query;
    const { page: pageNumber, limit: limitNumber, skip, orderBy } = safePage(req.query, ['createdAt', 'title', 'rating', 'price']);

    const where = { AND: [{ OR: [{ status: 'approved' }, { status: 'scheduled', scheduledAt: { lte: new Date() } }] }] };

    if (category) where.category = category;
    if (level) where.level = level;

    if (search) {
      where.AND.push({
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { celebrityTeacher: { contains: search, mode: 'insensitive' } }
        ]
      });
    }

    const [courses, total] = await Promise.all([
      prisma.course.findMany({
        where,
        include: {
          instructor: { select: { id: true, name: true, email: true, avatar: true } },
          lessons: true,
          learningPaths: { select: { id: true, title: true, slug: true } },
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
      data: courses,
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
        instructor: { select: { id: true, name: true, email: true, avatar: true } },
        lessons: { orderBy: { order: 'asc' } },
        learningPaths: { select: { id: true, title: true, slug: true } },
        _count: { select: { enrollments: true } }
      }
    });

    if (!course) {
      return res.status(404).json({ success: false, error: 'Course not found' });
    }

    const isPublished = course.status === 'approved' || (course.status === 'scheduled' && course.scheduledAt && course.scheduledAt <= new Date());
    if (!isPublished) {
      const isOwner = req.user && course.instructorId === req.user.id;
      const isAdmin = req.user && req.user.role === 'admin';
      if (!isOwner && !isAdmin) {
        return res.status(404).json({ success: false, error: 'Course not found' });
      }
    }

    res.status(200).json({ success: true, data: course });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new course
// @route   POST /api/courses
// @access  Private (Admin)
exports.createCourse = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Only admins can create and generate courses' });
    }

    const {
      title,
      description,
      category,
      level,
      thumbnail,
      celebrityTeacher,
      price,
      duration,
      rating,
      outcomes,
      xp,
      gradient,
      icon,
      status,
      generateAI,
      instructorId,
      learningPathIds
    } = req.body;

    const publishNow = status === 'approved';
    const approvedInstructors = await prisma.user.findMany({
      where: { role: 'instructor', status: 'approved' },
      select: { id: true, name: true, _count: { select: { courses: true } } },
      orderBy: { createdAt: 'asc' }
    });

    let resolvedInstructorId = req.user.id;
    if (instructorId) {
      const selectedInstructor = approvedInstructors.find((item) => item.id === instructorId);
      if (!selectedInstructor) {
        return res.status(400).json({ success: false, error: 'Selected instructor is unavailable' });
      }
      resolvedInstructorId = selectedInstructor.id;
    } else if (approvedInstructors.length) {
      const minCourses = Math.min(...approvedInstructors.map((item) => item._count.courses));
      const candidates = approvedInstructors.filter((item) => item._count.courses === minCourses);
      resolvedInstructorId = candidates[Math.floor(Math.random() * candidates.length)].id;
    }

    const normalizedLearningPathIds = Array.isArray(learningPathIds)
      ? [...new Set(learningPathIds.map((id) => String(id).trim()).filter(Boolean))]
      : [];

    if (normalizedLearningPathIds.length) {
      const learningPathCount = await prisma.learningPath.count({ where: { id: { in: normalizedLearningPathIds } } });
      if (learningPathCount !== normalizedLearningPathIds.length) {
        return res.status(400).json({ success: false, error: 'One or more selected learning paths are invalid' });
      }
    }

    const course = await prisma.course.create({
      data: {
        title,
        description,
        category,
        level: level || 'Beginner',
        thumbnail,
        celebrityTeacher,
        price: price ? parseFloat(price) : 0,
        duration: duration || 'Self-paced',
        rating: rating ? parseFloat(rating) : 4.5,
        outcomes: outcomes || [],
        xp: xp || '1000 XP',
        gradient: gradient || 'from-blue-600 via-blue-500 to-cyan-400',
        icon: icon || 'robot',
        status: publishNow ? 'approved' : 'draft',
        publishedAt: publishNow ? new Date() : null,
        instructorId: resolvedInstructorId,
        learningPaths: normalizedLearningPathIds.length
          ? { connect: normalizedLearningPathIds.map((id) => ({ id })) }
          : undefined
      },
      include: {
        learningPaths: { select: { id: true, title: true, slug: true } }
      }
    });

    if (generateAI) {
      const { generateLessonsForCourse } = require('../utils/aiGenerator');
      const lessonsData = await generateLessonsForCourse(title, category, level);
      for (const lesson of lessonsData) {
        await prisma.lesson.create({
          data: {
            title: lesson.title,
            content: lesson.content,
            videoUrl: lesson.videoUrl,
            order: lesson.order,
            courseId: course.id
          }
        });
      }
      await prisma.course.update({
        where: { id: course.id },
        data: { duration: `${lessonsData.length * 20} Mins` }
      });
    }

    await clearCourseCaches();
    await audit(req, publishNow ? 'course.create.publish' : 'course.create.draft', 'Course', course.id, null, {
      title: course.title,
      status: course.status,
      instructorId: resolvedInstructorId,
      learningPathIds: normalizedLearningPathIds
    });
    res.status(201).json({ success: true, data: course });
  } catch (error) {
    next(error);
  }
};

// @desc    Update course
// @route   PUT /api/courses/:id
// @access  Private (Admin)
exports.updateCourse = async (req, res, next) => {
  try {
    const course = await prisma.course.findUnique({
      where: { id: req.params.id },
      include: { learningPaths: { select: { id: true, title: true, slug: true } } }
    });
    if (!course) {
      return res.status(404).json({ success: false, error: 'Course not found' });
    }

    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Not authorized to update this course. Admin only.' });
    }

    const allowedFields = ['title', 'description', 'category', 'level', 'thumbnail', 'celebrityTeacher', 'price', 'duration', 'rating', 'outcomes', 'xp', 'gradient', 'icon', 'instructorId', 'status'];
    const dataToUpdate = Object.fromEntries(Object.entries(req.body).filter(([key]) => allowedFields.includes(key)));
    const normalizedLearningPathIds = Array.isArray(req.body.learningPathIds)
      ? [...new Set(req.body.learningPathIds.map((id) => String(id).trim()).filter(Boolean))]
      : null;

    if (dataToUpdate.status !== undefined) {
      const statusAliases = {
        publish: 'approved',
        published: 'approved',
        unpublish: 'draft',
        unpublished: 'draft',
      };
      dataToUpdate.status = statusAliases[dataToUpdate.status] || dataToUpdate.status;
      if (!['draft', 'pending', 'scheduled', 'approved', 'archived', 'rejected'].includes(dataToUpdate.status)) {
        return res.status(400).json({ success: false, error: 'Invalid course status' });
      }
      dataToUpdate.publishedAt = dataToUpdate.status === 'approved' ? new Date() : course.publishedAt;
      dataToUpdate.archivedAt = dataToUpdate.status === 'archived' ? new Date() : null;
      if (dataToUpdate.status !== 'scheduled') dataToUpdate.scheduledAt = null;
      if (dataToUpdate.status !== 'rejected') dataToUpdate.rejectionReason = null;
    }

    if (dataToUpdate.price !== undefined) {
      dataToUpdate.price = parseFloat(dataToUpdate.price) || 0;
    }
    if (dataToUpdate.rating !== undefined) {
      dataToUpdate.rating = parseFloat(dataToUpdate.rating) || 4.5;
    }
    if (dataToUpdate.instructorId) {
      const instructor = await prisma.user.findFirst({
        where: { id: dataToUpdate.instructorId, role: 'instructor', status: 'approved' },
        select: { id: true }
      });
      if (!instructor) {
        return res.status(400).json({ success: false, error: 'Selected instructor is unavailable' });
      }
    }
    if (normalizedLearningPathIds) {
      const learningPathCount = normalizedLearningPathIds.length
        ? await prisma.learningPath.count({ where: { id: { in: normalizedLearningPathIds } } })
        : 0;
      if (learningPathCount !== normalizedLearningPathIds.length) {
        return res.status(400).json({ success: false, error: 'One or more selected learning paths are invalid' });
      }
      dataToUpdate.learningPaths = { set: normalizedLearningPathIds.map((id) => ({ id })) };
    }

    const updated = await prisma.course.update({
      where: { id: req.params.id },
      data: dataToUpdate,
      include: { learningPaths: { select: { id: true, title: true, slug: true } } }
    });
    await clearCourseCaches();
    await audit(req, 'course.update', 'Course', updated.id, course, updated);
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete course
// @route   DELETE /api/courses/:id
// @access  Private (Admin)
exports.deleteCourse = async (req, res, next) => {
  try {
    const course = await prisma.course.findUnique({ where: { id: req.params.id } });
    if (!course) {
      return res.status(404).json({ success: false, error: 'Course not found' });
    }

    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Not authorized to delete this course. Admin only.' });
    }

    await prisma.course.delete({ where: { id: req.params.id } });
    await clearCourseCaches();
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};

// @desc    Add lesson to course
// @route   POST /api/courses/:courseId/lessons
// @access  Private (Admin)
exports.addLesson = async (req, res, next) => {
  try {
    const course = await prisma.course.findUnique({ where: { id: req.params.courseId } });
    if (!course) {
      return res.status(404).json({ success: false, error: 'Course not found' });
    }

    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Not authorized to add lessons to this course. Admin only.' });
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
    await clearCourseCaches();
    res.status(201).json({ success: true, data: lesson });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete lesson from course
// @route   DELETE /api/courses/:courseId/lessons/:lessonId
// @access  Private (Admin)
exports.deleteLesson = async (req, res, next) => {
  try {
    const course = await prisma.course.findUnique({ where: { id: req.params.courseId } });
    if (!course) {
      return res.status(404).json({ success: false, error: 'Course not found' });
    }

    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Not authorized to delete lessons from this course. Admin only.' });
    }

    const lesson = await prisma.lesson.findUnique({ where: { id: req.params.lessonId } });
    if (!lesson || lesson.courseId !== req.params.courseId) {
      return res.status(404).json({ success: false, error: 'Lesson not found' });
    }

    await prisma.lesson.delete({ where: { id: req.params.lessonId } });
    await clearCourseCaches();
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

    const courses = await prisma.course.findMany({
      where: { instructorId },
      select: { id: true, price: true }
    });

    const courseIds = courses.map((course) => course.id);
    const enrollments = await prisma.enrollment.findMany({
      where: { courseId: { in: courseIds } },
      include: { course: { select: { price: true } } }
    });

    const totalStudents = enrollments.length;
    const totalCourses = courses.length;
    const totalRevenue = enrollments.reduce((sum, enrollment) => sum + (enrollment.course?.price || 0), 0);

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
// @access  Private (Admin)
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

    await prisma.lesson.deleteMany({ where: { courseId } });

    const { generateLessonsForCourse } = require('../utils/aiGenerator');
    const lessonsData = await generateLessonsForCourse(course.title, course.category, course.level);

    const createdLessons = [];
    for (const lesson of lessonsData) {
      const created = await prisma.lesson.create({
        data: {
          title: lesson.title,
          content: lesson.content,
          videoUrl: lesson.videoUrl,
          order: lesson.order,
          courseId
        }
      });
      createdLessons.push(created);
    }

    await prisma.course.update({
      where: { id: courseId },
      data: { duration: `${lessonsData.length * 20} Mins` }
    });

    await clearCourseCaches();
    res.status(200).json({ success: true, data: createdLessons });
  } catch (error) {
    next(error);
  }
};

exports.duplicateCourse = async (req, res, next) => {
  try {
    const source = await prisma.course.findUnique({
      where: { id: req.params.id },
      include: {
        lessons: { orderBy: { order: 'asc' } },
        learningPaths: { select: { id: true, title: true, slug: true } }
      }
    });
    if (!source) return res.status(404).json({ success: false, error: 'Course not found' });

    const copy = await prisma.$transaction(async (tx) => tx.course.create({
      data: {
        title: `${source.title} (Copy)`,
        description: source.description,
        category: source.category,
        level: source.level,
        price: source.price,
        thumbnail: source.thumbnail,
        celebrityTeacher: source.celebrityTeacher,
        duration: source.duration,
        rating: source.rating,
        outcomes: source.outcomes,
        xp: source.xp,
        gradient: source.gradient,
        icon: source.icon,
        status: 'draft',
        instructorId: source.instructorId,
        learningPaths: source.learningPaths.length ? { connect: source.learningPaths.map((path) => ({ id: path.id })) } : undefined,
        lessons: {
          create: source.lessons.map((lesson) => ({
            title: lesson.title,
            content: lesson.content,
            videoUrl: lesson.videoUrl,
            order: lesson.order,
            type: lesson.type,
            durationSeconds: lesson.durationSeconds,
            resources: lesson.resources,
            transcript: lesson.transcript
          }))
        }
      },
      include: {
        lessons: true,
        learningPaths: { select: { id: true, title: true, slug: true } }
      }
    }));

    await clearCourseCaches();
    await audit(req, 'course.duplicate', 'Course', copy.id, { sourceId: source.id }, { title: copy.title });
    res.status(201).json({ success: true, data: copy });
  } catch (error) {
    next(error);
  }
};

exports.updateLesson = async (req, res, next) => {
  try {
    const lesson = await prisma.lesson.findFirst({ where: { id: req.params.lessonId, courseId: req.params.courseId } });
    if (!lesson) return res.status(404).json({ success: false, error: 'Lesson not found' });

    const allowed = ['title', 'content', 'videoUrl', 'type', 'durationSeconds', 'resources', 'transcript'];
    const data = Object.fromEntries(Object.entries(req.body).filter(([key]) => allowed.includes(key)));
    if (data.title !== undefined && !String(data.title).trim()) {
      return res.status(400).json({ success: false, error: 'Lesson title cannot be empty' });
    }

    const updated = await prisma.lesson.update({ where: { id: lesson.id }, data });
    await clearCourseCaches();
    await audit(req, 'lesson.update', 'Lesson', lesson.id, lesson, updated);
    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

exports.reorderLessons = async (req, res, next) => {
  try {
    const orderedIds = req.body.lessonIds;
    if (!Array.isArray(orderedIds) || !orderedIds.length || new Set(orderedIds).size !== orderedIds.length) {
      return res.status(400).json({ success: false, error: 'A unique ordered lessonIds array is required' });
    }

    const lessons = await prisma.lesson.findMany({ where: { courseId: req.params.courseId }, select: { id: true } });
    if (lessons.length !== orderedIds.length || lessons.some((lesson) => !orderedIds.includes(lesson.id))) {
      return res.status(400).json({ success: false, error: 'lessonIds must contain every lesson in this course exactly once' });
    }

    await prisma.$transaction(async (tx) => {
      for (let index = 0; index < orderedIds.length; index += 1) {
        await tx.lesson.update({ where: { id: orderedIds[index] }, data: { order: -(index + 1) } });
      }
      for (let index = 0; index < orderedIds.length; index += 1) {
        await tx.lesson.update({ where: { id: orderedIds[index] }, data: { order: index + 1 } });
      }
    });

    await clearCourseCaches();
    await audit(req, 'lesson.reorder', 'Course', req.params.courseId, null, { lessonIds: orderedIds });
    res.json({ success: true, data: { lessonIds: orderedIds } });
  } catch (error) {
    next(error);
  }
};
