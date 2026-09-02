const LearningSession = require('../models/LearningSession');
const SwapRequest = require('../models/SwapRequest');
const Notification = require('../models/Notification');
const { v4: uuidv4 } = require('uuid');

// Create a new learning session
exports.createSession = async (req, res) => {
  try {
    const {
      swapRequestId,
      title,
      description,
      date,
      time,
      duration,
    } = req.body;

    const userId = req.user._id;

    // Find the swap request
    const swapRequest = await SwapRequest.findById(swapRequestId)
      .populate('teachSkillId', 'skillName')
      .populate('learnSkillId', 'skillName');

    if (!swapRequest) {
      return res.status(404).json({ success: false, message: 'Swap request not found' });
    }

    // Check if user is part of this swap
    const isTeacher = swapRequest.receiverId.toString() === userId.toString();
    const isLearner = swapRequest.requesterId.toString() === userId.toString();

    if (!isTeacher && !isLearner) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Check if session already exists for this swap
    const existing = await LearningSession.findOne({ swapRequest: swapRequestId });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Session already scheduled for this swap' });
    }

    // Determine skill name
    const skillName = isTeacher
      ? swapRequest.teachSkillId?.skillName || 'Unknown Skill'
      : swapRequest.learnSkillId?.skillName || 'Unknown Skill';

    // Generate unique meeting room name
    const roomId = `skillswap-${uuidv4().split('-')[0]}`;

    const session = await LearningSession.create({
      teacher: swapRequest.receiverId,
      learner: swapRequest.requesterId,
      swapRequest: swapRequestId,
      skill: skillName,
      title: title || `${skillName} Learning Session`,
      description,
      date,
      time,
      duration,
      meetingRoom: roomId,
      status: 'scheduled',
    });

    // Notify both participants
    const notificationMessage = `A learning session has been scheduled: ${session.title} on ${new Date(date).toLocaleDateString()} at ${time}`;

    await Notification.create({
      userId: swapRequest.receiverId,
      senderId: userId,
      type: 'session_scheduled',
      title: 'Learning Session Scheduled',
      message: notificationMessage,
      link: `/sessions/${session._id}`,
    });

    await Notification.create({
      userId: swapRequest.requesterId,
      senderId: userId,
      type: 'session_scheduled',
      title: 'Learning Session Scheduled',
      message: notificationMessage,
      link: `/sessions/${session._id}`,
    });

    res.status(201).json({ success: true, session });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all sessions for current user
exports.getMySessions = async (req, res) => {
  try {
    const userId = req.user._id;
    const sessions = await LearningSession.find({
      $or: [{ teacher: userId }, { learner: userId }],
    })
      .populate('teacher', 'name username profilePic')
      .populate('learner', 'name username profilePic')
      .populate('swapRequest')
      .sort({ date: 1 });

    res.status(200).json({ success: true, sessions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get a single session by ID
exports.getSession = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const session = await LearningSession.findById(id)
      .populate('teacher', 'name username profilePic')
      .populate('learner', 'name username profilePic')
      .populate('swapRequest');

    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    // Check if user is part of this session
    if (
      session.teacher._id.toString() !== userId.toString() &&
      session.learner._id.toString() !== userId.toString()
    ) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    res.status(200).json({ success: true, session });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update session status (start/complete/cancel)
exports.updateSessionStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = ['live', 'completed', 'cancelled'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const userId = req.user._id;
    const session = await LearningSession.findById(id);

    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    // Only teacher or learner can update
    if (
      session.teacher.toString() !== userId.toString() &&
      session.learner.toString() !== userId.toString()
    ) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Prevent updates if already completed or cancelled
    if (session.status === 'completed' || session.status === 'cancelled') {
      return res.status(400).json({ success: false, message: 'Cannot update a completed or cancelled session' });
    }

    if (status === 'live') {
      session.startedAt = new Date();
    }

    if (status === 'completed') {
      session.endedAt = new Date();
      // Update swap request status to completed
      await SwapRequest.findByIdAndUpdate(session.swapRequest, { status: 'completed' });
    }

    session.status = status;
    await session.save();

    // Notify both participants
    const notificationMessage = `Session "${session.title}" is now ${status}`;
    await Notification.create({
      userId: session.teacher,
      senderId: userId,
      type: 'session_update',
      title: `Session ${status}`,
      message: notificationMessage,
      link: `/sessions/${session._id}`,
    });
    await Notification.create({
      userId: session.learner,
      senderId: userId,
      type: 'session_update',
      title: `Session ${status}`,
      message: notificationMessage,
      link: `/sessions/${session._id}`,
    });

    res.status(200).json({ success: true, session });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get meeting details for Jitsi
exports.getMeetingDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const session = await LearningSession.findById(id);
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    // Check if user is part of this session
    if (
      session.teacher.toString() !== userId.toString() &&
      session.learner.toString() !== userId.toString()
    ) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Construct Jitsi meet URL
    const jitsiUrl = `https://meet.jit.si/${session.meetingRoom}`;

    res.status(200).json({
      success: true,
      meetingUrl: jitsiUrl,
      roomName: session.meetingRoom,
      session,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};