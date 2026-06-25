const { prisma } = require('../config/db');
const { audit } = require('../services/audit.service');
const { safePage, calculateAssessmentScore } = require('../utils/platformRules');

const pageArgs = safePage;
const trimText = (value) => String(value ?? '').trim();

const paged = (res, data, total, page, limit) => res.json({
  success: true, count: data.length, data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
});

const requireEnrollment = async (userId, courseId) => prisma.enrollment.findUnique({ where: { userId_courseId: { userId, courseId } } });

exports.getNotifications = async (req, res, next) => {
  try {
    const { page, limit, skip, orderBy } = pageArgs(req.query);
    const where = { userId: req.user.id, ...(req.query.unread === 'true' ? { readAt: null } : {}) };
    const [data, total] = await Promise.all([
      prisma.notification.findMany({ where, skip, take: limit, orderBy }), prisma.notification.count({ where }),
    ]);
    paged(res, data, total, page, limit);
  } catch (error) { next(error); }
};

exports.readNotification = async (req, res, next) => {
  try {
    const result = await prisma.notification.updateMany({ where: { id: req.params.id, userId: req.user.id }, data: { readAt: new Date() } });
    if (!result.count) return res.status(404).json({ success: false, error: 'Notification not found' });
    res.json({ success: true, data: {} });
  } catch (error) { next(error); }
};

exports.readAllNotifications = async (req, res, next) => {
  try {
    await prisma.notification.updateMany({ where: { userId: req.user.id, readAt: null }, data: { readAt: new Date() } });
    res.json({ success: true, data: {} });
  } catch (error) { next(error); }
};

exports.getPreferences = async (req, res, next) => {
  try {
    const data = await prisma.userPreference.upsert({ where: { userId: req.user.id }, update: {}, create: { userId: req.user.id } });
    res.json({ success: true, data });
  } catch (error) { next(error); }
};

exports.updatePreferences = async (req, res, next) => {
  try {
    const allowed = ['language', 'timezone', 'emailNotifications', 'courseNotifications', 'deadlineReminders', 'reducedMotion'];
    const update = Object.fromEntries(Object.entries(req.body).filter(([key]) => allowed.includes(key)));
    const data = await prisma.userPreference.upsert({ where: { userId: req.user.id }, update, create: { userId: req.user.id, ...update } });
    res.json({ success: true, data });
  } catch (error) { next(error); }
};

exports.getBookmarks = async (req, res, next) => {
  try {
    const data = await prisma.bookmark.findMany({ where: { userId: req.user.id }, include: { course: { include: { instructor: { select: { name: true } } } } }, orderBy: { createdAt: 'desc' } });
    res.json({ success: true, data });
  } catch (error) { next(error); }
};

exports.toggleBookmark = async (req, res, next) => {
  try {
    const key = { userId_courseId: { userId: req.user.id, courseId: req.params.courseId } };
    const existing = await prisma.bookmark.findUnique({ where: key });
    if (existing) {
      await prisma.bookmark.delete({ where: key });
      return res.json({ success: true, data: { bookmarked: false } });
    }
    const course = await prisma.course.findFirst({ where: { id: req.params.courseId, status: 'approved' } });
    if (!course) return res.status(404).json({ success: false, error: 'Course not found' });
    await prisma.bookmark.create({ data: { userId: req.user.id, courseId: course.id } });
    res.json({ success: true, data: { bookmarked: true } });
  } catch (error) { next(error); }
};

exports.getReviews = async (req, res, next) => {
  try {
    const data = await prisma.courseReview.findMany({ where: { courseId: req.params.courseId, status: 'published' }, include: { user: { select: { name: true, avatar: true } } }, orderBy: { createdAt: 'desc' } });
    res.json({ success: true, data });
  } catch (error) { next(error); }
};

exports.upsertReview = async (req, res, next) => {
  try {
    const rating = Number(req.body.rating);
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) return res.status(400).json({ success: false, error: 'Rating must be an integer from 1 to 5' });
    if (!await requireEnrollment(req.user.id, req.params.courseId)) return res.status(403).json({ success: false, error: 'Enroll in this course before reviewing it' });
    const data = await prisma.courseReview.upsert({
      where: { userId_courseId: { userId: req.user.id, courseId: req.params.courseId } },
      update: { rating, comment: req.body.comment?.trim() || null },
      create: { userId: req.user.id, courseId: req.params.courseId, rating, comment: req.body.comment?.trim() || null },
    });
    res.json({ success: true, data });
  } catch (error) { next(error); }
};

