const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const {
  addTeachSkill,
  getTeachSkills,
  updateTeachSkill,
  deleteTeachSkill,
  addLearnSkill,
  getLearnSkills,
  updateLearnSkill,
  deleteLearnSkill,
  getMarketplaceSkills, 
} = require('../controllers/skillController');

const router = express.Router();

// Teach Skills
router.route('/teach')
  .post(protect, addTeachSkill)
  .get(protect, getTeachSkills);

router.route('/teach/:id')
  .put(protect, updateTeachSkill)
  .delete(protect, deleteTeachSkill);

// Learn Skills
router.route('/learn')
  .post(protect, addLearnSkill)
  .get(protect, getLearnSkills);

router.route('/learn/:id')
  .put(protect, updateLearnSkill)
  .delete(protect, deleteLearnSkill);

router.get('/marketplace', getMarketplaceSkills);

module.exports = router;