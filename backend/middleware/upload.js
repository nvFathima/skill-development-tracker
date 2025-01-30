// backend/config/uploadConfig.js
const path = require('path');
const fs = require('fs');
const multer = require('multer');

// Initialize upload directories
const initializeUploadDirectories = () => {
  const uploadDir = path.join(__dirname, '..', 'uploads');
  const profilePhotosDir = path.join(uploadDir, 'profile-photos');

  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
  }
  if (!fs.existsSync(profilePhotosDir)) {
    fs.mkdirSync(profilePhotosDir);
  }
};

// Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '..', 'uploads', 'profile-photos');
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Configure multer upload
const uploadMiddleware = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only image files
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  }
});

// Initialize directories when this module is imported
initializeUploadDirectories();

module.exports = uploadMiddleware;