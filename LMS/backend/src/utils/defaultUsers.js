const bcrypt = require('bcryptjs');

async function ensureDefaultUsers(prisma) {
  const email = process.env.DEFAULT_ADMIN_EMAIL;
  const password = process.env.DEFAULT_ADMIN_PASSWORD;

  if (!email || !password) {
    return [];
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const dbUser = await prisma.user.upsert({
    where: { email },
    update: {
      password: hashedPassword,
      role: 'admin',
      status: 'approved'
    },
    create: {
      name: 'Admin User',
      email,
      password: hashedPassword,
      role: 'admin',
      status: 'approved'
    }
  });

  return [{ ...dbUser, password }];
}

module.exports = { ensureDefaultUsers };
