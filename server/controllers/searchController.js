const User = require('../models/User');
const TeachSkill = require('../models/TeachSkill');

// Global search across Users and Skills
exports.globalSearch = async (req, res) => {
  try {
    const { q, type = 'all', limit = 10 } = req.query;

    if (!q || q.trim().length < 2) {
      return res.status(200).json({
        success: true,
        users: [],
        skills: [],
        message: 'Please enter at least 2 characters',
      });
    }

    const searchRegex = new RegExp(q.trim(), 'i');

    let users = [];
    let skills = [];

    // Search Users
    if (type === 'all' || type === 'users') {
      users = await User.find({
        $or: [
          { name: searchRegex },
          { username: searchRegex },
          { bio: searchRegex },
          { college: searchRegex },
          { company: searchRegex },
        ],
      })
        .select('name username profilePic rating bio college company')
        .limit(parseInt(limit));
    }

    // Search Skills (TeachSkills)
    if (type === 'all' || type === 'skills') {
      skills = await TeachSkill.find({
        isActive: true,
        $or: [
          { skillName: searchRegex },
          { category: searchRegex },
          { description: searchRegex },
          { tags: { $in: [searchRegex] } },
        ],
      })
        .populate('userId', 'name username profilePic rating')
        .limit(parseInt(limit));
    }

    res.status(200).json({
      success: true,
      query: q.trim(),
      users,
      skills,
      total: users.length + skills.length,
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get trending skills (for autocomplete / homepage)
exports.getTrendingSkills = async (req, res) => {
  try {
    const trending = await TeachSkill.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$skillName', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);
    res.status(200).json({
      success: true,
      trending: trending.map((item) => item._id),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};