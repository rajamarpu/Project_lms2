const bcrypt = require('bcryptjs');
const { prisma } = require('../src/config/db');

async function main() {
  const email = process.env.DEFAULT_ADMIN_EMAIL;
  const passwordValue = process.env.DEFAULT_ADMIN_PASSWORD;

  if (!email || !passwordValue) {
    console.error('Please set DEFAULT_ADMIN_EMAIL and DEFAULT_ADMIN_PASSWORD before creating an admin account.');
    process.exit(1);
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log('Admin already exists:', email);
    process.exit(0);
  }
  const salt = await bcrypt.genSalt(10);
  const password = await bcrypt.hash(passwordValue, salt);
  const user = await prisma.user.create({
    data: {
      name: 'Admin User',
      email,
      password,
      role: 'admin',
      status: 'approved'
    }
  });
  console.log('Created admin:', user.email);
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