exports.moderateReview = async (req, res, next) => {
  try {
    if (!['published', 'hidden'].includes(req.body.status)) return res.status(400).json({ success: false, error: 'Status must be published or hidden' });
    const previous = await prisma.courseReview.findUnique({ where: { id: req.params.id } });
    if (!previous) return res.status(404).json({ success: false, error: 'Review not found' });
    const data = await prisma.courseReview.update({ where: { id: previous.id }, data: { status: req.body.status } });
    await audit(req, 'review.moderate', 'CourseReview', data.id, { status: previous.status }, { status: data.status });
    res.json({ success: true, data });
  } catch (error) { next(error); }
};

exports.listAssessments = async (req, res, next) => {
  try {
    const isAdmin = req.user.role === 'admin';
    if (!isAdmin && !await requireEnrollment(req.user.id, req.params.courseId)) return res.status(403).json({ success: false, error: 'Course enrollment required' });
    const rows = await prisma.assessment.findMany({
      where: { courseId: req.params.courseId, ...(isAdmin ? {} : { publishedAt: { lte: new Date() } }) },
      include: { questions: { orderBy: { order: 'asc' }, select: { id: true, type: true, prompt: true, options: true, points: true, order: true } }, _count: { select: { attempts: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: rows });
  } catch (error) { next(error); }
};

exports.createAssessment = async (req, res, next) => {
  try {
    const { title, description, passingScore = 70, attemptLimit = 1, durationMinutes, randomize = false, dueAt, published, questions = [] } = req.body;
    if (!title?.trim() || !Array.isArray(questions) || !questions.length) return res.status(400).json({ success: false, error: 'Title and at least one question are required' });
    const course = await prisma.course.findUnique({ where: { id: req.params.courseId } });
    if (!course) return res.status(404).json({ success: false, error: 'Course not found' });
    const data = await prisma.assessment.create({ data: {
      courseId: course.id, title: title.trim(), description, passingScore: Math.min(100, Math.max(0, Number(passingScore))),
      attemptLimit: Math.max(1, Number(attemptLimit)), durationMinutes: durationMinutes ? Number(durationMinutes) : null,
      randomize: Boolean(randomize), dueAt: dueAt ? new Date(dueAt) : null, publishedAt: published ? new Date() : null,
      questions: { create: questions.map((q, index) => ({ type: q.type, prompt: q.prompt, options: q.options, answer: q.answer, points: Math.max(1, Number(q.points) || 1), order: index + 1 })) },
    }, include: { questions: true } });
    await audit(req, 'assessment.create', 'Assessment', data.id, null, { title: data.title, courseId: data.courseId });
    res.status(201).json({ success: true, data });
  } catch (error) { next(error); }
};

exports.submitAssessment = async (req, res, next) => {
  try {
    const assessment = await prisma.assessment.findFirst({ where: { id: req.params.id, publishedAt: { lte: new Date() } }, include: { questions: true, course: true, attempts: { where: { userId: req.user.id } } } });
    if (!assessment || !await requireEnrollment(req.user.id, assessment.courseId)) return res.status(404).json({ success: false, error: 'Assessment not found' });
    const grants = await prisma.assessmentRetakeGrant.aggregate({
      where: { assessmentId: assessment.id, userId: req.user.id, OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }] },
      _sum: { extraAttempts: true },
    });
    const allowedAttempts = assessment.attemptLimit + (grants._sum.extraAttempts || 0);
    if (assessment.attempts.length >= allowedAttempts) return res.status(409).json({ success: false, error: 'Attempt limit reached' });
    const answers = req.body.answers || {};
    const result = calculateAssessmentScore(assessment.questions, answers, assessment.passingScore);
    const data = await prisma.assessmentAttempt.create({ data: { assessmentId: assessment.id, userId: req.user.id, answers, score: result.score, passed: result.passed, submittedAt: new Date() } });
    res.status(201).json({ success: true, data: { id: data.id, score: data.score, passed: data.passed, requiresManualGrade: result.requiresManualGrade } });
  } catch (error) { next(error); }
};

exports.deleteAssessment = async (req, res, next) => {
  try {
    const existing = await prisma.assessment.findUnique({ where: { id: req.params.id }, include: { _count: { select: { attempts: true } } } });
    if (!existing) return res.status(404).json({ success: false, error: 'Assessment not found' });
    if (existing._count.attempts) return res.status(409).json({ success: false, error: 'Assessments with attempts cannot be deleted' });
    await prisma.assessment.delete({ where: { id: existing.id } });
    await audit(req, 'assessment.delete', 'Assessment', existing.id, { title: existing.title }, null);
    res.json({ success: true, data: {} });
  } catch (error) { next(error); }
};

exports.listAssignments = async (req, res, next) => {
  try {
    const isAdmin = req.user.role === 'admin';
    if (!isAdmin && !await requireEnrollment(req.user.id, req.params.courseId)) return res.status(403).json({ success: false, error: 'Course enrollment required' });
    const data = await prisma.assignment.findMany({ where: { courseId: req.params.courseId, ...(isAdmin ? {} : { publishedAt: { lte: new Date() } }) }, orderBy: { createdAt: 'desc' } });
    res.json({ success: true, data });
  } catch (error) { next(error); }
};

exports.createAssignment = async (req, res, next) => {
  try {
    const { title, description, dueAt, maxPoints = 100, allowResubmit = false, rubric, published } = req.body;
    if (!title?.trim() || !description?.trim()) return res.status(400).json({ success: false, error: 'Title and description are required' });
    const data = await prisma.assignment.create({ data: { courseId: req.params.courseId, title: title.trim(), description: description.trim(), dueAt: dueAt ? new Date(dueAt) : null, maxPoints: Math.max(1, Number(maxPoints)), allowResubmit, rubric, publishedAt: published ? new Date() : null } });
    await audit(req, 'assignment.create', 'Assignment', data.id, null, data);
    res.status(201).json({ success: true, data });
  } catch (error) { next(error); }
};

exports.submitAssignment = async (req, res, next) => {
  try {
    const assignment = await prisma.assignment.findFirst({ where: { id: req.params.id, publishedAt: { lte: new Date() } } });
    if (!assignment || !await requireEnrollment(req.user.id, assignment.courseId)) return res.status(404).json({ success: false, error: 'Assignment not found' });
    const existing = await prisma.assignmentSubmission.findUnique({ where: { assignmentId_userId: { assignmentId: assignment.id, userId: req.user.id } } });
    if (existing?.submittedAt && !assignment.allowResubmit) return res.status(409).json({ success: false, error: 'Resubmission is not allowed' });
    const now = new Date();
    const status = assignment.dueAt && now > assignment.dueAt ? 'late' : 'submitted';
    const data = await prisma.assignmentSubmission.upsert({ where: { assignmentId_userId: { assignmentId: assignment.id, userId: req.user.id } }, update: { text: req.body.text, fileUrl: req.body.fileUrl, status, submittedAt: now, score: null, feedback: null, gradedAt: null }, create: { assignmentId: assignment.id, userId: req.user.id, text: req.body.text, fileUrl: req.body.fileUrl, status, submittedAt: now } });
    res.json({ success: true, data });
  } catch (error) { next(error); }
};

exports.deleteAssignment = async (req, res, next) => {
  try {
    const existing = await prisma.assignment.findUnique({ where: { id: req.params.id }, include: { _count: { select: { submissions: true } } } });
    if (!existing) return res.status(404).json({ success: false, error: 'Assignment not found' });
    if (existing._count.submissions) return res.status(409).json({ success: false, error: 'Assignments with submissions cannot be deleted' });
    await prisma.assignment.delete({ where: { id: existing.id } });
    await audit(req, 'assignment.delete', 'Assignment', existing.id, { title: existing.title }, null);
    res.json({ success: true, data: {} });
  } catch (error) { next(error); }
};

exports.listAssignmentSubmissions = async (req, res, next) => {
  try {
    const assignment = await prisma.assignment.findUnique({ where: { id: req.params.id } });
    if (!assignment) return res.status(404).json({ success: false, error: 'Assignment not found' });
    const data = await prisma.assignmentSubmission.findMany({ where: { assignmentId: assignment.id }, include: { user: { select: { id: true, name: true, email: true } } }, orderBy: { submittedAt: 'desc' } });
    res.json({ success: true, data });
  } catch (error) { next(error); }
};

exports.getMyCourseWork = async (req, res, next) => {
  try {
    if (!await requireEnrollment(req.user.id, req.params.courseId)) return res.status(403).json({ success: false, error: 'Course enrollment required' });
    const now = new Date();
    const [assessments, assignments] = await Promise.all([
      prisma.assessment.findMany({ where: { courseId: req.params.courseId, publishedAt: { lte: now } }, include: { questions: { select: { id: true, type: true, prompt: true, options: true, points: true, order: true }, orderBy: { order: 'asc' } }, attempts: { where: { userId: req.user.id }, select: { id: true, score: true, passed: true, submittedAt: true } } } }),
      prisma.assignment.findMany({ where: { courseId: req.params.courseId, publishedAt: { lte: now } }, include: { submissions: { where: { userId: req.user.id }, select: { id: true, text: true, fileUrl: true, status: true, score: true, feedback: true, submittedAt: true, gradedAt: true } } } }),
    ]);
    res.json({ success: true, data: { assessments, assignments } });
  } catch (error) { next(error); }
};

exports.gradeSubmission = async (req, res, next) => {
  try {
    const submission = await prisma.assignmentSubmission.findUnique({ where: { id: req.params.id }, include: { assignment: true } });
    if (!submission) return res.status(404).json({ success: false, error: 'Submission not found' });
    const score = Number(req.body.score);
    if (!Number.isFinite(score) || score < 0 || score > submission.assignment.maxPoints) return res.status(400).json({ success: false, error: `Score must be between 0 and ${submission.assignment.maxPoints}` });
    const data = await prisma.assignmentSubmission.update({ where: { id: submission.id }, data: { score, feedback: req.body.feedback?.trim() || null, status: 'graded', gradedAt: new Date() } });
    await prisma.notification.create({ data: { userId: submission.userId, type: 'assignment', title: 'Assignment graded', message: `${submission.assignment.title} has been graded.`, actionUrl: `/courses/${submission.assignment.courseId}` } });
    await audit(req, 'submission.grade', 'AssignmentSubmission', data.id, { score: submission.score }, { score });
    res.json({ success: true, data });
  } catch (error) { next(error); }
};

exports.getCertificates = async (req, res, next) => {
  try {
    const data = await prisma.certificate.findMany({ where: { userId: req.user.id }, include: { course: { select: { title: true, thumbnail: true } } }, orderBy: { createdAt: 'desc' } });
    res.json({ success: true, data });
  } catch (error) { next(error); }
};

exports.verifyCertificate = async (req, res, next) => {
  try {
    const data = await prisma.certificate.findFirst({ where: { verificationId: req.params.verificationId, status: 'issued', revokedAt: null }, include: { user: { select: { name: true } }, course: { select: { title: true } } } });
    if (!data) return res.status(404).json({ success: false, error: 'Certificate not found or no longer valid' });
    res.json({ success: true, data: { verificationId: data.verificationId, learner: data.user.name, course: data.course.title, issuedAt: data.issuedAt, expiresAt: data.expiresAt } });
  } catch (error) { next(error); }
};

exports.issueCertificate = async (req, res, next) => {
  try {
    const enrollment = await prisma.enrollment.findUnique({ where: { id: req.params.enrollmentId } });
    if (!enrollment || enrollment.progress !== 100 || enrollment.status !== 'completed') return res.status(409).json({ success: false, error: 'Verified course completion is required' });
    const data = await prisma.certificate.upsert({ where: { userId_courseId: { userId: enrollment.userId, courseId: enrollment.courseId } }, update: { status: 'issued', issuedAt: new Date(), revokedAt: null }, create: { userId: enrollment.userId, courseId: enrollment.courseId, status: 'issued', issuedAt: new Date() } });
    await audit(req, 'certificate.issue', 'Certificate', data.id, null, { userId: data.userId, courseId: data.courseId });
    res.json({ success: true, data });
  } catch (error) { next(error); }
};

exports.revokeCertificate = async (req, res, next) => {
  try {
    const existing = await prisma.certificate.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ success: false, error: 'Certificate not found' });
    const data = await prisma.certificate.update({ where: { id: existing.id }, data: { status: 'revoked', revokedAt: new Date() } });
    await audit(req, 'certificate.revoke', 'Certificate', data.id, { status: existing.status }, { status: 'revoked' });
    res.json({ success: true, data });
  } catch (error) { next(error); }
};

