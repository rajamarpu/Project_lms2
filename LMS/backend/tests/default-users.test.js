const test = require('node:test');
const assert = require('node:assert/strict');

const { ensureDefaultUsers } = require('../src/utils/defaultUsers');

test('ensureDefaultUsers creates the configured admin account when env vars are present', async () => {
  process.env.DEFAULT_ADMIN_EMAIL = 'admin@example.com';
  process.env.DEFAULT_ADMIN_PASSWORD = 'AdminPass123';

  const prisma = {
    user: {
      upsert: async ({ where, update, create }) => {
        const existing = where?.email === 'admin@example.com'
          ? { email: where.email, role: 'admin', status: 'approved' }
          : null;

        if (existing) {
          return { ...existing, ...create };
        }

        return { ...create };
      }
    }
  };

  const result = await ensureDefaultUsers(prisma);

  assert.deepEqual(result.map((user) => user.email), ['admin@example.com']);
  assert.equal(result[0].role, 'admin');
});
