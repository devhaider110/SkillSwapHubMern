const User = require('../models/User');
const SwapRequest = require('../models/SwapRequest');
const TeachSkill = require('../models/TeachSkill');
const LearnSkill = require('../models/LearnSkill');
const QuizAttempt = require('../models/QuizAttempt');
const LearningSession = require('../models/LearningSession');

// ============================================================
// GET OVERALL PROGRESS STATS
// ============================================================
exports.getProgressOverview = async (req, res) => {
  try {
    const userId = req.user._id;

    // 1. User stats (already stored)
    const user = await User.findById(userId);
    const { hoursTaught, hoursLearned, completedSwaps } = user;

    // 2. Skills (Teach + Learn)
    const teachSkills = await TeachSkill.find({ userId, isActive: true });
    const learnSkills = await LearnSkill.find({ userId, isActive: true });

    // 3. Quiz attempts
    const quizAttempts = await QuizAttempt.find({ userId })
      .populate('quizId', 'title')
      .sort({ createdAt: -1 });

    const avgQuizScore = quizAttempts.length > 0
      ? quizAttempts.reduce((acc, a) => acc + a.score, 0) / quizAttempts.length
      : 0;

    // 4. Completed swaps (as teacher or learner)
    const completedSwapsList = await SwapRequest.find({
      $or: [{ requesterId: userId }, { receiverId: userId }],
      status: 'completed',
    });

    // 5. Streak (mock – we'll calculate based on daily activity)
    // For simplicity, we'll use a placeholder; later can compute from daily activity log
    const streak = Math.floor(Math.random() * 20) + 1; // placeholder

    res.status(200).json({
      success: true,
      data: {
        hoursTaught,
        hoursLearned,
        completedSwaps: completedSwaps,
        teachSkillCount: teachSkills.length,
        learnSkillCount: learnSkills.length,
        quizAttempts: quizAttempts.length,
        avgQuizScore: Math.round(avgQuizScore * 10) / 10,
        streak,
        recentActivity: quizAttempts.slice(0, 5).map(a => ({
          type: 'quiz',
          title: a.quizId?.title || 'Quiz',
          score: a.score,
          passed: a.passed,
          date: a.createdAt,
        })),
      },
    });
  } catch (error) {
    console.error('Progress overview error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================================
// GET SKILL PROGRESS
// ============================================================
exports.getSkillProgress = async (req, res) => {
  try {
    const userId = req.user._id;

    // Teach skills – progress based on completed swaps where user is teacher
    const teachSkills = await TeachSkill.find({ userId, isActive: true });
    const teachProgress = await Promise.all(
      teachSkills.map(async (skill) => {
        const swaps = await SwapRequest.find({
          receiverId: userId,
          teachSkillId: skill._id,
          status: 'completed',
        });
        const progress = Math.min((swaps.length / 5) * 100, 100); // 5 swaps = 100%
        return {
          skillName: skill.skillName,
          type: 'teach',
          progress: Math.round(progress),
          swaps: swaps.length,
        };
      })
    );

    // Learn skills – progress based on completed swaps where user is learner
    const learnSkills = await LearnSkill.find({ userId, isActive: true });
    const learnProgress = await Promise.all(
      learnSkills.map(async (skill) => {
        const swaps = await SwapRequest.find({
          requesterId: userId,
          learnSkillId: skill._id,
          status: 'completed',
        });
        const progress = Math.min((swaps.length / 5) * 100, 100);
        return {
          skillName: skill.skillName,
          type: 'learn',
          progress: Math.round(progress),
          swaps: swaps.length,
        };
      })
    );

    const allProgress = [...teachProgress, ...learnProgress];

    res.status(200).json({ success: true, progress: allProgress });
  } catch (error) {
    console.error('Skill progress error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================================
// GET WEEKLY ACTIVITY (for chart)
// ============================================================
exports.getWeeklyActivity = async (req, res) => {
  try {
    const userId = req.user._id;
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - 7);

    // Aggregated activity from swaps, sessions, quizzes
    const swaps = await SwapRequest.find({
      $or: [{ requesterId: userId }, { receiverId: userId }],
      updatedAt: { $gte: startOfWeek },
    });

    const sessions = await LearningSession.find({
      $or: [{ teacher: userId }, { learner: userId }],
      createdAt: { $gte: startOfWeek },
    });

    const quizAttempts = await QuizAttempt.find({
      userId,
      createdAt: { $gte: startOfWeek },
    });

    // Group by day
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const activity = days.map((day, index) => {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + index);
      const dayStr = date.toISOString().split('T')[0];
      const count =
        swaps.filter(s => s.updatedAt.toISOString().startsWith(dayStr)).length +
        sessions.filter(s => s.createdAt.toISOString().startsWith(dayStr)).length +
        quizAttempts.filter(q => q.createdAt.toISOString().startsWith(dayStr)).length;
      return { day, count };
    });

    res.status(200).json({ success: true, activity });
  } catch (error) {
    console.error('Weekly activity error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};