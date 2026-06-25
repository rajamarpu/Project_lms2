const router = require('express').Router();
const controller = require('../../controllers/parity.controller');
const { protect, optionalProtect, authorize } = require('../../middlewares/auth.middleware');

router.get('/personalities', controller.listPersonalities);
router.get('/flashcard-decks', optionalProtect, controller.listFlashcardDecks);
router.get('/flashcard-decks/:id', optionalProtect, controller.getFlashcardDeck);
router.put('/flashcard-decks/:id/progress', optionalProtect, controller.saveFlashcardProgress);

router.use(protect);
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
router.post('/flashcard-decks', authorize('admin'), controller.createFlashcardDeck);
router.put('/flashcard-decks/:id', authorize('admin'), controller.updateFlashcardDeck);
router.delete('/flashcard-decks/:id', authorize('admin'), controller.deleteFlashcardDeck);
router.post('/assessments/:assessmentId/retakes', authorize('admin'), controller.grantAssessmentRetake);

module.exports = router;
