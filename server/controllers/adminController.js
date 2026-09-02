const User = require('../models/User');
const TeachSkill = require('../models/TeachSkill');
const LearnSkill = require('../models/LearnSkill');
const SwapRequest = require('../models/SwapRequest');
const LearningSession = require('../models/LearningSession');
const Review = require('../models/Review');
const Notification = require('../models/Notification');

// -------- USERS --------
// Get all users (with pagination & search)
exports.getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    if (search) {
      query = {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { username: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
        ],
      };
    }

    const [users, total] = await Promise.all([
      User.find(query)
        .select('-password -refreshToken -__v')
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ createdAt: -1 }),
      User.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      users,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update user (ban/unban, change role)
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { isBlocked, role } = req.body;

    const user = await User.findByIdAndUpdate(
      id,
      { isBlocked, role },
      { new: true, runValidators: true }
    ).select('-password -refreshToken -__v');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete user (and all associated data)
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    // Delete user, their skills, swap requests, etc. (cascade)
    await Promise.all([
      User.findByIdAndDelete(id),
      TeachSkill.deleteMany({ userId: id }),
      LearnSkill.deleteMany({ userId: id }),
      SwapRequest.deleteMany({ $or: [{ requesterId: id }, { receiverId: id }] }),
      LearningSession.deleteMany({ $or: [{ teacher: id }, { learner: id }] }),
      Review.deleteMany({ $or: [{ reviewerId: id }, { revieweeId: id }] }),
      Notification.deleteMany({ userId: id }),
    ]);

    res.status(200).json({ success: true, message: 'User and all associated data deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// -------- SKILLS --------
// Get all teach skills (with pagination & search)
exports.getTeachSkills = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    if (search) {
      query = {
        $or: [
          { skillName: { $regex: search, $options: 'i' } },
          { category: { $regex: search, $options: 'i' } },
        ],
      };
    }

    const [skills, total] = await Promise.all([
      TeachSkill.find(query)
        .populate('userId', 'name username email')
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ createdAt: -1 }),
      TeachSkill.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      skills,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete teach skill
exports.deleteTeachSkill = async (req, res) => {
  try {
    const { id } = req.params;
    await TeachSkill.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: 'Skill deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// -------- SWAP REQUESTS --------
// Get all swap requests (admin view)
exports.getSwapRequests = async (req, res) => {
  try {
    const { page = 1, limit = 10, status = '' } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    if (status) query.status = status;

    const [swaps, total] = await Promise.all([
      SwapRequest.find(query)
        .populate('requesterId', 'name username email')
        .populate('receiverId', 'name username email')
        .populate('teachSkillId', 'skillName')
        .populate('learnSkillId', 'skillName')
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ createdAt: -1 }),
      SwapRequest.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      swaps,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update swap request (admin override)
exports.updateSwapRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const swap = await SwapRequest.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );
    if (!swap) {
      return res.status(404).json({ success: false, message: 'Swap request not found' });
    }
    res.status(200).json({ success: true, swap });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// -------- PLATFORM STATS (Overview) --------
// We already have getOverview in analyticsController, reuse it.