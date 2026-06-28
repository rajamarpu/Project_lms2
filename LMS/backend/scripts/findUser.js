const { prisma } = require('../src/config/db');

const email = process.argv[2];
if (!email) {
  console.error('Usage: node scripts/findUser.js user@example.com');
  process.exit(1);
}

(async () => {
  try {
    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
    console.log('User found:', !!user);
    if (user) console.log({ id: user.id, name: user.name, email: user.email, role: user.role, status: user.status });
  } catch (err) {
    console.error('Error querying DB:', err.message);
  } finally {
    await prisma.$disconnect();
  }
})();