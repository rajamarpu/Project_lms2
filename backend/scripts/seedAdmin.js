/**
 * Ensures a default admin account exists so the AdminLogin screen's
 * "Test Credentials" (admin@gmail.com / admin123) actually works.
 *
 * Safe to run multiple times — upserts rather than failing on duplicate.
 *
 * Usage: node scripts/seedAdmin.js
 */
const bcrypt = require('bcryptjs');
const { prisma } = require('../src/config/db');

const ADMIN_EMAIL = 'admin@gmail.com';
const ADMIN_PASSWORD = 'admin123';

async function seedAdmin() {
  const existing = await prisma.user.findUnique({ where: { email: ADMIN_EMAIL } });

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, salt);

  if (existing) {
    if (existing.role !== 'admin' || existing.status !== 'approved') {
      await prisma.user.update({
        where: { email: ADMIN_EMAIL },
        data: { role: 'admin', status: 'approved' },
      });
      console.log(`Updated existing user ${ADMIN_EMAIL} to admin/approved.`);
    } else {
      console.log(`Admin user ${ADMIN_EMAIL} already exists and is correctly configured.`);
    }
    return;
  }

  await prisma.user.create({
    data: {
      name: 'Admin',
      email: ADMIN_EMAIL,
      password: hashedPassword,
      role: 'admin',
      status: 'approved',
    },
  });

  console.log(`Created admin user: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
}

seedAdmin()
  .catch((err) => {
    console.error('Failed to seed admin user:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
