const fs = require('fs/promises');

const matchesSignature = async (file) => {
  const handle = await fs.open(file.path, 'r');
  try {
    const buffer = Buffer.alloc(16);
    await handle.read(buffer, 0, buffer.length, 0);
    const hex = buffer.toString('hex');
    const ascii = buffer.toString('ascii');
    const rules = {
      'image/jpeg': () => hex.startsWith('ffd8ff'),
      'image/png': () => hex.startsWith('89504e470d0a1a0a'),
      'image/gif': () => ascii.startsWith('GIF87a') || ascii.startsWith('GIF89a'),
      'image/webp': () => ascii.startsWith('RIFF') && ascii.slice(8, 12) === 'WEBP',
      'application/pdf': () => ascii.startsWith('%PDF-'),
      'video/mp4': () => ascii.slice(4, 8) === 'ftyp',
      'video/webm': () => hex.startsWith('1a45dfa3'),
    };
    return Boolean(rules[file.mimetype]?.());
  } finally {
    await handle.close();
  }
};

// @desc    Upload file and get URL
// @route   POST /api/upload
// @access  Private
exports.uploadFile = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'Please upload a file' });
    }

    if (!await matchesSignature(req.file)) {
      await fs.unlink(req.file.path).catch(() => {});
      return res.status(400).json({ success: false, error: 'File content does not match the declared file type' });
    }

    const fileUrl = `/uploads/${req.file.filename}`;

    res.status(200).json({
      success: true,
      message: 'File uploaded successfully',
      url: fileUrl,
      mimetype: req.file.mimetype,
      size: req.file.size
    });
  } catch (error) {
    next(error);
  }
};
