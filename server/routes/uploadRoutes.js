const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { upload } = require('../config/cloudinary');
const User = require('../models/User');

const router = express.Router();

// Upload profile picture
router.post('/profile-pic', protect, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image uploaded' });
    }
    const imageUrl = req.file.path; // Cloudinary URL
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { profilePic: imageUrl },
      { new: true }
    );
    res.status(200).json({ success: true, profilePic: user.profilePic });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Upload cover image
router.post('/cover-image', protect, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image uploaded' });
    }
    const imageUrl = req.file.path;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { coverImage: imageUrl },
      { new: true }
    );
    res.status(200).json({ success: true, coverImage: user.coverImage });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Upload chat media
router.post(
  '/chat-media',
  protect,
  upload.single('file'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded',
        });
      }

      res.status(200).json({
        success: true,
        fileUrl: req.file.path,
        fileName: req.file.originalname,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
      });
    } catch (error) {
      console.error('Chat media upload error:', error);

      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
);

module.exports = router;