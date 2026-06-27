const express = require('express');
const { uploadFile, listMedia, deleteMedia } = require('../../controllers/upload.controller');
const { protect, authorize } = require('../../middlewares/auth.middleware');
const upload = require('../../middlewares/upload.middleware');

const router = express.Router();

router.post('/', protect, authorize('admin'), upload.single('file'), uploadFile);
router.get('/media', protect, authorize('admin'), listMedia);
router.delete('/media/:fileName', protect, authorize('admin'), deleteMedia);

module.exports = router;
