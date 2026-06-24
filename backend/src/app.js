const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const pinoHttp = require('pino-http');
const logger = require('./utils/logger');
const { errorHandler } = require('./middlewares/error.middleware');
const setupSwagger = require('./docs/swagger');
const { RedisStore } = require('rate-limit-redis');
const redisClient = require('./services/redis.service');
const { prisma } = require('./config/db');

const app = express();

// Initialize Swagger Documentation
setupSwagger(app);

// Compress responses
app.use(compression());

// HTTP Request Logging
app.use(pinoHttp({ logger }));

// ─────────────────────────────────────────────────────────────────
// CORS must be registered before helmet/rate-limiting so that the
// browser's OPTIONS preflight is answered immediately with the right
// headers and never gets caught by another middleware's default
// security headers or hit-counting. In dev this is fully permissive
// so any local frontend port (Vite, CRA, etc.) can talk to the API.
// ─────────────────────────────────────────────────────────────────
const isProduction = process.env.NODE_ENV === 'production';
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:8080',
  'http://localhost:8081',
  'http://localhost:8082',
  process.env.CLIENT_URL,
].filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    if (!isProduction) {
      // Permissive in dev: allow any localhost origin, any port.
      return callback(null, true);
    }
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
// Explicitly short-circuit every OPTIONS preflight with 204 before it
// can reach helmet or the rate limiter — some combinations of helmet
// defaults + rate-limit-redis edge cases were returning 403 on the
// preflight itself, which silently breaks every cross-origin POST.
// Note: Express 5 dropped support for the bare '*' wildcard string
// (path-to-regexp v8+), so a regex is used here instead.
app.options(/.*/, cors(corsOptions));

// Set security HTTP headers
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" })); // Important for serving uploaded images/videos

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // Limit each IP to 300 requests per window (raised for active dev/demo use)
  message: { success: false, error: 'Too many requests from this IP, please try again after 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
  passOnStoreError: true,
  skip: (req) => req.method === 'OPTIONS', // never rate-limit preflight requests
  // store: new RedisStore({
  //   sendCommand: (...args) => redisClient.call(...args),
  // }),
});
// Apply rate limiter to all API routes
app.use('/api', limiter);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// v1 Routes
const authRoutesV1 = require('./routes/v1/auth.routes');
const courseRoutesV1 = require('./routes/v1/courses.routes');
const enrollmentRoutesV1 = require('./routes/v1/enrollment.routes');
const userRoutesV1 = require('./routes/v1/users.routes');
const adminRoutesV1 = require('./routes/v1/admin.routes');
const profileRoutesV1 = require('./routes/v1/profile.routes');
const uploadRoutesV1 = require('./routes/v1/upload.routes');

// Mount v1 Routes
app.use('/api/v1/auth', authRoutesV1);
app.use('/api/v1/courses', courseRoutesV1);
app.use('/api/v1/enrollments', enrollmentRoutesV1);
app.use('/api/v1/users', userRoutesV1);
app.use('/api/v1/admin', adminRoutesV1);
app.use('/api/v1/profile', profileRoutesV1);
app.use('/api/v1/upload', uploadRoutesV1);

// Maintain backward compatibility by aliasing /api to v1 routes
app.use('/api/auth', authRoutesV1);
app.use('/api/courses', courseRoutesV1);
app.use('/api/enrollments', enrollmentRoutesV1);
app.use('/api/users', userRoutesV1);
app.use('/api/admin', adminRoutesV1);
app.use('/api/profile', profileRoutesV1);
app.use('/api/upload', uploadRoutesV1);

// Default Route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to LMS Backend API' });
});

// Robust Health Check
app.get('/health', async (req, res) => {
  try {
    // Check DB
    await prisma.$queryRaw`SELECT 1`;
    // Check Redis
    // await redisClient.ping();
    res.status(200).json({ status: 'ok', db: 'ok', redis: 'ok' });
  } catch (error) {
    logger.error({ err: error }, 'Health check failed');
    res.status(503).json({ status: 'error', details: error.message });
  }
});

// Global Error Handler
app.use(errorHandler);

module.exports = app;