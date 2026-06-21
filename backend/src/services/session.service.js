const crypto = require('crypto');
const { prisma } = require('../config/db');
const { generateToken } = require('../utils/jwt.util');

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
  res.cookie(REFRESH_COOKIE, refreshToken, cookieOptions());
  return generateToken(user.id, user.role);
};

const rotateSession = async (req, res) => {
  const currentToken = readCookie(req, REFRESH_COOKIE);
  const id = currentToken?.split('.')[0];
  if (!id) return null;
  const session = await prisma.session.findUnique({ where: { id }, include: { user: true } });
  if (!session || session.revokedAt || session.expiresAt <= new Date() || session.tokenHash !== hash(currentToken)) return null;
  if (session.user.status !== 'approved') return null;

  const nextToken = `${id}.${crypto.randomBytes(48).toString('base64url')}`;
  const expiresAt = new Date(Date.now() + REFRESH_DAYS * 24 * 60 * 60 * 1000);
  await prisma.session.update({
    where: { id },
    data: { tokenHash: hash(nextToken), expiresAt, lastUsedAt: new Date() },
  });
  res.cookie(REFRESH_COOKIE, nextToken, cookieOptions());
  return { token: generateToken(session.user.id, session.user.role), user: session.user };
};

const revokeCurrentSession = async (req, res) => {
  const token = readCookie(req, REFRESH_COOKIE);
  const id = token?.split('.')[0];
  if (id) await prisma.session.updateMany({ where: { id, revokedAt: null }, data: { revokedAt: new Date() } });
  res.clearCookie(REFRESH_COOKIE, cookieOptions());
};

module.exports = { issueSession, rotateSession, revokeCurrentSession, REFRESH_COOKIE };
