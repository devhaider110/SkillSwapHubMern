const express = require('express');
const { globalSearch, getTrendingSkills } = require('../controllers/searchController');

const router = express.Router();

router.get('/', globalSearch);
router.get('/trending', getTrendingSkills);

module.exports = router;