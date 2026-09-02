const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const {
  getProgressOverview,
  getSkillProgress,
  getWeeklyActivity,
} = require('../controllers/progressController');

const router = express.Router();

router.get('/overview', protect, getProgressOverview);
router.get('/skills', protect, getSkillProgress);
router.get('/weekly-activity', protect, getWeeklyActivity);

module.exports = router;