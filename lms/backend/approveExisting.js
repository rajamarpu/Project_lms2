const { prisma } = require('./src/config/db');

async function approveExisting() {
  try {
    await prisma.user.updateMany({
      data: { status: 'approved' }
    });
    await prisma.course.updateMany({
      data: { status: 'approved' }
    });
    console.log('All existing users and courses marked as approved.');
  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

approveExisting();
