const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const {
  createQuiz,
  getQuizzes,
  getQuiz,
  submitQuiz,
  getResults,
  getLeaderboard,
} = require('../controllers/quizController');

const router = express.Router();

router.post('/', protect, createQuiz);
router.get('/', protect, getQuizzes);
router.get('/:id', protect, getQuiz);
router.post('/:id/submit', protect, submitQuiz);
router.get('/:id/results/:attemptId', protect, getResults);
router.get('/:id/leaderboard', protect, getLeaderboard);

module.exports = router;