exports.createNotification = async (req, res, next) => {
  try {
    const { userId, role, type = 'system', title, message, actionUrl } = req.body;
    if (!title?.trim() || !message?.trim()) return res.status(400).json({ success: false, error: 'Title and message are required' });
    const allowedTypes = ['system', 'course', 'assignment', 'assessment', 'certificate', 'security'];
    if (!allowedTypes.includes(type)) return res.status(400).json({ success: false, error: 'Invalid notification type' });
    const users = userId ? await prisma.user.findMany({ where: { id: userId, status: 'approved' }, select: { id: true } }) : await prisma.user.findMany({ where: { role: role || 'user', status: 'approved' }, select: { id: true } });
    if (!users.length) return res.status(404).json({ success: false, error: 'No eligible recipients found' });
    await prisma.notification.createMany({ data: users.map((user) => ({ userId: user.id, type, title: title.trim(), message: message.trim(), actionUrl: actionUrl || null })) });
    await audit(req, 'notification.send', 'Notification', null, null, { recipients: users.length, type, title: title.trim() });
    res.status(201).json({ success: true, data: { recipients: users.length } });
  } catch (error) { next(error); }
};

exports.listAnnouncements = async (req, res, next) => {
  try {
    const now = new Date();
    const data = await prisma.announcement.findMany({ where: { publishedAt: { lte: now }, OR: [{ expiresAt: null }, { expiresAt: { gt: now } }] }, orderBy: { publishedAt: 'desc' } });
    res.json({ success: true, data });
  } catch (error) { next(error); }
};

