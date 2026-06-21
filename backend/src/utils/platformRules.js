const safePage = (query, allowedSort = ['createdAt']) => {
  const page = Math.max(1, Number.parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, Number.parseInt(query.limit, 10) || 20));
  const sortBy = allowedSort.includes(query.sortBy) ? query.sortBy : allowedSort[0];
  return { page, limit, skip: (page - 1) * limit, orderBy: { [sortBy]: query.sortOrder === 'asc' ? 'asc' : 'desc' } };
};

const calculateAssessmentScore = (questions, answers, passingScore) => {
  let earned = 0; let possible = 0; let requiresManualGrade = false;
  for (const question of questions) {
    possible += question.points;
    if (['short_answer', 'long_answer', 'file'].includes(question.type)) { requiresManualGrade = true; continue; }
    if (JSON.stringify(answers[question.id]) === JSON.stringify(question.answer)) earned += question.points;
  }
  const score = requiresManualGrade ? null : Math.round((earned / Math.max(1, possible)) * 100);
  return { score, passed: score === null ? null : score >= passingScore, requiresManualGrade };
};

const isStrongPassword = (password) => typeof password === 'string' && password.length >= 8 && password.length <= 128 && /[a-z]/.test(password) && /[A-Z]/.test(password) && /\d/.test(password);

module.exports = { safePage, calculateAssessmentScore, isStrongPassword };
