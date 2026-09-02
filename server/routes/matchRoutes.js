const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { getRecommendations } = require('../controllers/matchController');

const router = express.Router();

router.get('/recommendations', protect, getRecommendations);

module.exports = router;