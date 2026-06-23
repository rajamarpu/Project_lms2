const express = require('express');
const { updateProfile, updatePassword, updateAvatar } = require('../../controllers/profile.controller');
const { protect } = require('../../middlewares/auth.middleware');
const { upload, checkFileSize, handleUploadError } = require('../../middlewares/upload.middleware');

const router = express.Router();

router.use(protect);

router.put('/', updateProfile);
router.put('/password', updatePassword);
router.put('/avatar', upload.single('avatar'), handleUploadError, checkFileSize, updateAvatar);

module.exports = router;
