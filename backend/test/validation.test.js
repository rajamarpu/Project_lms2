const test = require('node:test');
const assert = require('node:assert/strict');
const { validate } = require('../src/middlewares/validate.middleware');
const { loginSchema } = require('../src/validations/auth.validation');

test('invalid request payloads return a useful 400 response with Zod v4', async () => {
  const req = { body: {}, query: {}, params: {} };
  let statusCode;
  let payload;
  let nextCalled = false;
  const res = {
    status(code) {
      statusCode = code;
      return this;
    },
    json(body) {
      payload = body;
      return this;
    },
  };

  await validate(loginSchema)(req, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, false);
  assert.equal(statusCode, 400);
  assert.equal(payload.success, false);
  assert.match(payload.error, /email|password/i);
});
