const express = require('express');
const router = express.Router();
const multer = require('multer');
const { protect } = require('../middleware/authMiddleware');
const { upload } = require('../config/cloudinary');
const {
  uploadResource,
  getResources,
  getResource,
  updateResource,
  deleteResource,
  downloadResource,
  createFolder,
  getFolders,
  deleteFolder,
} = require('../controllers/resourceController');

// ============================================================
// DEBUG: Log every incoming request to this router
// ============================================================
router.use((req, res, next) => {
  console.log('🔹 Router hit:', req.method, req.path);
  console.log('🔸 Headers content-type:', req.headers['content-type']);
  console.log('🔸 Body:', req.body);
  next();
});

// ============================================================
// UPLOAD ROUTE WITH MULTER ERROR HANDLING & LOGGING
// ============================================================
router.post(
  '/upload',
  protect,
  (req, res, next) => {
    console.log('🔸 Multer middleware about to run');
    upload.single('file')(req, res, (err) => {
      if (err) {
        console.error('❌ Multer error:', err);
        return res.status(400).json({ success: false, message: err.message });
      }
      console.log('🔸 After multer, req.file:', req.file);
      console.log('🔸 After multer, req.body:', req.body);
      next();
    });
  },
  uploadResource
);

// ============================================================
// OTHER ROUTES
// ============================================================
router.get('/', protect, getResources);
router.get('/folders', protect, getFolders);
router.post('/folders', protect, createFolder);
router.delete('/folders/:id', protect, deleteFolder);
router.post('/:id/download', protect, downloadResource);
router.get('/:id', protect, getResource);
router.put('/:id', protect, updateResource);
router.delete('/:id', protect, deleteResource);

module.exports = router;