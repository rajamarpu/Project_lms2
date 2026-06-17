const bcrypt = require('bcryptjs');
const { prisma } = require('./src/config/db');

async function createAdmin() {
  try {
    const email = process.env.ADMIN_EMAIL || 'admin@gmail.com';
    const password = process.env.ADMIN_PASSWORD || 'admin123';
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    await prisma.user.upsert({
      where: { email },
      update: {
        password: hashedPassword,
        role: 'admin',
        status: 'approved'
      },
      create: {
        name: process.env.ADMIN_NAME || 'Admin',
        email: email,
        password: hashedPassword,
        role: 'admin',
        status: 'approved'
      }
    });
    console.log('Admin account created/updated successfully!');
    
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
  } catch (error) {
    console.error('Error creating admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
