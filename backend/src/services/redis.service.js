const Redis = require('ioredis-mock');
const logger = require('../utils/logger');
const env = require('../config/env');

// Connect to Redis instance
// Default is localhost:6379, configurable via env variables
const redis = new Redis(env.REDIS_URL || {
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  // password: env.REDIS_PASSWORD,
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
