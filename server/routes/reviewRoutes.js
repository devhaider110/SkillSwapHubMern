const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const {
  createReview,
  getUserReviews,
  getMyReviews,
  updateReview,        // ✅ Import updateReview
} = require('../controllers/reviewController');

const router = express.Router();

router.post('/', protect, createReview);
router.get('/me', protect, getMyReviews);
router.get('/user/:userId', getUserReviews);
router.put('/:id', protect, updateReview);   // ✅ New route

module.exports = router;