exports.createAnnouncement = async (req, res, next) => {
  try {
    const { title, body, courseId, publishedAt, expiresAt } = req.body;
    if (!title?.trim() || !body?.trim()) return res.status(400).json({ success: false, error: 'Title and body are required' });
    const data = await prisma.announcement.create({ data: { title: title.trim(), body: body.trim(), courseId: courseId || null, publishedAt: publishedAt ? new Date(publishedAt) : new Date(), expiresAt: expiresAt ? new Date(expiresAt) : null } });
    await audit(req, 'announcement.create', 'Announcement', data.id, null, data);
    res.status(201).json({ success: true, data });
  } catch (error) { next(error); }
};

exports.createTicket = async (req, res, next) => {
  try {
    const subject = trimText(req.body.subject);
    const description = trimText(req.body.description);
    if (!subject || !description) return res.status(400).json({ success: false, error: 'Subject and description are required' });
    const data = await prisma.supportTicket.create({ data: { requesterId: req.user.id, subject, description, priority: ['low', 'medium', 'high', 'urgent'].includes(req.body.priority) ? req.body.priority : 'medium' } });
    res.status(201).json({ success: true, data });
  } catch (error) { next(error); }
};

exports.listTickets = async (req, res, next) => {
  try {
    const where = req.user.role === 'admin' ? {} : { requesterId: req.user.id };
    const data = await prisma.supportTicket.findMany({ where, include: { requester: { select: { name: true, email: true } }, assignee: { select: { name: true } }, _count: { select: { messages: true } } }, orderBy: { createdAt: 'desc' } });
    res.json({ success: true, data });
  } catch (error) { next(error); }
};

