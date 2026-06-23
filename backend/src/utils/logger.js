const pino = require('pino');
const env = require('../config/env');

const isProduction = env.NODE_ENV === 'production';

// Configure Pino
const logger = pino({
  level: env.LOG_LEVEL,
  transport: !isProduction ? {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:standard',
      ignore: 'pid,hostname',
    },
  } : undefined,
});

module.exports = logger;
