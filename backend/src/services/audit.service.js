const { prisma } = require('../config/db');

const audit = async (req, action, targetType, targetId, previous, next) => {
  try {
    await prisma.auditLog.create({
      data: {
        actorId: req.user?.id,
        actorRole: req.user?.role,
        action,
        targetType,
        targetId,
        previous: previous ?? undefined,
        next: next ?? undefined,
        requestId: req.id,
        ipAddress: req.ip,
        userAgent: req.get('user-agent')?.slice(0, 500),
      },
    });
  } catch (error) {
    req.log?.error({ err: error }, 'Failed to persist audit event');
  }
};

module.exports = { audit };