exports.updateTicket = async (req, res, next) => {
  try {
    const update = {};
    if (['open', 'assigned', 'waiting', 'resolved', 'closed'].includes(req.body.status)) update.status = req.body.status;
    if (req.body.assigneeId !== undefined) update.assigneeId = req.body.assigneeId || null;
    const data = await prisma.supportTicket.update({ where: { id: req.params.id }, data: update });
    await audit(req, 'ticket.update', 'SupportTicket', data.id, null, update);
    res.json({ success: true, data });
  } catch (error) { next(error); }
};

exports.addTicketMessage = async (req, res, next) => {
  try {
    const ticket = await prisma.supportTicket.findUnique({ where: { id: req.params.id } });
    if (!ticket || (req.user.role !== 'admin' && ticket.requesterId !== req.user.id)) return res.status(404).json({ success: false, error: 'Ticket not found' });
    const body = trimText(req.body.body);
    if (!body) return res.status(400).json({ success: false, error: 'Message is required' });
    const data = await prisma.ticketMessage.create({ data: { ticketId: ticket.id, authorId: req.user.id, body } });
    res.status(201).json({ success: true, data });
  } catch (error) { next(error); }
};

exports.getAuditLogs = async (req, res, next) => {
  try {
    const { page, limit, skip, orderBy } = pageArgs(req.query);
    const where = req.query.action ? { action: { contains: req.query.action, mode: 'insensitive' } } : {};
    const [data, total] = await Promise.all([prisma.auditLog.findMany({ where, skip, take: limit, orderBy, include: { actor: { select: { name: true, email: true } } } }), prisma.auditLog.count({ where })]);
    paged(res, data, total, page, limit);
  } catch (error) { next(error); }
};

