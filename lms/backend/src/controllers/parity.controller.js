const { GoogleGenAI } = require('@google/genai');
const { prisma } = require('../config/db');
const { audit } = require('../services/audit.service');

const text = (value, max = 5000) => String(value || '').trim().slice(0, max);

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

const deckInclude = { cards: { orderBy: { order: 'asc' } }, _count: { select: { cards: true } } };

exports.listFlashcardDecks = async (req, res, next) => {
  try {
    const isAdmin = req.user?.role === 'admin';
    const where = isAdmin ? {} : { publishedAt: { not: null } };
    const include = { _count: { select: { cards: true } } };
    if (req.user?.id) include.progress = { where: { userId: req.user.id }, take: 1 };
    const data = await prisma.flashcardDeck.findMany({ where, include, orderBy: { updatedAt: 'desc' } });
    res.json({ success: true, data });
  } catch (error) { next(error); }
};

exports.getFlashcardDeck = async (req, res, next) => {
  try {
    const isAdmin = req.user?.role === 'admin';
    const data = await prisma.flashcardDeck.findFirst({ where: { id: req.params.id, ...(isAdmin ? {} : { publishedAt: { not: null } }) }, include: deckInclude });
    if (!data) return res.status(404).json({ success: false, error: 'Flashcard deck not found' });
    res.json({ success: true, data });
  } catch (error) { next(error); }
};

exports.createFlashcardDeck = async (req, res, next) => {
  try {
    const title = text(req.body.title, 160); const subject = text(req.body.subject, 100); const category = text(req.body.category, 100);
    const cards = Array.isArray(req.body.cards) ? req.body.cards.filter((card) => text(card.question) && text(card.answer)) : [];
    if (!title || !subject || !category || !cards.length) return res.status(400).json({ success: false, error: 'Title, subject, category, and at least one card are required' });
    const data = await prisma.flashcardDeck.create({ data: { title, subject, category, description: text(req.body.description, 1000), topic: text(req.body.topic, 100) || null, difficulty: text(req.body.difficulty, 40) || 'beginner', courseId: req.body.courseId || null, authorId: req.user.id, publishedAt: req.body.published ? new Date() : null, cards: { create: cards.map((card, order) => ({ question: text(card.question, 2000), answer: text(card.answer, 4000), order })) } }, include: deckInclude });
    await audit(req, 'flashcard-deck.create', 'FlashcardDeck', data.id, null, { title, cards: cards.length });
    res.status(201).json({ success: true, data });
  } catch (error) { next(error); }
};

exports.updateFlashcardDeck = async (req, res, next) => {
  try {
    const previous = await prisma.flashcardDeck.findUnique({ where: { id: req.params.id } });
    if (!previous) return res.status(404).json({ success: false, error: 'Flashcard deck not found' });
    const cards = Array.isArray(req.body.cards) ? req.body.cards.filter((card) => text(card.question) && text(card.answer)) : null;
    const data = await prisma.$transaction(async (tx) => {
      if (cards) { await tx.flashcard.deleteMany({ where: { deckId: previous.id } }); }
      return tx.flashcardDeck.update({ where: { id: previous.id }, data: { ...(req.body.title !== undefined ? { title: text(req.body.title, 160) } : {}), ...(req.body.description !== undefined ? { description: text(req.body.description, 1000) } : {}), ...(req.body.subject !== undefined ? { subject: text(req.body.subject, 100) } : {}), ...(req.body.category !== undefined ? { category: text(req.body.category, 100) } : {}), ...(req.body.topic !== undefined ? { topic: text(req.body.topic, 100) || null } : {}), ...(req.body.difficulty !== undefined ? { difficulty: text(req.body.difficulty, 40) } : {}), ...(req.body.published !== undefined ? { publishedAt: req.body.published ? (previous.publishedAt || new Date()) : null } : {}), ...(cards ? { cards: { create: cards.map((card, order) => ({ question: text(card.question, 2000), answer: text(card.answer, 4000), order })) } } : {}) }, include: deckInclude });
    });
    await audit(req, 'flashcard-deck.update', 'FlashcardDeck', data.id, previous, { title: data.title, publishedAt: data.publishedAt });
    res.json({ success: true, data });
  } catch (error) { next(error); }
};

exports.deleteFlashcardDeck = async (req, res, next) => {
  try {
    const previous = await prisma.flashcardDeck.findUnique({ where: { id: req.params.id } });
    if (!previous) return res.status(404).json({ success: false, error: 'Flashcard deck not found' });
    await prisma.flashcardDeck.delete({ where: { id: previous.id } });
    await audit(req, 'flashcard-deck.delete', 'FlashcardDeck', previous.id, previous, null);
    res.json({ success: true, data: {} });
  } catch (error) { next(error); }
};

exports.saveFlashcardProgress = async (req, res, next) => {
  try {
    if (!req.user?.id) {
      return res.status(200).json({ success: true, data: null, message: 'Sign in to save flashcard progress.' });
    }
    const deck = await prisma.flashcardDeck.findFirst({ where: { id: req.params.id, publishedAt: { not: null } }, include: { _count: { select: { cards: true } } } });
    if (!deck) return res.status(404).json({ success: false, error: 'Flashcard deck not found' });
    const currentCard = Math.max(0, Math.min(deck._count.cards - 1, Number(req.body.currentCard) || 0));
    const viewedCards = Math.max(0, Math.min(deck._count.cards, Number(req.body.viewedCards) || 0));
    const data = await prisma.flashcardProgress.upsert({ where: { userId_deckId: { userId: req.user.id, deckId: deck.id } }, update: { currentCard, viewedCards, completedAt: viewedCards >= deck._count.cards ? new Date() : null }, create: { userId: req.user.id, deckId: deck.id, currentCard, viewedCards, completedAt: viewedCards >= deck._count.cards ? new Date() : null } });
    res.json({ success: true, data });
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
