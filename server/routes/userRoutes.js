const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const {
  getMe,
  updateProfile,
  getPublicProfile,
  updateSettings,
  changePassword,
  deleteAccount,
} = require('../controllers/userController');

const router = express.Router();

// Public route - get user profile by username
router.get('/profile/:username', getPublicProfile);

// Protected routes (require authentication)
router.get('/me', protect, getMe);
router.put('/me', protect, updateProfile);
router.put('/settings', protect, updateSettings);
router.put('/change-password', protect, changePassword);
router.delete('/account', protect, deleteAccount);

module.exports = router;