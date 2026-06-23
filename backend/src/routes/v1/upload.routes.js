const express = require('express');
const { uploadFile } = require('../../controllers/upload.controller');
const { protect } = require('../../middlewares/auth.middleware');
const { upload, checkFileSize, handleUploadError } = require('../../middlewares/upload.middleware');

const router = express.Router();

router.post('/', protect, upload.single('file'), handleUploadError, checkFileSize, uploadFile);

module.exports = router;
