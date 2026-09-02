const express = require('express');

const { protect, adminOnly } = require('../middleware/authMiddleware');

const {
  getOverview,
  getSkillDistribution,
  getSwapActivity,
  getLearningHours,
} = require('../controllers/analyticsController');

const router = express.Router();

router.get('/overview', protect, adminOnly, getOverview);

router.get('/skills', protect, adminOnly, getSkillDistribution);

router.get('/swaps', protect, adminOnly, getSwapActivity);

router.get('/hours', protect, adminOnly, getLearningHours);

module.exports = router;