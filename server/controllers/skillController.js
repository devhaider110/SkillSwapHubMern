const TeachSkill = require('../models/TeachSkill');
const LearnSkill = require('../models/LearnSkill');

// ---------- TEACH SKILLS ----------
exports.addTeachSkill = async (req, res) => {
  try {
    const { skillName, category, level, experience, description, availability, price, tags } = req.body;
    const userId = req.user._id;

    const skill = await TeachSkill.create({
      userId,
      skillName,
      category,
      level,
      experience,
      description,
      availability,
      price,
      tags,
    });

    res.status(201).json({ success: true, skill });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getTeachSkills = async (req, res) => {
  try {
    const skills = await TeachSkill.find({ userId: req.user._id, isActive: true });
    res.status(200).json({ success: true, skills });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateTeachSkill = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await TeachSkill.findOneAndUpdate(
      { _id: id, userId: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ success: false, message: 'Skill not found' });
    res.status(200).json({ success: true, skill: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteTeachSkill = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await TeachSkill.findOneAndDelete({ _id: id, userId: req.user._id });
    if (!deleted) return res.status(404).json({ success: false, message: 'Skill not found' });
    res.status(200).json({ success: true, message: 'Skill deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ---------- LEARN SKILLS ----------
exports.addLearnSkill = async (req, res) => {
  try {
    const { skillName, category, priority, currentLevel, goal, deadline } = req.body;
    const userId = req.user._id;

    const skill = await LearnSkill.create({
      userId,
      skillName,
      category,
      priority,
      currentLevel,
      goal,
      deadline,
    });

    res.status(201).json({ success: true, skill });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getLearnSkills = async (req, res) => {
  try {
    const skills = await LearnSkill.find({ userId: req.user._id, isActive: true });
    res.status(200).json({ success: true, skills });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateLearnSkill = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await LearnSkill.findOneAndUpdate(
      { _id: id, userId: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ success: false, message: 'Skill not found' });
    res.status(200).json({ success: true, skill: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteLearnSkill = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await LearnSkill.findOneAndDelete({ _id: id, userId: req.user._id });
    if (!deleted) return res.status(404).json({ success: false, message: 'Skill not found' });
    res.status(200).json({ success: true, message: 'Skill deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all teach skills with filters (for marketplace)
exports.getMarketplaceSkills = async (req, res) => {
  try {
    const { category, level, search, minPrice, maxPrice, page = 1, limit = 10 } = req.query;

    // Build filter object
    const filter = { isActive: true };

    if (category) filter.category = { $regex: category, $options: 'i' };
    if (level) filter.level = level;
    if (search) {
      filter.$or = [
        { skillName: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
      ];
    }
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    // Pagination
    const skip = (page - 1) * limit;

    // Fetch skills with user data (populate)
    const skills = await TeachSkill.find(filter)
      .populate('userId', 'name username profilePic rating location') // fields from User model
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await TeachSkill.countDocuments(filter);

    res.status(200).json({
      success: true,
      skills,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};