exports.getAnalytics = async (req, res, next) => {
  try {
    const [
      usersByStatus, coursesByStatus, enrollments, completedEnrollments,
      assessmentAttempts, assignmentSubmissions, certificatesIssued,
      paidRevenue, openTickets, reviewSummary,
    ] = await Promise.all([
      prisma.user.groupBy({ by: ['role', 'status'], _count: { _all: true } }),
      prisma.course.groupBy({ by: ['status'], _count: { _all: true } }),
      prisma.enrollment.count(),
      prisma.enrollment.count({ where: { OR: [{ status: 'completed' }, { progress: { gte: 100 } }] } }),
      prisma.assessmentAttempt.count({ where: { submittedAt: { not: null } } }),
      prisma.assignmentSubmission.count({ where: { submittedAt: { not: null } } }),
      prisma.certificate.count({ where: { status: 'issued', revokedAt: null } }),
      prisma.billingRecord.aggregate({ where: { status: 'paid', currency: 'INR' }, _sum: { amount: true }, _count: { _all: true } }),
      prisma.supportTicket.count({ where: { status: { in: ['open', 'assigned', 'waiting'] } } }),
      prisma.courseReview.aggregate({ where: { status: 'published' }, _avg: { rating: true }, _count: { _all: true } }),
    ]);
    const userCount = (role, status) => usersByStatus
      .filter((row) => row.role === role && (!status || row.status === status))
      .reduce((sum, row) => sum + row._count._all, 0);
    const courseCount = (status) => coursesByStatus
      .filter((row) => !status || row.status === status)
      .reduce((sum, row) => sum + row._count._all, 0);
    const totalLearners = userCount('user');
    const activeLearners = userCount('user', 'approved');
    const totalInstructors = userCount('instructor');
    const activeInstructors = userCount('instructor', 'approved');
    const totalCourses = courseCount();
    const publishedCourses = courseCount('approved');
    const draftCourses = courseCount('draft');
    const pendingCourses = courseCount('pending');
    res.json({
      success: true,
      data: {
        totalLearners,
        activeLearners,
        totalInstructors,
        activeInstructors,
        totalCourses,
        publishedCourses,
        draftCourses,
        pendingCourses,
        enrollments,
        completedEnrollments,
        activeEnrollments: Math.max(0, enrollments - completedEnrollments),
        completionRate: enrollments ? Math.round((completedEnrollments / enrollments) * 100) : 0,
        assessmentAttempts,
        assignmentSubmissions,
        certificatesIssued,
        revenue: paidRevenue._sum.amount || 0,
        revenueCurrency: 'INR',
        paidTransactions: paidRevenue._count._all,
        openTickets,
        publishedReviews: reviewSummary._count._all,
        averageReviewRating: reviewSummary._avg.rating ? Number(reviewSummary._avg.rating.toFixed(2)) : 0,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error) { next(error); }
};

exports.getAdminOperations = async (req, res, next) => {
  try {
    const queries = {
      assessments: () => prisma.assessment.findMany({ include: { course: { select: { title: true } }, _count: { select: { questions: true, attempts: true } } }, orderBy: { createdAt: 'desc' } }),
      assignments: () => prisma.assignment.findMany({ include: { course: { select: { title: true } }, _count: { select: { submissions: true } } }, orderBy: { createdAt: 'desc' } }),
      certificates: async () => {
        const [certificates, enrollments] = await Promise.all([
          prisma.certificate.findMany({ include: { user: { select: { name: true, email: true } }, course: { select: { title: true } } }, orderBy: { createdAt: 'desc' } }),
          prisma.enrollment.findMany({ where: { progress: 100, status: 'completed' }, include: { user: { select: { name: true, email: true } }, course: { select: { title: true } } }, orderBy: { updatedAt: 'desc' } }),
        ]);
        const enrollmentKey = new Map(enrollments.map((item) => [`${item.userId}:${item.courseId}`, item.id]));
        const existingKey = new Set(certificates.map((item) => `${item.userId}:${item.courseId}`));
        return [...certificates.map((item) => ({ ...item, enrollmentId: enrollmentKey.get(`${item.userId}:${item.courseId}`) })), ...enrollments.filter((item) => !existingKey.has(`${item.userId}:${item.courseId}`)).map((item) => ({ id: `eligible-${item.id}`, enrollmentId: item.id, status: 'eligible', user: item.user, course: item.course, createdAt: item.updatedAt }))];
      },
      billing: () => prisma.billingRecord.findMany({ orderBy: { createdAt: 'desc' }, take: 100 }),
      tickets: () => prisma.supportTicket.findMany({ include: { requester: { select: { name: true, email: true } }, assignee: { select: { name: true } }, _count: { select: { messages: true } } }, orderBy: { createdAt: 'desc' } }),
      reviews: () => prisma.courseReview.findMany({ include: { user: { select: { name: true, email: true } }, course: { select: { title: true } } }, orderBy: { createdAt: 'desc' } }),
    };
    const query = queries[req.params.kind];
    if (!query) return res.status(404).json({ success: false, error: 'Operation domain not found' });
    res.json({ success: true, data: await query(), generatedAt: new Date().toISOString() });
  } catch (error) { next(error); }
};

exports.globalSearch = async (req, res, next) => {
  try {
    const query = String(req.query.q || '').trim();
    if (query.length < 2) return res.json({ success: true, data: [] });
    const [users, courses, certificates, payments] = await Promise.all([
      prisma.user.findMany({ where: { OR: [{ name: { contains: query, mode: 'insensitive' } }, { email: { contains: query, mode: 'insensitive' } }] }, select: { id: true, name: true, email: true, role: true }, take: 10 }),
      prisma.course.findMany({ where: { OR: [{ title: { contains: query, mode: 'insensitive' } }, { category: { contains: query, mode: 'insensitive' } }] }, select: { id: true, title: true, category: true }, take: 5 }),
      prisma.certificate.findMany({ where: { OR: [{ user: { name: { contains: query, mode: 'insensitive' } } }, { course: { title: { contains: query, mode: 'insensitive' } } }] }, include: { user: { select: { name: true } }, course: { select: { title: true } } }, take: 5 }),
      prisma.billingRecord.findMany({ where: { providerRef: { contains: query, mode: 'insensitive' } }, take: 5 }),
    ]);
    const data = [
      ...users.map((user) => ({ id: `user-${user.id}`, type: user.role === 'instructor' ? 'teacher' : 'student', category: user.role === 'instructor' ? 'Teachers' : 'Students', title: user.name, subtitle: user.email, path: user.role === 'instructor' ? `/dashboard/admin/teachers/${user.id}` : `/dashboard/admin/students/${user.id}` })),
      ...courses.map((course) => ({ id: `course-${course.id}`, type: 'course', category: 'Courses', title: course.title, subtitle: course.category, path: `/dashboard/admin/courses/${course.id}/edit` })),
      ...certificates.map((certificate) => ({ id: `certificate-${certificate.id}`, type: 'certificate', category: 'Courses', title: certificate.user.name, subtitle: `Certified: ${certificate.course.title}`, path: '/dashboard/admin/certificates' })),
      ...payments.map((payment) => ({ id: `payment-${payment.id}`, type: 'payment', category: 'Payments', title: payment.providerRef || payment.id, subtitle: `${payment.currency} ${payment.amount} · ${payment.status}`, path: '/dashboard/admin/billing' })),
    ];
    res.json({ success: true, data });
  } catch (error) { next(error); }
};

module.exports.pageArgs = pageArgs;
