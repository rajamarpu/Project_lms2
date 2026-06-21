const { GoogleGenAI } = require('@google/genai');
const { prisma } = require('../config/db');
const { audit } = require('../services/audit.service');

const text = (value, max = 5000) => String(value || '').trim().slice(0, max);

exports.listLiveSessions = async (req, res, next) => {
  try {
    const where = req.user.role === 'admin' ? {} : { status: { in: ['scheduled', 'live'] } };
    const data = await prisma.liveSession.findMany({ where, include: { course: { select: { id: true, title: true } }, instructor: { select: { id: true, name: true, avatar: true } } }, orderBy: { startsAt: 'asc' } });
    res.json({ success: true, data });
  } catch (error) { next(error); }
};

exports.createLiveSession = async (req, res, next) => {
  try {
    const title = text(req.body.title, 160);
    const startsAt = new Date(req.body.startsAt);
    if (!title || Number.isNaN(startsAt.getTime())) return res.status(400).json({ success: false, error: 'Title and valid start time are required' });
    const data = await prisma.liveSession.create({ data: { title, description: text(req.body.description), courseId: req.body.courseId || null, instructorId: req.body.instructorId || req.user.id, startsAt, durationMinutes: Math.max(15, Math.min(480, Number(req.body.durationMinutes) || 60)), meetingUrl: req.body.meetingUrl || null, status: 'scheduled' } });
    await audit(req, 'live-session.create', 'LiveSession', data.id, null, data);
    res.status(201).json({ success: true, data });
  } catch (error) { next(error); }
};

exports.deleteLiveSession = async (req, res, next) => {
  try {
    const previous = await prisma.liveSession.findUnique({ where: { id: req.params.id } });
    if (!previous) return res.status(404).json({ success: false, error: 'Live session not found' });
    await prisma.liveSession.delete({ where: { id: previous.id } });
    await audit(req, 'live-session.delete', 'LiveSession', previous.id, previous, null);
    res.json({ success: true, data: {} });
  } catch (error) { next(error); }
};

exports.listCommunityTopics = async (_req, res, next) => {
  try {
    const data = await prisma.communityTopic.findMany({ include: { createdBy: { select: { id: true, name: true, avatar: true } }, _count: { select: { posts: true } } }, orderBy: { updatedAt: 'desc' } });
    res.json({ success: true, data });
  } catch (error) { next(error); }
};

exports.createCommunityTopic = async (req, res, next) => {
  try {
    const title = text(req.body.title, 160);
    if (!title) return res.status(400).json({ success: false, error: 'Topic title is required' });
    const data = await prisma.communityTopic.create({ data: { title, description: text(req.body.description, 1000), createdById: req.user.id }, include: { createdBy: { select: { id: true, name: true, avatar: true } }, _count: { select: { posts: true } } } });
    res.status(201).json({ success: true, data });
  } catch (error) { next(error); }
};

exports.listCommunityPosts = async (req, res, next) => {
  try {
    const topic = await prisma.communityTopic.findUnique({ where: { id: req.params.topicId } });
    if (!topic) return res.status(404).json({ success: false, error: 'Topic not found' });
    const data = await prisma.communityPost.findMany({ where: { topicId: topic.id, ...(req.user.role === 'admin' ? {} : { hidden: false }) }, include: { author: { select: { id: true, name: true, avatar: true, role: true } }, _count: { select: { reports: true } } }, orderBy: { createdAt: 'asc' } });
    res.json({ success: true, data, topic });
  } catch (error) { next(error); }
};

exports.createCommunityPost = async (req, res, next) => {
  try {
    const topic = await prisma.communityTopic.findUnique({ where: { id: req.params.topicId } });
    if (!topic || topic.locked) return res.status(409).json({ success: false, error: 'Topic is unavailable or locked' });
    const body = text(req.body.body, 5000);
    if (!body) return res.status(400).json({ success: false, error: 'Post body is required' });
    const data = await prisma.communityPost.create({ data: { topicId: topic.id, authorId: req.user.id, body }, include: { author: { select: { id: true, name: true, avatar: true, role: true } } } });
    await prisma.communityTopic.update({ where: { id: topic.id }, data: { updatedAt: new Date() } });
    res.status(201).json({ success: true, data });
  } catch (error) { next(error); }
};

exports.reportCommunityPost = async (req, res, next) => {
  try {
    const reason = text(req.body.reason, 500);
    if (!reason) return res.status(400).json({ success: false, error: 'A report reason is required' });
    const data = await prisma.communityReport.upsert({ where: { postId_reporterId: { postId: req.params.postId, reporterId: req.user.id } }, update: { reason, status: 'open', reviewedAt: null }, create: { postId: req.params.postId, reporterId: req.user.id, reason } });
    res.status(201).json({ success: true, data });
  } catch (error) { next(error); }
};

exports.listCommunityReports = async (_req, res, next) => {
  try {
    const data = await prisma.communityReport.findMany({ include: { reporter: { select: { name: true, email: true } }, post: { include: { author: { select: { name: true, email: true } }, topic: { select: { title: true } } } } }, orderBy: { createdAt: 'desc' } });
    res.json({ success: true, data });
  } catch (error) { next(error); }
};

