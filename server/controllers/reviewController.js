const Review = require('../models/Review');
const SwapRequest = require('../models/SwapRequest');
const User = require('../models/User');          // ✅ Ensure this import exists
const Notification = require('../models/Notification');

// Create a new review
exports.createReview = async (req, res) => {
  try {
    const { swapRequestId, skillRating, communicationRating, knowledgeRating, comment } = req.body;
    const reviewerId = req.user._id;

    const swap = await SwapRequest.findById(swapRequestId);
    if (!swap) {
      return res.status(404).json({ success: false, message: 'Swap request not found' });
    }
    if (swap.status !== 'completed') {
      return res.status(400).json({ success: false, message: 'You can only review completed swaps' });
    }

    const isRequester = swap.requesterId.toString() === reviewerId.toString();
    const isReceiver = swap.receiverId.toString() === reviewerId.toString();
    if (!isRequester && !isReceiver) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const revieweeId = isRequester ? swap.receiverId : swap.requesterId;

    const existing = await Review.findOne({ reviewerId, swapRequestId });
    if (existing) {
      return res.status(400).json({ success: false, message: 'You have already reviewed this swap' });
    }

    const overallRating = Math.round((skillRating + communicationRating + knowledgeRating) / 3);

    const review = await Review.create({
      reviewerId,
      revieweeId,
      swapRequestId,
      skillRating,
      communicationRating,
      knowledgeRating,
      overallRating,
      comment,
    });

    await Notification.create({
      userId: revieweeId,
      senderId: reviewerId,
      type: 'review',
      title: 'New Review Received',
      message: `${req.user.name} has left you a review!`,
      link: `/profile/${req.user.username}`,
    });

    const allReviews = await Review.find({ revieweeId });
    const total = allReviews.reduce((sum, r) => sum + r.overallRating, 0);
    const avg = total / allReviews.length;
    await User.findByIdAndUpdate(revieweeId, { rating: avg });

    res.status(201).json({ success: true, review });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'You have already reviewed this swap' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get reviews for a specific user
exports.getUserReviews = async (req, res) => {
  try {
    const { userId } = req.params;
    const reviews = await Review.find({ revieweeId: userId })
      .populate('reviewerId', 'name username profilePic')
      .sort({ createdAt: -1 });
    const total = reviews.reduce((sum, r) => sum + r.overallRating, 0);
    const avg = reviews.length > 0 ? (total / reviews.length).toFixed(1) : 0;
    res.status(200).json({ success: true, reviews, averageRating: avg, totalReviews: reviews.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get logged-in user's received reviews
exports.getMyReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ revieweeId: req.user._id })
      .populate('reviewerId', 'name username profilePic')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ NEW: Update an existing review
exports.updateReview = async (req, res) => {
  try {
    const { skillRating, communicationRating, knowledgeRating, comment } = req.body;
    const { id } = req.params;
    const userId = req.user._id;

    const review = await Review.findOne({ _id: id, reviewerId: userId });
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found or you are not the reviewer' });
    }

    const swap = await SwapRequest.findById(review.swapRequestId);
    if (swap.status !== 'completed') {
      return res.status(400).json({ success: false, message: 'Cannot update review for an incomplete swap' });
    }

    const overallRating = Math.round((skillRating + communicationRating + knowledgeRating) / 3);

    review.skillRating = skillRating;
    review.communicationRating = communicationRating;
    review.knowledgeRating = knowledgeRating;
    review.overallRating = overallRating;
    review.comment = comment || review.comment;
    await review.save();

    // Update reviewee's average rating
    const allReviews = await Review.find({ revieweeId: review.revieweeId });
    const total = allReviews.reduce((sum, r) => sum + r.overallRating, 0);
    const avg = total / allReviews.length;
    await User.findByIdAndUpdate(review.revieweeId, { rating: avg });

    res.status(200).json({ success: true, review });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};