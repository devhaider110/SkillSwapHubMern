const User = require('../models/User');
const TeachSkill = require('../models/TeachSkill');
const LearnSkill = require('../models/LearnSkill');
const SwapRequest = require('../models/SwapRequest');
const LearningSession = require('../models/LearningSession');
const Review = require('../models/Review');

// Get overview stats
exports.getOverview = async (req, res) => {
  try {
    const [totalUsers, totalTeachSkills, totalLearnSkills, totalSwaps, completedSwaps, totalSessions, totalReviews] = await Promise.all([
      User.countDocuments(),
      TeachSkill.countDocuments({ isActive: true }),
      LearnSkill.countDocuments({ isActive: true }),
      SwapRequest.countDocuments(),
      SwapRequest.countDocuments({ status: 'completed' }),
      LearningSession.countDocuments(),
      Review.countDocuments(),
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalTeachSkills,
        totalLearnSkills,
        totalSwaps,
        completedSwaps,
        totalSessions,
        totalReviews,
        completionRate: totalSwaps > 0 ? Math.round((completedSwaps / totalSwaps) * 100) : 0,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get skill distribution (top skills)
exports.getSkillDistribution = async (req, res) => {
  try {
    const skills = await TeachSkill.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$skillName', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);
    res.status(200).json({ success: true, skills });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get swap activity over time (daily/weekly/monthly)
exports.getSwapActivity = async (req, res) => {
  try {
    const { period = 'week' } = req.query; // 'day', 'week', 'month'
    let groupBy = {};
    if (period === 'day') {
      groupBy = { day: { $dayOfMonth: '$createdAt' }, month: { $month: '$createdAt' }, year: { $year: '$createdAt' } };
    } else if (period === 'week') {
      groupBy = { week: { $week: '$createdAt' }, year: { $year: '$createdAt' } };
    } else {
      groupBy = { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } };
    }

    const data = await SwapRequest.aggregate([
      {
        $group: {
          _id: groupBy,
          total: { $sum: 1 },
          completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.week': 1, '_id.day': 1 } },
    ]);

    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get learning hours (taught/learned)
exports.getLearningHours = async (req, res) => {
  try {
    const taught = await User.aggregate([
      { $group: { _id: null, total: { $sum: '$hoursTaught' } } },
    ]);
    const learned = await User.aggregate([
      { $group: { _id: null, total: { $sum: '$hoursLearned' } } },
    ]);
    res.status(200).json({
      success: true,
      data: {
        taught: taught[0]?.total || 0,
        learned: learned[0]?.total || 0,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};