const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const {
  createRequest,
  getIncomingRequests,
  getOutgoingRequests,
  updateRequestStatus,
} = require('../controllers/swapController');

const router = express.Router();

router.route('/')
  .post(protect, createRequest);

router.get('/incoming', protect, getIncomingRequests);
router.get('/outgoing', protect, getOutgoingRequests);
router.put('/:id/status', protect, updateRequestStatus);

module.exports = router;