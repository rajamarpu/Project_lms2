require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { readReplicas } = require('@prisma/extension-read-replicas');
const logger = require('../utils/logger');

// Support test database URL fallback
const dbUrl = process.env.NODE_ENV === 'test'
  ? (process.env.TEST_DATABASE_URL || process.env.DATABASE_URL)
  : process.env.DATABASE_URL;

// Validate needed environment variables
const requiredEnv = ['DATABASE_URL', 'JWT_SECRET'];
if (process.env.NODE_ENV === 'test') {
  // If we are in test environment, we require either TEST_DATABASE_URL or DATABASE_URL
  if (!process.env.TEST_DATABASE_URL && !process.env.DATABASE_URL) {
    requiredEnv.push('TEST_DATABASE_URL');
  }
}
const missingEnv = requiredEnv.filter(envVar => !process.env[envVar]);

if (missingEnv.length > 0) {
  console.error('\x1b[31m%s\x1b[0m', `FATAL STARTUP ERROR: Missing required environment variables: ${missingEnv.join(', ')}`);
  console.error('\x1b[33m%s\x1b[0m', 'Please verify your backend/.env file is configured correctly based on .env.example.');
  process.exit(1);
}

if (!dbUrl) {
  console.error('\x1b[31m%s\x1b[0m', 'FATAL STARTUP ERROR: Database connection URL is not defined.');
  process.exit(1);
}

// Setup adapter with selected DB URL
const adapter = new PrismaPg({ connectionString: dbUrl });

// Base prisma client
const basePrisma = new PrismaClient({ 
  adapter,
  log: ['query', 'info', 'warn', 'error'],
});

// Extend prisma client with read replicas ONLY if a replica URL is provided and not in test mode
const replicaUrl = process.env.NODE_ENV === 'test' ? null : process.env.DATABASE_URL_REPLICA;
const prisma = replicaUrl 
  ? basePrisma.$extends(
      readReplicas({
        url: replicaUrl,
      })
    )
  : basePrisma;

const connectDB = async () => {
  try {
    await basePrisma.$connect();
    logger.info(`PostgreSQL Connected via Prisma (Mode: ${process.env.NODE_ENV || 'development'})`);
    if (replicaUrl) {
      logger.info('Database Read-Replica Ready');
    }
  } catch (error) {
    console.error('\x1b[31m%s\x1b[0m', '=========================================================================');
    console.error('\x1b[31m%s\x1b[0m', 'DATABASE CONNECTION ERROR: Failed to connect to the database via Prisma.');
    console.error('\x1b[31m%s\x1b[0m', '=========================================================================');
    console.error('Error Details:', error.message || error);
    console.error('\n\x1b[33m%s\x1b[0m', 'Troubleshooting Checklist:');
    
    if (dbUrl.includes('supabase.com') || dbUrl.includes('supabase.co')) {
      console.error('\x1b[36m%s\x1b[0m', '[SUPABASE DETECTED]');
      console.error('- Supabase direct host connections (port 5432) can fail on IPv4-only networks.');
      console.error('  If direct connection fails, switch your connection string to use the Connection Pooler');
      console.error('  (typically on port 6543 with "?pgbouncer=true" or port 5432 depending on your Supabase config).');
      console.error('- Ensure your database password does not contain special characters that require URL-encoding, or');
      console.error('  properly percent-encode it (e.g. @ as %40).');
    } else if (dbUrl.includes('localhost') || dbUrl.includes('127.0.0.1')) {
      console.error('\x1b[36m%s\x1b[0m', '[LOCAL DATABASE DETECTED]');
      console.error('- Ensure your local PostgreSQL service is running.');
      console.error('- Verify the username, password, and port (default: 5432) are correct.');
      console.error('- Verify the target database actually exists.');
    } else {
      console.error('1. Check if the database server is running.');
      console.error('2. Verify the credentials, hostname, port, and database name in your connection URL.');
    }
    
    console.error('=========================================================================\n');
    logger.error({ err: error }, 'Database connection error');
    process.exit(1);
  }
};

module.exports = { connectDB, prisma };
