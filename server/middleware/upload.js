const multer = require('multer');
const path = require('path');

const storage = multer.memoryStorage();

const fileFilter = (allowedTypes) => (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedTypes.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type. Allowed: ${allowedTypes.join(', ')}`), false);
  }
};

// Image uploader (covers, avatars)
const uploadImage = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: fileFilter(['.jpg', '.jpeg', '.png', '.webp']),
});

// E-book uploader
const uploadEbook = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: fileFilter(['.pdf', '.epub', '.mobi']),
});

// Combined (cover + ebook in one form)
const uploadBookFiles = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['.jpg', '.jpeg', '.png', '.webp', '.pdf', '.epub', '.mobi'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) cb(null, true);
    else cb(new Error(`Invalid file type: ${ext}`), false);
  },
}).fields([
  { name: 'coverImage', maxCount: 1 },
  { name: 'ebookFile', maxCount: 1 },
]);

module.exports = { uploadImage, uploadEbook, uploadBookFiles };
