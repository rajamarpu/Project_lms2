const { prisma } = require('../config/db');

exports.findCourseById = async (id, include = null) => {
  return await prisma.course.findUnique({
    where: { id },
    ...(include ? { include } : {})
  });
};

exports.createCourseWithLessons = async (courseData, generateAI) => {
  const course = await prisma.course.create({ data: courseData });

  if (generateAI) {
    const { generateLessonsForCourse } = require('../utils/aiGenerator');
    const lessonsData = await generateLessonsForCourse(courseData.title, courseData.category, courseData.level);
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
    await prisma.course.update({
      where: { id: course.id },
      data: { duration: `${lessonsData.length * 20} Mins` }
    });
  }
  return course;
};

exports.generateCourseLessons = async (courseId, courseTitle, courseCategory, courseLevel) => {
  await prisma.lesson.deleteMany({ where: { courseId } });

  const { generateLessonsForCourse } = require('../utils/aiGenerator');
  const lessonsData = await generateLessonsForCourse(courseTitle, courseCategory, courseLevel);

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

  await prisma.course.update({
    where: { id: courseId },
    data: { duration: `${lessonsData.length * 20} Mins` }
  });

  return createdLessons;
};
