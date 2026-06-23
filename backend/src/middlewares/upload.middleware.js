const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'application/pdf', 'video/mp4'];
  const allowedExts = ['.jpg', '.jpeg', '.png', '.pdf', '.mp4'];
  
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowedMimeTypes.includes(file.mimetype) && allowedExts.includes(ext)) {
    cb(null, true);
  } else {
    const error = new Error('Invalid file type! Only .jpg, .jpeg, .png, .pdf, and .mp4 are allowed.');
    error.name = 'UploadError';
    cb(error, false);
  }
};

const checkFileSize = (req, res, next) => {
  if (!req.file) return next();
  
  const isImage = req.file.mimetype.startsWith('image/');
  const maxSize = isImage ? 5 * 1024 * 1024 : 100 * 1024 * 1024;
  
  if (req.file.size > maxSize) {
    if (fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    return res.status(400).json({ success: false, error: `File too large. Max size for ${isImage ? 'images' : 'videos/pdfs'} is ${isImage ? '5MB' : '100MB'}` });
  }
  next();
};

const handleUploadError = (err, req, res, next) => {
  if (err.name === 'MulterError' || err.name === 'UploadError') {
    return res.status(400).json({ success: false, error: err.message });
  }
  next(err);
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB limit
  },
  fileFilter: fileFilter
});

module.exports = { upload, checkFileSize, handleUploadError };
