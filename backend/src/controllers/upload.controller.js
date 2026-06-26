const fs = require('fs/promises');
const path = require('path');

const uploadDir = path.join(__dirname, '../../uploads');

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
      'audio/mpeg': () => ascii.startsWith('ID3') || (buffer[0] === 0xff && (buffer[1] & 0xe0) === 0xe0),
      'audio/mp3': () => ascii.startsWith('ID3') || (buffer[0] === 0xff && (buffer[1] & 0xe0) === 0xe0),
      'audio/wav': () => ascii.startsWith('RIFF') && ascii.slice(8, 12) === 'WAVE',
      'audio/ogg': () => ascii.startsWith('OggS'),
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

exports.listMedia = async (req, res, next) => {
  try {
    const entries = await fs.readdir(uploadDir, { withFileTypes: true });
    const files = await Promise.all(entries.filter((entry) => entry.isFile()).map(async (entry) => {
      const fullPath = path.join(uploadDir, entry.name);
      const stats = await fs.stat(fullPath);
      const ext = path.extname(entry.name).toLowerCase();
      const type = ext === '.pdf' ? 'application/pdf' : ext === '.mp4' ? 'video/mp4' : ext === '.webm' ? 'video/webm' : ext === '.gif' ? 'image/gif' : ['.jpg', '.jpeg'].includes(ext) ? 'image/jpeg' : ext === '.png' ? 'image/png' : 'application/octet-stream';
      return {
        name: entry.name,
        url: `/uploads/${entry.name}`,
        size: stats.size,
        type,
        createdAt: stats.birthtime,
        updatedAt: stats.mtime,
      };
    }));
    files.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    res.json({ success: true, data: files });
  } catch (error) {
    next(error);
  }
};

exports.deleteMedia = async (req, res, next) => {
  try {
    const fileName = req.params.fileName;
    if (!fileName || fileName.includes('..') || fileName.includes('/') || fileName.includes('\\')) {
      return res.status(400).json({ success: false, error: 'Invalid file name' });
    }
    const fullPath = path.join(uploadDir, fileName);
    await fs.access(fullPath);
    await fs.unlink(fullPath);
    res.json({ success: true, data: {} });
  } catch (error) {
    if (error.code === 'ENOENT') return res.status(404).json({ success: false, error: 'File not found' });
    next(error);
  }
};
