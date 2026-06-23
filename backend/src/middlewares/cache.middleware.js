const redis = require('../services/redis.service');
const logger = require('../utils/logger');

/**
 * Caching middleware
 * @param {number} duration - Cache duration in seconds
 */
const cacheMiddleware = (duration = 300) => {
  return async (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Generate cache key from URL path and query string
    const key = `cache:${req.originalUrl || req.url}`;

    try {
      // Check if key exists in Redis cache
      const cachedResponse = await redis.get(key);
      
      if (cachedResponse) {
        // Return cached response
        return res.status(200).json(JSON.parse(cachedResponse));
      } else {
        // Overwrite res.json to cache the response body before sending it
        const originalJson = res.json.bind(res);
        res.json = (body) => {
          // Only cache successful responses
          if (res.statusCode >= 200 && res.statusCode < 300) {
            // Asynchronously store in redis
            redis.setex(key, duration, JSON.stringify(body)).catch(err => {
              logger.error({ err }, 'Redis Set Error');
            });
          }
          return originalJson(body);
        };
        next();
      }
    } catch (err) {
      logger.error({ err }, 'Redis Get Error');
      // Fallback to normal execution if Redis fails
      next();
    }
  };
};

/**
 * Utility to clear cache manually if needed (e.g. after adding a new course)
 * @param {string} keyPrefix - Pattern to clear (e.g. 'cache:/api/courses')
 */
const clearCache = async (keyPrefix) => {
  try {
    const pattern = `${keyPrefix}*`;
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(keys);
      logger.info(`Cleared cache for keys matching ${pattern}`);
    }
  } catch (err) {
    logger.error({ err }, 'Redis Clear Cache Error');
  }
};

module.exports = { cacheMiddleware, clearCache };
