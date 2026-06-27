const router = require('express').Router();
const controller = require('../../controllers/parity.controller');
const { protect, authorize } = require('../../middlewares/auth.middleware');

router.use(protect);
router.get('/personalities', controller.listPersonalities);
router.get('/live-sessions', controller.listLiveSessions);
router.post('/live-sessions', authorize('instructor', 'admin'), controller.createLiveSession);
router.delete('/live-sessions/:id', authorize('admin'), controller.deleteLiveSession);
router.get('/community/topics', controller.listCommunityTopics);
router.post('/community/topics', controller.createCommunityTopic);
router.get('/community/topics/:topicId/posts', controller.listCommunityPosts);
router.post('/community/topics/:topicId/posts', controller.createCommunityPost);
router.post('/community/posts/:postId/report', controller.reportCommunityPost);
router.get('/admin/community/reports', authorize('admin'), controller.listCommunityReports);
router.put('/admin/community/reports/:id', authorize('admin'), controller.moderateCommunityReport);
router.post('/admin/personalities', authorize('admin'), controller.createPersonality);
router.get('/chat/rooms/:roomId', controller.listChatMessages);
router.post('/chat/messages', controller.sendChatMessage);
router.get('/practice-questions', controller.listPracticeQuestions);
router.post('/practice-questions', authorize('admin'), controller.createPracticeQuestion);
router.post('/practice-questions/:id/validate', controller.validatePracticeAnswer);
router.post('/assessments/:assessmentId/retakes', authorize('admin'), controller.grantAssessmentRetake);

module.exports = router;
