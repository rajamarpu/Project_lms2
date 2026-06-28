const bcrypt = require('bcryptjs');
const { prisma } = require('./src/config/db');

async function seed() {
  try {
    const email = process.env.DEFAULT_STUDENT_EMAIL;
    const password = process.env.DEFAULT_STUDENT_PASSWORD;

    if (!email || !password) {
      console.error('Please set DEFAULT_STUDENT_EMAIL and DEFAULT_STUDENT_PASSWORD before seeding.');
      process.exit(1);
    }

    const users = [
      { name: 'Test Student', email, password, role: 'user' }
    ];

    for (const u of users) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(u.password, salt);

      await prisma.user.upsert({
        where: { email: u.email },
        update: {
          password: hashedPassword,
          role: u.role,
          status: 'approved'
        },
        create: {
          name: u.name,
          email: u.email,
          password: hashedPassword,
          role: u.role,
          status: 'approved'
        }
      });

      console.log(`Seeded user: ${u.email} / ${u.password}`);
    }
  } catch (err) {
    console.error('Seeding error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
