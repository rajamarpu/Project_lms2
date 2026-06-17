const Redis = require('ioredis-mock');
const logger = require('../utils/logger');

// Connect to Redis instance
// Default is localhost:6379, configurable via env variables
const redis = new Redis(process.env.REDIS_URL || {
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: process.env.REDIS_PORT || 6379,
  // password: process.env.REDIS_PASSWORD,
  enableOfflineQueue: false, // Fail fast if Redis is down instead of hanging
  maxRetriesPerRequest: null // Required by bullmq
});

redis.on('connect', () => {
  logger.info('Successfully connected to Redis');
});

redis.on('error', (err) => {
  logger.error({ err }, 'Redis connection error');
});

module.exports = redis;
