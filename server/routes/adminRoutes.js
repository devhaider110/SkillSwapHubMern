const express = require('express');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const {
  getUsers,
  updateUser,
  deleteUser,
  getTeachSkills,
  deleteTeachSkill,
  getSwapRequests,
  updateSwapRequest,
} = require('../controllers/adminController');

const router = express.Router();

// All routes require authentication and admin role
router.use(protect, adminOnly);

// Users
router.get('/users', getUsers);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

// Skills
router.get('/skills', getTeachSkills);
router.delete('/skills/:id', deleteTeachSkill);

// Swap Requests
router.get('/swaps', getSwapRequests);
router.put('/swaps/:id', updateSwapRequest);

module.exports = router;