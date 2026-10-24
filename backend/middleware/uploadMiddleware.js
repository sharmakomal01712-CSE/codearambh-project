const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads folder exists
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30);
    cb(null, `${sanitizedName}-${uniqueSuffix}${ext}`);
  },
});

// File Filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp|pdf|doc|docx/;
  const ext = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mime = allowedTypes.test(file.mimetype);

  if (ext || mime) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (jpeg, jpg, png, webp) and documents (pdf, doc, docx) are allowed!'));
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 }, // 15 MB limit
  fileFilter,
});

module.exports = upload;
