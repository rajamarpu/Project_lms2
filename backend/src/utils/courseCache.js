const { clearCache } = require('../middlewares/cache.middleware');

const COURSE_CACHE_PREFIXES = [
  'cache:/api/courses',
  'cache:/api/v1/courses',
];

const clearCourseCaches = async () => {
  await Promise.all(COURSE_CACHE_PREFIXES.map((prefix) => clearCache(prefix)));
};

module.exports = { clearCourseCaches };
