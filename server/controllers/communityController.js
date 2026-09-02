const CommunityPost = require('../models/CommunityPost');
const CommunityComment = require('../models/CommunityComment');
const Notification = require('../models/Notification');

// ============================================================
// POSTS
// ============================================================

// Create a post
exports.createPost = async (req, res) => {
  try {
    const { title, content, tags } = req.body;
    const author = req.user._id;

    const post = await CommunityPost.create({
      title,
      content,
      author,
      tags: tags || [],
    });

    res.status(201).json({ success: true, post });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all posts (with pagination, search, tag filter)
exports.getPosts = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', tag = '' } = req.query;
    const skip = (page - 1) * limit;

    let filter = {};
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
      ];
    }
    if (tag) {
      filter.tags = { $in: [tag] };
    }

    const posts = await CommunityPost.find(filter)
      .populate('author', 'name username profilePic')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await CommunityPost.countDocuments(filter);

    res.status(200).json({
      success: true,
      posts,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get a single post with comments
exports.getPost = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await CommunityPost.findById(id)
      .populate('author', 'name username profilePic');

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    const comments = await CommunityComment.find({ post: id })
      .populate('author', 'name username profilePic')
      .sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      post,
      comments,
    });
  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update post (only author)
exports.updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, tags } = req.body;
    const userId = req.user._id;

    const post = await CommunityPost.findById(id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    if (post.author.toString() !== userId.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    post.title = title || post.title;
    post.content = content || post.content;
    post.tags = tags || post.tags;
    await post.save();

    res.status(200).json({ success: true, post });
  } catch (error) {
    console.error('Update post error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete post (author or admin)
exports.deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const post = await CommunityPost.findById(id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    if (post.author.toString() !== userId.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Delete all comments
    await CommunityComment.deleteMany({ post: id });
    await post.deleteOne();

    res.status(200).json({ success: true, message: 'Post deleted' });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Toggle like on post
exports.toggleLikePost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const post = await CommunityPost.findById(id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    const index = post.likes.indexOf(userId);
    if (index === -1) {
      post.likes.push(userId);
    } else {
      post.likes.splice(index, 1);
    }
    await post.save();

    res.status(200).json({ success: true, likes: post.likes.length });
  } catch (error) {
    console.error('Toggle like error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================================
// COMMENTS
// ============================================================

// Add comment
exports.addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.user._id;

    const post = await CommunityPost.findById(id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    const comment = await CommunityComment.create({
      post: id,
      author: userId,
      content,
    });

    post.commentCount += 1;
    await post.save();

    const populatedComment = await CommunityComment.findById(comment._id)
      .populate('author', 'name username profilePic');

    // Notify post author (if not self)
    if (post.author.toString() !== userId.toString()) {
      await Notification.create({
        userId: post.author,
        senderId: userId,
        type: 'comment',
        title: 'New Comment',
        message: `${req.user.name} commented on your post: "${post.title}"`,
        link: `/community/post/${id}`,
      });
    }

    res.status(201).json({ success: true, comment: populatedComment });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete comment (author or admin)
exports.deleteComment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const comment = await CommunityComment.findById(id);
    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comment not found' });
    }

    const post = await CommunityPost.findById(comment.post);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    if (comment.author.toString() !== userId.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await comment.deleteOne();
    post.commentCount = Math.max(0, post.commentCount - 1);
    await post.save();

    res.status(200).json({ success: true, message: 'Comment deleted' });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Toggle like on comment
exports.toggleLikeComment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const comment = await CommunityComment.findById(id);
    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comment not found' });
    }

    const index = comment.likes.indexOf(userId);
    if (index === -1) {
      comment.likes.push(userId);
    } else {
      comment.likes.splice(index, 1);
    }
    await comment.save();

    res.status(200).json({ success: true, likes: comment.likes.length });
  } catch (error) {
    console.error('Toggle comment like error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};