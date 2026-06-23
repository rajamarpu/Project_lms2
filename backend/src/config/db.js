require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { readReplicas } = require('@prisma/extension-read-replicas');
const logger = require('../utils/logger');

// Validate required environment variables on startup
const requiredEnv = ['DATABASE_URL', 'JWT_SECRET'];
const missingEnv = requiredEnv.filter(envVar => !process.env[envVar]);

if (missingEnv.length > 0) {
  console.error('\x1b[31m%s\x1b[0m', `FATAL STARTUP ERROR: Missing required environment variables: ${missingEnv.join(', ')}`);
  console.error('\x1b[33m%s\x1b[0m', 'Please verify your backend/.env file is configured correctly based on .env.example.');
  process.exit(1);
}

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });

// Base prisma client
const basePrisma = new PrismaClient({ 
  adapter,
  log: ['query', 'info', 'warn', 'error'],
});

// Extend prisma client with read replicas ONLY if a replica URL is provided
const prisma = process.env.DATABASE_URL_REPLICA 
  ? basePrisma.$extends(
      readReplicas({
        url: process.env.DATABASE_URL_REPLICA,
      })
    )
  : basePrisma;

const connectDB = async () => {
  try {
    await basePrisma.$connect();
    logger.info('PostgreSQL Primary Connected via Prisma');
    logger.info(`Database Read-Replica Ready: ${!!process.env.DATABASE_URL_REPLICA}`);
  } catch (error) {
    console.error('\x1b[31m%s\x1b[0m', '=========================================================================');
    console.error('\x1b[31m%s\x1b[0m', 'DATABASE CONNECTION ERROR: Failed to connect to the database via Prisma.');
    console.error('\x1b[31m%s\x1b[0m', '=========================================================================');
    console.error('Error Details:', error.message || error);
    console.error('\n\x1b[33m%s\x1b[0m', 'Troubleshooting Checklist:');
    console.error('1. Check if the database server is running (locally or on the cloud).');
    console.error('2. Verify the credentials, hostname, port, and database name in DATABASE_URL.');
    console.error('3. IPv6 Issues: If using Supabase and direct connection (db.[ref].supabase.co) fails,');
    console.error('   switch to the pooler connection string (aws-1-ap-southeast-2.pooler.supabase.com) on port 5432/6543.');
    console.error('4. Network/Firewall: Verify your local network allows outbound connection on port 5432 or 6543.');
    console.error('=========================================================================\n');
    logger.error({ err: error }, 'Database connection error');
    process.exit(1);
  }
};

module.exports = { connectDB, prisma };
