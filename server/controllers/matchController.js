const User = require('../models/User');
const TeachSkill = require('../models/TeachSkill');
const LearnSkill = require('../models/LearnSkill');

// Get recommendations for current user
exports.getRecommendations = async (req, res) => {
  try {
    const currentUser = req.user;
    const userId = currentUser._id;

    // 1. Fetch current user's skills
    const userTeachSkills = await TeachSkill.find({ userId, isActive: true });
    const userLearnSkills = await LearnSkill.find({ userId, isActive: true });

    if (userTeachSkills.length === 0 || userLearnSkills.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'Add at least one teach and one learn skill to get recommendations.',
        recommendations: []
      });
    }

    // 2. Get all other users who have at least one teach skill that matches user's learn skills
    //    and at least one learn skill that matches user's teach skills.
    // We'll do a two-step query: find potential partners.

    // Get all teach skills of other users that match user's learn skills
    const learnSkillNames = userLearnSkills.map(s => s.skillName.toLowerCase());
    const potentialTeachSkills = await TeachSkill.find({
      userId: { $ne: userId },
      isActive: true,
      skillName: { $in: learnSkillNames }
    }).populate('userId', 'name username profilePic rating location');

    // Get all learn skills of other users that match user's teach skills
    const teachSkillNames = userTeachSkills.map(s => s.skillName.toLowerCase());
    const potentialLearnSkills = await LearnSkill.find({
      userId: { $ne: userId },
      isActive: true,
      skillName: { $in: teachSkillNames }
    }).populate('userId', 'name username profilePic rating location');

    // 3. Combine and score each user
    const userScores = {};

    // Process teach skills from others
    potentialTeachSkills.forEach(skill => {
      const otherUserId = skill.userId._id.toString();
      if (!userScores[otherUserId]) {
        userScores[otherUserId] = {
          user: skill.userId,
          teachMatch: 0,
          learnMatch: 0,
          totalMatch: 0,
          matchedTeachSkills: [],
          matchedLearnSkills: []
        };
      }
      userScores[otherUserId].teachMatch += 1;
      userScores[otherUserId].matchedTeachSkills.push({
        skillName: skill.skillName,
        level: skill.level,
        experience: skill.experience,
        price: skill.price
      });
    });

    // Process learn skills from others
    potentialLearnSkills.forEach(skill => {
      const otherUserId = skill.userId._id.toString();
      if (!userScores[otherUserId]) {
        userScores[otherUserId] = {
          user: skill.userId,
          teachMatch: 0,
          learnMatch: 0,
          totalMatch: 0,
          matchedTeachSkills: [],
          matchedLearnSkills: []
        };
      }
      userScores[otherUserId].learnMatch += 1;
      userScores[otherUserId].matchedLearnSkills.push({
        skillName: skill.skillName,
        currentLevel: skill.currentLevel,
        priority: skill.priority
      });
    });

    // 4. Compute total score and percentage
    const maxTeach = userLearnSkills.length; // we want to learn these
    const maxLearn = userTeachSkills.length; // we can teach these

    const recommendations = Object.values(userScores).map(entry => {
      const teachScore = Math.min(entry.teachMatch / maxTeach, 1);
      const learnScore = Math.min(entry.learnMatch / maxLearn, 1);
      const totalScore = (teachScore + learnScore) / 2;
      const matchPercentage = Math.round(totalScore * 100);

      return {
        user: entry.user,
        teachScore: entry.teachMatch,
        learnScore: entry.learnMatch,
        matchPercentage,
        matchedTeachSkills: entry.matchedTeachSkills,
        matchedLearnSkills: entry.matchedLearnSkills,
      };
    });

    // Sort by match percentage descending
    recommendations.sort((a, b) => b.matchPercentage - a.matchPercentage);

    // Optional: filter out users with very low match (e.g., < 20%)
    const filtered = recommendations.filter(r => r.matchPercentage >= 20);

    res.status(200).json({
      success: true,
      recommendations: filtered,
      total: filtered.length,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};