const crypto = require('crypto');
const { prisma } = require('../config/db');
const { generateToken } = require('../utils/jwt.util');
const logger = require('../utils/logger');

const REFRESH_COOKIE = 'lms_refresh';
const REFRESH_DAYS = Math.max(1, Number(process.env.REFRESH_TOKEN_DAYS) || 30);

const hash = (value) => crypto.createHash('sha256').update(value).digest('hex');
const cookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  path: '/api',
  maxAge: REFRESH_DAYS * 24 * 60 * 60 * 1000,
});

const readCookie = (req, name) => {
  const header = req.headers.cookie || '';
  const entry = header.split(';').map((part) => part.trim()).find((part) => part.startsWith(`${name}=`));
  return entry ? decodeURIComponent(entry.slice(name.length + 1)) : null;
};

const issueSession = async (user, req, res) => {
  const id = crypto.randomUUID();
  const refreshToken = `${id}.${crypto.randomBytes(48).toString('base64url')}`;
  const expiresAt = new Date(Date.now() + REFRESH_DAYS * 24 * 60 * 60 * 1000);
  
  try {
    await prisma.session.create({
      data: {
        id,
        userId: user.id,
        tokenHash: hash(refreshToken),
        expiresAt,
        ipAddress: req.ip,
        userAgent: req.get('user-agent')?.slice(0, 500),
      },
    });
    logger.info({ userId: user.id, sessionId: id }, 'Successfully created session in database');
  } catch (error) {
    logger.error({ err: error, userId: user.id }, 'Failed to create user session in database');
    throw error;
  }
  
  res.cookie(REFRESH_COOKIE, refreshToken, cookieOptions());
  return generateToken(user.id, user.role);
};

const rotateSession = async (req, res) => {
  const currentToken = readCookie(req, REFRESH_COOKIE);
  if (!currentToken) {
    logger.debug('No refresh token cookie found in request');
    return null;
  }
  
  const id = currentToken.split('.')[0];
  if (!id) {
    logger.warn('Refresh token cookie present but has invalid format');
    return null;
  }
  
  const session = await prisma.session.findUnique({ where: { id }, include: { user: true } });
  if (!session) {
    logger.warn({ sessionId: id }, 'Rotate session failed: Session not found in database');
    return null;
  }
  
  if (session.revokedAt) {
    logger.warn({ sessionId: id, userId: session.userId }, 'Rotate session failed: Session was already revoked');
    return null;
  }
  
  if (session.expiresAt <= new Date()) {
    logger.warn({ sessionId: id, userId: session.userId }, 'Rotate session failed: Session has expired');
    return null;
  }
  
  if (session.tokenHash !== hash(currentToken)) {
    logger.error({ sessionId: id, userId: session.userId }, 'Rotate session failed: Token hash mismatch (potential token theft/hijacking!)');
    return null;
  }
  
  if (session.user.status !== 'approved') {
    logger.warn({ userId: session.userId, status: session.user.status }, 'Rotate session failed: User account status is not approved');
    return null;
  }

  const nextToken = `${id}.${crypto.randomBytes(48).toString('base64url')}`;
  const expiresAt = new Date(Date.now() + REFRESH_DAYS * 24 * 60 * 60 * 1000);
  
  try {
    await prisma.session.update({
      where: { id },
      data: { tokenHash: hash(nextToken), expiresAt, lastUsedAt: new Date() },
    });
    logger.info({ sessionId: id, userId: session.userId }, 'Successfully rotated session in database');
  } catch (error) {
    logger.error({ err: error, sessionId: id }, 'Failed to update/rotate session in database');
    throw error;
  }
  
  res.cookie(REFRESH_COOKIE, nextToken, cookieOptions());
  return { token: generateToken(session.user.id, session.user.role), user: session.user };
};

const revokeCurrentSession = async (req, res) => {
  const token = readCookie(req, REFRESH_COOKIE);
  const id = token?.split('.')[0];
  if (id) {
    try {
      await prisma.session.updateMany({ where: { id, revokedAt: null }, data: { revokedAt: new Date() } });
      logger.info({ sessionId: id }, 'Successfully revoked session in database');
    } catch (error) {
      logger.error({ err: error, sessionId: id }, 'Failed to revoke session in database');
    }
  }
  res.clearCookie(REFRESH_COOKIE, cookieOptions());
};

module.exports = { issueSession, rotateSession, revokeCurrentSession, REFRESH_COOKIE };
