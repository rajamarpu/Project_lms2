const { prisma } = require('./src/config/db');

async function inspect() {
  try {
    const count = await prisma.course.count();
    console.log('TOTAL COURSE COUNT IN DB:', count);
    
    const courses = await prisma.course.findMany({
      select: {
        id: true,
        title: true,
        status: true
      }
    });
    console.log('COURSES:', courses);
  } catch (err) {
    console.error('ERROR:', err);
  } finally {
    await prisma.$disconnect();
  }
}

inspect();
