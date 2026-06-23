const { prisma } = require('./src/config/db');

async function testQuery() {
  try {
    const user = await prisma.user.findUnique({
      where: { id: 'cmqqefj5700001oujr3n85cc6' },
      select: { id: true, name: true, email: true, role: true, status: true }
    });
    console.log('Result:', user);
  } catch (error) {
    console.error('ERROR OCCURRED:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testQuery();
