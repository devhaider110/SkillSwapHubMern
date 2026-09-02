const Quiz = require('../models/Quiz');
const QuizAttempt = require('../models/QuizAttempt');
const Notification = require('../models/Notification');

// ============================================================
// CREATE QUIZ
// ============================================================
exports.createQuiz = async (req, res) => {
  try {
    const { title, description, questions, timeLimit, passingScore, randomize, swapRequestId } = req.body;
    const userId = req.user._id;

    if (!title || !questions || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ success: false, message: 'Title and questions are required.' });
    }

    // Validate questions
    for (const q of questions) {
      if (!q.text || !q.type) {
        return res.status(400).json({ success: false, message: 'Each question must have text and type.' });
      }
      if (q.type === 'mcq' && (!q.options || q.options.length < 2)) {
        return res.status(400).json({ success: false, message: 'MCQ must have at least 2 options.' });
      }
      if (!q.correctAnswer && q.correctAnswer !== false) {
        return res.status(400).json({ success: false, message: 'Correct answer is required for each question.' });
      }
    }

    const quiz = await Quiz.create({
      createdBy: userId,
      swapRequestId: swapRequestId || null,
      title,
      description: description || '',
      questions,
      timeLimit: timeLimit || 10,
      passingScore: passingScore || 50,
      randomize: randomize || false,
    });

    // Notify participants (if swapRequestId)
    // TODO: send notifications

    res.status(201).json({ success: true, quiz });
  } catch (error) {
    console.error('Create quiz error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================================
// GET ALL QUIZZES (for user)
// ============================================================
exports.getQuizzes = async (req, res) => {
  try {
    const userId = req.user._id;
    const quizzes = await Quiz.find({
      $or: [{ createdBy: userId }, { isActive: true }],
    }).populate('createdBy', 'name username').sort({ createdAt: -1 });

    // Get attempts for each quiz
    const attempts = await QuizAttempt.find({ userId });
    const attemptMap = {};
    attempts.forEach(a => {
      if (!attemptMap[a.quizId]) attemptMap[a.quizId] = [];
      attemptMap[a.quizId].push(a);
    });

    const result = quizzes.map(q => ({
      ...q.toObject(),
      attempts: attemptMap[q._id] || [],
      hasAttempted: (attemptMap[q._id] || []).length > 0,
    }));

    res.status(200).json({ success: true, quizzes: result });
  } catch (error) {
    console.error('Get quizzes error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================================
// GET A SINGLE QUIZ (for taking)
// ============================================================
exports.getQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const quiz = await Quiz.findOne({ _id: id, isActive: true });
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found or inactive.' });
    }

    // If randomize, shuffle questions
    let questions = quiz.questions;
    if (quiz.randomize) {
      questions = [...questions].sort(() => Math.random() - 0.5);
    }

    // Remove correct answers for privacy (only if not created by user)
    const isCreator = quiz.createdBy.toString() === userId.toString();
    const sanitizedQuestions = questions.map(q => {
      const qObj = q.toObject();
      if (!isCreator) {
        delete qObj.correctAnswer;
      }
      return qObj;
    });

    res.status(200).json({
      success: true,
      quiz: {
        ...quiz.toObject(),
        questions: sanitizedQuestions,
        isCreator,
      },
    });
  } catch (error) {
    console.error('Get quiz error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================================
// SUBMIT QUIZ
// ============================================================
exports.submitQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const { answers, timeTaken } = req.body; // answers: [{ questionId, selectedAnswer }]

    const quiz = await Quiz.findById(id);
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found.' });
    }

    // Check if already attempted
    const existingAttempt = await QuizAttempt.findOne({ quizId: id, userId });
    if (existingAttempt) {
      return res.status(400).json({ success: false, message: 'You have already attempted this quiz.' });
    }

    // Calculate score
    let totalPoints = 0;
    let earnedPoints = 0;
    const answerDetails = [];

    quiz.questions.forEach((q, index) => {
      totalPoints += q.points || 1;
      const userAnswer = answers.find(a => a.questionId === q._id.toString());
      const selected = userAnswer ? userAnswer.selectedAnswer : null;
      let isCorrect = false;
      let pointsEarned = 0;

      if (q.type === 'mcq' || q.type === 'truefalse') {
        if (selected !== undefined && selected !== null) {
          const correct = q.correctAnswer;
          // For MCQ, correctAnswer is the index or value
          if (q.type === 'truefalse') {
            isCorrect = (selected === q.correctAnswer);
          } else {
            // MCQ: compare selected option index or text
            // We'll store correctAnswer as the correct option string or index
            const correctIndex = q.options.indexOf(q.correctAnswer);
            if (selected === correctIndex || selected === q.correctAnswer) {
              isCorrect = true;
            }
          }
        }
      } else if (q.type === 'shortanswer') {
        // Case-insensitive exact match (or could use regex)
        if (selected && selected.trim().toLowerCase() === q.correctAnswer.toLowerCase()) {
          isCorrect = true;
        }
      } else if (q.type === 'coding') {
        // For coding, we might not auto-grade; we could store answer and later manual review.
        // For now, we'll mark as 0 unless we implement a judge.
        // We'll just store the submitted code.
      }

      if (isCorrect) {
        pointsEarned = q.points || 1;
        earnedPoints += pointsEarned;
      }

      answerDetails.push({
        questionId: q._id,
        selectedAnswer: selected,
        isCorrect,
        pointsEarned,
      });
    });

    const score = Math.round((earnedPoints / totalPoints) * 100);
    const passed = score >= quiz.passingScore;

    const attempt = await QuizAttempt.create({
      quizId: id,
      userId,
      answers: answerDetails,
      score,
      totalPoints,
      passed,
      timeTaken: timeTaken || 0,
    });

    // Notification to quiz creator (if not self)
    if (quiz.createdBy.toString() !== userId.toString()) {
      await Notification.create({
        userId: quiz.createdBy,
        senderId: userId,
        type: 'quiz',
        title: 'Quiz Attempted',
        message: `${req.user.name} attempted your quiz "${quiz.title}"`,
        link: `/quizzes/${id}/results/${attempt._id}`,
      });
    }

    res.status(201).json({
      success: true,
      attempt: {
        _id: attempt._id,
        score,
        passed,
        totalPoints,
        earnedPoints,
        timeTaken: attempt.timeTaken,
        answers: answerDetails,
      },
    });
  } catch (error) {
    console.error('Submit quiz error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================================
// GET QUIZ RESULTS (for a specific attempt)
// ============================================================
exports.getResults = async (req, res) => {
  try {
    const { id, attemptId } = req.params;
    const userId = req.user._id;

    const attempt = await QuizAttempt.findOne({ _id: attemptId, quizId: id });
    if (!attempt) {
      return res.status(404).json({ success: false, message: 'Attempt not found.' });
    }

    // Check if user owns this attempt or is the quiz creator
    const quiz = await Quiz.findById(id);
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found.' });
    }

    if (attempt.userId.toString() !== userId.toString() && quiz.createdBy.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to view these results.' });
    }

    // Get question details
    const questions = quiz.questions.map(q => ({
      _id: q._id,
      text: q.text,
      type: q.type,
      options: q.options,
      correctAnswer: q.correctAnswer,
    }));

    const answersWithQuestions = attempt.answers.map(a => {
      const q = questions.find(q => q._id.toString() === a.questionId.toString());
      return {
        ...a.toObject(),
        question: q,
      };
    });

    res.status(200).json({
      success: true,
      attempt: {
        ...attempt.toObject(),
        answers: answersWithQuestions,
        quiz: {
          _id: quiz._id,
          title: quiz.title,
          description: quiz.description,
          passingScore: quiz.passingScore,
        },
      },
    });
  } catch (error) {
    console.error('Get results error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================================
// LEADERBOARD FOR A QUIZ
// ============================================================
exports.getLeaderboard = async (req, res) => {
  try {
    const { id } = req.params;
    const quiz = await Quiz.findById(id);
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found.' });
    }

    const attempts = await QuizAttempt.find({ quizId: id })
      .populate('userId', 'name username profilePic')
      .sort({ score: -1, timeTaken: 1 });

    res.status(200).json({ success: true, attempts });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};