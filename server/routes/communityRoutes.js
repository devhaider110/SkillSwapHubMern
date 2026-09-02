const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const {
  createPost,
  getPosts,
  getPost,
  updatePost,
  deletePost,
  toggleLikePost,
  addComment,
  deleteComment,
  toggleLikeComment,
} = require('../controllers/communityController');

const router = express.Router();

// Posts
router.route('/posts')
  .post(protect, createPost)
  .get(getPosts);

router.route('/posts/:id')
  .get(getPost)
  .put(protect, updatePost)
  .delete(protect, deletePost);

router.post('/posts/:id/like', protect, toggleLikePost);

// Comments
router.post('/posts/:id/comments', protect, addComment);
router.delete('/comments/:id', protect, deleteComment);
router.post('/comments/:id/like', protect, toggleLikeComment);

module.exports = router;