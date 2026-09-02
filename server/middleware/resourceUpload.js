const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ============================================================
// RESOURCE UPLOAD DIRECTORY
// ============================================================

const uploadDirectory = path.join(
  __dirname,
  '..',
  'uploads',
  'resources'
);

// Create directory automatically
if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, {
    recursive: true,
  });
}

// ============================================================
// STORAGE
// ============================================================

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDirectory);
  },

  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname);

    const originalName = path
      .basename(file.originalname, extension)
      .replace(/[^a-zA-Z0-9-_]/g, '_');

    const uniqueName =
      `${Date.now()}-${Math.round(Math.random() * 1e9)}-${originalName}${extension}`;

    cb(null, uniqueName);
  },
});

// ============================================================
// ALLOWED FILE TYPES
// ============================================================

const allowedExtensions = new Set([
  '.pdf',

  '.doc',
  '.docx',

  '.ppt',
  '.pptx',

  '.xls',
  '.xlsx',

  '.txt',

  '.jpg',
  '.jpeg',
  '.png',
  '.gif',
  '.webp',

  '.mp4',
  '.mov',
  '.avi',
  '.mkv',
  '.webm',

  '.zip',
  '.rar',
  '.7z',

  '.csv',
]);

// ============================================================
// FILE FILTER
// ============================================================

const fileFilter = (req, file, cb) => {
  const extension = path
    .extname(file.originalname)
    .toLowerCase();

  if (!allowedExtensions.has(extension)) {
    return cb(
      new Error(
        `File type ${extension} is not supported.`
      ),
      false
    );
  }

  cb(null, true);
};

// ============================================================
// MULTER
// ============================================================

const uploadResourceFile = multer({
  storage,
  fileFilter,

  limits: {
    // 100 MB maximum
    fileSize: 100 * 1024 * 1024,
  },
});

// ============================================================
// EXPORT
// ============================================================

module.exports = {
  uploadResourceFile,
  uploadDirectory,
};