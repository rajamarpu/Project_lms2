const router = require('express').Router();
const { protect, authorize } = require('../../middlewares/auth.middleware');
const cms = require('../../controllers/cms.controller');
const videoJobs = require('../../controllers/videoJobs.controller');

router.get('/cms/:slug', cms.getCmsPage);

router.use(protect);
router.get('/admin/cms', authorize('admin'), cms.listCmsPages);
router.put('/admin/cms/:slug', authorize('admin'), cms.upsertCmsPage);

router.get('/admin/video-jobs', authorize('admin'), videoJobs.listVideoJobs);
router.post('/admin/video-jobs', authorize('admin'), videoJobs.createVideoJob);
router.put('/admin/video-jobs/:id/start', authorize('admin'), videoJobs.startVideoJob);
router.put('/admin/video-jobs/:id/fail', authorize('admin'), videoJobs.failVideoJob);
router.put('/admin/video-jobs/:id/retry', authorize('admin'), videoJobs.retryVideoJob);
router.put('/admin/video-jobs/:id/attach', authorize('admin'), videoJobs.attachVideoJob);

module.exports = router;
