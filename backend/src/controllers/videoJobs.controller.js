const fs = require('fs/promises');
const path = require('path');
const { prisma } = require('../config/db');
const { audit } = require('../services/audit.service');

const dataDir = path.join(__dirname, '../../data');
const jobsFile = path.join(dataDir, 'ai-video-jobs.json');

const ensureData = async () => {
  await fs.mkdir(dataDir, { recursive: true });
  try {
    await fs.access(jobsFile);
  } catch {
    await fs.writeFile(jobsFile, JSON.stringify([], null, 2));
  }
};

const readJobs = async () => {
  await ensureData();
  return JSON.parse(await fs.readFile(jobsFile, 'utf8'));
};

const writeJobs = async (jobs) => {
  await ensureData();
  await fs.writeFile(jobsFile, JSON.stringify(jobs, null, 2));
};

const appendLog = (job, message) => {
  job.logs = job.logs || [];
  job.logs.push({ at: new Date().toISOString(), message });
};

const hydrateJob = async (job) => {
  const lesson = job.lessonId ? await prisma.lesson.findUnique({ where: { id: job.lessonId }, include: { course: { select: { id: true, title: true } } } }) : null;
  return { ...job, lesson, courseTitle: lesson?.course?.title || null };
};

exports.listVideoJobs = async (_req, res, next) => {
  try {
    const jobs = await readJobs();
    const data = await Promise.all(jobs.map(hydrateJob));
    res.json({ success: true, data: data.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)) });
  } catch (error) {
    next(error);
  }
};

exports.createVideoJob = async (req, res, next) => {
  try {
    const title = String(req.body.title || '').trim();
    if (!title) return res.status(400).json({ success: false, error: 'Title is required' });
    const jobs = await readJobs();
    const now = new Date().toISOString();
    const job = {
      id: `job-${Date.now()}-${Math.floor(Math.random() * 1e6)}`,
      title,
      courseId: req.body.courseId || null,
      lessonId: req.body.lessonId || null,
      avatarUrl: req.body.avatarUrl || null,
      voiceUrl: req.body.voiceUrl || null,
      subtitleUrl: req.body.subtitleUrl || null,
      pdfUrl: req.body.pdfUrl || null,
      sourceVideoUrl: req.body.sourceVideoUrl || null,
      voiceModel: req.body.voiceModel || 'default',
      avatarModel: req.body.avatarModel || 'default',
      status: 'queued',
      progress: 0,
      outputUrl: null,
      createdAt: now,
      updatedAt: now,
      logs: [],
    };
    appendLog(job, 'Queued for AI video generation');
    jobs.unshift(job);
    await writeJobs(jobs);
    await audit(req, 'ai-video.create', 'AiVideoJob', job.id, null, { title: job.title });
    res.status(201).json({ success: true, data: job });
  } catch (error) {
    next(error);
  }
};

exports.startVideoJob = async (req, res, next) => {
  try {
    const jobs = await readJobs();
    const job = jobs.find((item) => item.id === req.params.id);
    if (!job) return res.status(404).json({ success: false, error: 'Job not found' });
    job.status = 'processing';
    job.progress = 40;
    job.updatedAt = new Date().toISOString();
    appendLog(job, 'Processing started');
    job.outputUrl = job.sourceVideoUrl || job.outputUrl || '/uploads/demo-ai-video.mp4';
    job.progress = 100;
    job.status = 'completed';
    appendLog(job, 'Processing completed');
    await writeJobs(jobs);
    res.json({ success: true, data: job });
  } catch (error) {
    next(error);
  }
};

exports.failVideoJob = async (req, res, next) => {
  try {
    const jobs = await readJobs();
    const job = jobs.find((item) => item.id === req.params.id);
    if (!job) return res.status(404).json({ success: false, error: 'Job not found' });
    job.status = 'failed';
    job.updatedAt = new Date().toISOString();
    appendLog(job, req.body.reason ? `Failed: ${req.body.reason}` : 'Processing failed');
    await writeJobs(jobs);
    res.json({ success: true, data: job });
  } catch (error) {
    next(error);
  }
};

exports.retryVideoJob = async (req, res, next) => {
  try {
    const jobs = await readJobs();
    const job = jobs.find((item) => item.id === req.params.id);
    if (!job) return res.status(404).json({ success: false, error: 'Job not found' });
    job.status = 'queued';
    job.progress = 0;
    job.updatedAt = new Date().toISOString();
    appendLog(job, 'Retry queued');
    await writeJobs(jobs);
    res.json({ success: true, data: job });
  } catch (error) {
    next(error);
  }
};

exports.attachVideoJob = async (req, res, next) => {
  try {
    const jobs = await readJobs();
    const job = jobs.find((item) => item.id === req.params.id);
    if (!job) return res.status(404).json({ success: false, error: 'Job not found' });
    const lessonId = req.body.lessonId || job.lessonId;
    if (!lessonId) return res.status(400).json({ success: false, error: 'Lesson ID is required' });
    const lesson = await prisma.lesson.findUnique({ where: { id: lessonId } });
    if (!lesson) return res.status(404).json({ success: false, error: 'Lesson not found' });
    const videoUrl = job.outputUrl || job.sourceVideoUrl || null;
    if (!videoUrl) return res.status(409).json({ success: false, error: 'Video is not ready yet' });
    const updatedLesson = await prisma.lesson.update({
      where: { id: lesson.id },
      data: {
        videoUrl,
        resources: {
          ...(lesson.resources && typeof lesson.resources === 'object' && !Array.isArray(lesson.resources) ? lesson.resources : {}),
          aiVideoJobId: job.id,
        },
      },
    });
    job.lessonId = lesson.id;
    job.courseId = lesson.courseId;
    job.updatedAt = new Date().toISOString();
    appendLog(job, `Attached to lesson ${lesson.id}`);
    await writeJobs(jobs);
    await audit(req, 'ai-video.attach', 'Lesson', lesson.id, lesson, updatedLesson);
    res.json({ success: true, data: { job, lesson: updatedLesson } });
  } catch (error) {
    next(error);
  }
};