exports.moderateCommunityReport = async (req, res, next) => {
  try {
    const report = await prisma.communityReport.findUnique({ where: { id: req.params.id } });
    if (!report) return res.status(404).json({ success: false, error: 'Report not found' });
    const hide = req.body.action === 'hide';
    await prisma.$transaction([prisma.communityPost.update({ where: { id: report.postId }, data: { hidden: hide } }), prisma.communityReport.update({ where: { id: report.id }, data: { status: hide ? 'actioned' : 'dismissed', reviewedAt: new Date() } })]);
    await audit(req, 'community.moderate', 'CommunityReport', report.id, null, { action: req.body.action });
    res.json({ success: true, data: {} });
  } catch (error) { next(error); }
};

exports.listPersonalities = async (_req, res, next) => {
  try { res.json({ success: true, data: await prisma.aIPersonality.findMany({ where: { active: true }, orderBy: { name: 'asc' } }) }); }
  catch (error) { next(error); }
};

exports.createPersonality = async (req, res, next) => {
  try {
    const name = text(req.body.name, 80); const title = text(req.body.title, 120); const systemPrompt = text(req.body.systemPrompt, 4000);
    if (!name || !title || !systemPrompt) return res.status(400).json({ success: false, error: 'Name, title, and system prompt are required' });
    const data = await prisma.aIPersonality.create({ data: { name, title, systemPrompt, description: text(req.body.description, 1000), avatar: req.body.avatar || null, accent: req.body.accent || '#6366f1' } });
    await audit(req, 'ai-personality.create', 'AIPersonality', data.id, null, { name: data.name });
    res.status(201).json({ success: true, data });
  } catch (error) { next(error); }
};

exports.listChatMessages = async (req, res, next) => {
  try {
    const data = await prisma.chatMessage.findMany({ where: { roomId: req.params.roomId, ...(req.user.role === 'admin' ? {} : { userId: req.user.id }) }, include: { personality: { select: { name: true, avatar: true, accent: true } } }, orderBy: { createdAt: 'asc' }, take: 200 });
    res.json({ success: true, data });
  } catch (error) { next(error); }
};

exports.sendChatMessage = async (req, res, next) => {
  try {
    const content = text(req.body.content, 4000); const roomId = text(req.body.roomId, 120);
    if (!content || !roomId) return res.status(400).json({ success: false, error: 'Room and message are required' });
    const personality = req.body.personalityId ? await prisma.aIPersonality.findFirst({ where: { id: req.body.personalityId, active: true } }) : null;
    const userMessage = await prisma.chatMessage.create({ data: { roomId, userId: req.user.id, courseId: req.body.courseId || null, personalityId: personality?.id || null, role: 'user', content } });
    if (!personality) return res.status(201).json({ success: true, data: { userMessage, assistantMessage: null } });
    if (!process.env.GEMINI_API_KEY) return res.status(503).json({ success: false, error: 'AI chat requires GEMINI_API_KEY', data: { userMessage } });
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: `${personality.systemPrompt}\n\nLearner: ${content}` });
    const assistantMessage = await prisma.chatMessage.create({ data: { roomId, userId: req.user.id, courseId: req.body.courseId || null, personalityId: personality.id, role: 'assistant', content: text(response.text, 8000) } });
    res.status(201).json({ success: true, data: { userMessage, assistantMessage } });
  } catch (error) { next(error); }
};

exports.listPracticeQuestions = async (req, res, next) => {
  try {
    const where = { active: true, ...(req.query.category ? { category: req.query.category } : {}), ...(req.query.difficulty ? { difficulty: req.query.difficulty } : {}) };
    const data = await prisma.practiceQuestion.findMany({ where, select: { id: true, category: true, difficulty: true, type: true, prompt: true, options: true, explanation: true }, orderBy: { createdAt: 'desc' }, take: 100 });
    res.json({ success: true, data });
  } catch (error) { next(error); }
};

exports.createPracticeQuestion = async (req, res, next) => {
  try {
    const prompt = text(req.body.prompt, 2000); const category = text(req.body.category, 100);
    if (!prompt || !category) return res.status(400).json({ success: false, error: 'Prompt and category are required' });
    const data = await prisma.practiceQuestion.create({ data: { authorId: req.user.id, category, prompt, difficulty: req.body.difficulty || 'medium', type: req.body.type || 'multiple_choice', options: req.body.options, answer: req.body.answer, explanation: text(req.body.explanation, 2000) } });
    await audit(req, 'practice-question.create', 'PracticeQuestion', data.id, null, { category });
    res.status(201).json({ success: true, data });
  } catch (error) { next(error); }
};

exports.validatePracticeAnswer = async (req, res, next) => {
  try {
    const question = await prisma.practiceQuestion.findFirst({ where: { id: req.params.id, active: true } });
    if (!question) return res.status(404).json({ success: false, error: 'Question not found' });
    const correct = JSON.stringify(req.body.answer) === JSON.stringify(question.answer);
    res.json({ success: true, data: { correct, explanation: question.explanation } });
  } catch (error) { next(error); }
};

exports.grantAssessmentRetake = async (req, res, next) => {
  try {
    const extraAttempts = Math.max(1, Math.min(10, Number(req.body.extraAttempts) || 1));
    const data = await prisma.assessmentRetakeGrant.create({ data: { assessmentId: req.params.assessmentId, userId: req.body.userId, grantedById: req.user.id, extraAttempts, reason: text(req.body.reason, 500), expiresAt: req.body.expiresAt ? new Date(req.body.expiresAt) : null } });
    await audit(req, 'assessment.retake.grant', 'AssessmentRetakeGrant', data.id, null, data);
    res.status(201).json({ success: true, data });
  } catch (error) { next(error); }
};
