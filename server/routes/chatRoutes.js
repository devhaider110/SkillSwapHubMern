const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const {
  getOrCreateConversation,
  getConversations,
  getMessages,
} = require('../controllers/chatController');

const router = express.Router();

router.get('/conversations', protect, getConversations);
router.get('/conversations/:userId', protect, getOrCreateConversation);
router.get('/messages/:conversationId', protect, getMessages);

module.exports = router;