const { prisma } = require('./src/config/db');
const bcrypt = require('bcryptjs');

async function test() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'shubham3@gmail.com' }
    });
    console.log('User in database:', user);
    
    if (user) {
      const match = await bcrypt.compare('shubham123', user.password);
      console.log('Password "shubham123" match status:', match);
    } else {
      console.log('No user found with email shubham3@gmail.com');
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

test();
