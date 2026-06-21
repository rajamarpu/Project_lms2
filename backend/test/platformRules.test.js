const test = require('node:test');
const assert = require('node:assert/strict');
const { safePage, calculateAssessmentScore, isStrongPassword } = require('../src/utils/platformRules');

test('pagination clamps unsafe values and rejects unlisted sort fields', () => {
  assert.deepEqual(safePage({ page: '-5', limit: '9999', sortBy: 'password', sortOrder: 'asc' }), {
    page: 1, limit: 100, skip: 0, orderBy: { createdAt: 'asc' },
  });
});

test('pagination calculates a stable offset', () => {
  assert.equal(safePage({ page: '3', limit: '25' }).skip, 50);
});

test('assessment scoring handles exact scalar and array answers', () => {
  const questions = [
    { id: 'one', type: 'true_false', answer: true, points: 2 },
    { id: 'two', type: 'multiple_answer', answer: ['a', 'b'], points: 3 },
  ];
  assert.deepEqual(calculateAssessmentScore(questions, { one: true, two: ['a', 'b'] }, 70), { score: 100, passed: true, requiresManualGrade: false });
  assert.deepEqual(calculateAssessmentScore(questions, { one: false, two: ['a'] }, 70), { score: 0, passed: false, requiresManualGrade: false });
});

test('manual questions never expose a misleading automatic score', () => {
  const result = calculateAssessmentScore([{ id: 'essay', type: 'long_answer', answer: null, points: 10 }], { essay: 'response' }, 70);
  assert.deepEqual(result, { score: null, passed: null, requiresManualGrade: true });
});

test('password policy requires mixed case, a number, and safe length', () => {
  assert.equal(isStrongPassword('StrongPass1'), true);
  assert.equal(isStrongPassword('weakpass1'), false);
  assert.equal(isStrongPassword('NoNumberHere'), false);
  assert.equal(isStrongPassword('Sh0rt'), false);
});
