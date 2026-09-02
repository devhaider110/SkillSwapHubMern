const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const {
  createSession,
  getMySessions,
  getSession,
  updateSessionStatus,
  getMeetingDetails,
} = require('../controllers/learningSessionController');

const router = express.Router();

router.route('/')
  .post(protect, createSession)
  .get(protect, getMySessions);

router.get('/:id', protect, getSession);
router.put('/:id/status', protect, updateSessionStatus);
router.get('/:id/meeting', protect, getMeetingDetails);

module.exports = router;