require('dotenv').config();
const bcrypt = require('bcryptjs');
const { prisma } = require('../src/config/db');

async function ensureAdminOwner() {
  const adminEmail = (process.env.ADMIN_EMAIL || 'admin@gmail.com').trim().toLowerCase();
  const existingAdmin = await prisma.user.findFirst({
    where: { role: 'admin', status: 'approved' },
    orderBy: { createdAt: 'asc' }
  });

  if (existingAdmin) {
    return existingAdmin;
  }

  const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'admin123', 10);
  return prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      role: 'admin',
      status: 'approved',
      password: hashedPassword
    },
    create: {
      name: process.env.ADMIN_NAME || 'Admin',
      email: adminEmail,
      password: hashedPassword,
      role: 'admin',
      status: 'approved'
    }
  });
}

async function main() {
  const adminOwner = await ensureAdminOwner();
  const instructors = await prisma.user.findMany({
    where: { role: 'instructor' },
    select: { id: true, email: true }
  });

  if (!instructors.length) {
    console.log('No instructor accounts found.');
    return;
  }

  const instructorIds = instructors.map((instructor) => instructor.id);

  const [courseResult, liveSessionResult] = await prisma.$transaction([
    prisma.course.updateMany({
      where: { instructorId: { in: instructorIds } },
      data: { instructorId: adminOwner.id }
    }),
    prisma.liveSession.updateMany({
      where: { instructorId: { in: instructorIds } },
      data: { instructorId: adminOwner.id }
    })
  ]);

  const deleted = await prisma.user.deleteMany({
    where: { id: { in: instructorIds } }
  });

  console.log(JSON.stringify({
    reassignedCourses: courseResult.count,
    reassignedLiveSessions: liveSessionResult.count,
    deletedInstructors: deleted.count,
    adminOwnerEmail: adminOwner.email
  }, null, 2));
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
