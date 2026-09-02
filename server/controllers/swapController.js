const Notification = require('../models/Notification');
const SwapRequest = require('../models/SwapRequest');
const TeachSkill = require('../models/TeachSkill');
const LearnSkill = require('../models/LearnSkill');
const Quiz = require('../models/Quiz');

// Create a new swap request
exports.createRequest = async (req, res) => {
  try {
    const {
      receiverId,
      teachSkillId,
      learnSkillId,
      startDate,
      endDate,
      learningGoals,
      duration,
      resources,
      meetingSchedule,
    } = req.body;

    const requesterId = req.user._id;

    const teachSkill = await TeachSkill.findOne({ _id: teachSkillId, userId: receiverId });
    if (!teachSkill) {
      return res.status(400).json({ success: false, message: 'Invalid teach skill or receiver' });
    }

    const learnSkill = await LearnSkill.findOne({ _id: learnSkillId, userId: requesterId });
    if (!learnSkill) {
      return res.status(400).json({ success: false, message: 'Invalid learn skill for requester' });
    }

    const existing = await SwapRequest.findOne({
      requesterId,
      receiverId,
      teachSkillId,
      learnSkillId,
      status: 'pending',
    });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Request already pending' });
    }

    const request = await SwapRequest.create({
      requesterId,
      receiverId,
      teachSkillId,
      learnSkillId,
      startDate,
      endDate,
      learningGoals,
      duration,
      resources,
      meetingSchedule,
    });

    // Notify receiver
    await Notification.create({
      userId: receiverId,
      senderId: requesterId,
      type: 'swap_request',
      title: 'New Swap Request',
      message: `${req.user.name} wants to learn ${learnSkill.skillName} from you.`,
      link: '/requests',
    });

    res.status(201).json({ success: true, request });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get incoming requests
exports.getIncomingRequests = async (req, res) => {
  try {
    const requests = await SwapRequest.find({ receiverId: req.user._id })
      .populate('requesterId', 'name username profilePic')
      .populate('teachSkillId', 'skillName level')
      .populate('learnSkillId', 'skillName')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, requests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get outgoing requests
exports.getOutgoingRequests = async (req, res) => {
  try {
    const requests = await SwapRequest.find({ requesterId: req.user._id })
      .populate('receiverId', 'name username profilePic')
      .populate('teachSkillId', 'skillName level')
      .populate('learnSkillId', 'skillName')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, requests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update request status
exports.updateRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = ['accepted', 'rejected', 'cancelled', 'completed'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const request = await SwapRequest.findById(id)
      .populate('requesterId', 'name')
      .populate('receiverId', 'name')
      .populate('learnSkillId', 'skillName');

    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    // Authorization
    if (status === 'cancelled' && request.requesterId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only requester can cancel' });
    }
    if (status !== 'cancelled' && request.receiverId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only receiver can update status' });
    }

    if (request.status === 'completed' || request.status === 'cancelled') {
      return res.status(400).json({ success: false, message: 'Cannot update a completed or cancelled request' });
    }

    request.status = status;
    await request.save();

    // =========================================================
    // ✅ NEW: If status is 'completed', check if a quiz exists
    // and notify the requester (if quiz exists)
    // =========================================================
    if (status === 'completed') {
      const quiz = await Quiz.findOne({ swapRequestId: request._id });
      if (quiz) {
        await Notification.create({
          userId: request.requesterId,
          senderId: req.user._id,
          type: 'quiz',
          title: '📝 Quiz Ready!',
          message: `Please take the quiz for your completed swap.`,
          link: `/quizzes/${quiz._id}`,
        });
      }
    }

    // =========================================================
    // Existing notification logic (unchanged)
    // =========================================================
    try {
      let message = '';
      let title = '';
      let userId = '';

      if (status === 'accepted') {
        userId = request.requesterId._id;
        title = 'Swap Request Accepted';
        message = `${req.user.name} has accepted your swap request for ${request.learnSkillId?.skillName || 'a skill'}.`;
      } else if (status === 'rejected') {
        userId = request.requesterId._id;
        title = 'Swap Request Rejected';
        message = `${req.user.name} has rejected your swap request for ${request.learnSkillId?.skillName || 'a skill'}.`;
      } else if (status === 'completed') {
        // Already handled above (for both parties), but we still need to send the "completed" notification to both
        // Actually the above code sends to requester, but we also want to send to receiver (teacher)
        await Notification.create({
          userId: request.receiverId._id,
          senderId: req.user._id,
          type: 'swap_completed',
          title: 'Swap Completed',
          message: `You have marked the swap as complete. Great job!`,
          link: '/requests',
        });
        // The requester notification is sent above, but let's also send the general one.
        await Notification.create({
          userId: request.requesterId._id,
          senderId: req.user._id,
          type: 'swap_completed',
          title: 'Swap Completed',
          message: `${req.user.name} has marked the swap as complete. Great job!`,
          link: '/requests',
        });
        // We already sent the quiz notification above, but if quiz exists, we've already done it.
        // This logic is fine – we'll send both notifications.
        return res.status(200).json({ success: true, request });
      } else if (status === 'cancelled') {
        userId = request.receiverId._id;
        title = 'Swap Request Cancelled';
        message = `${req.user.name} has cancelled the swap request.`;
      }

      if (userId) {
        await Notification.create({
          userId,
          senderId: req.user._id,
          type: `swap_${status}`,
          title,
          message,
          link: '/requests',
        });
      }
    } catch (notifError) {
      console.error('Notification error:', notifError);
      // Don't fail the request if notification fails
    }

    res.status(200).json({ success: true, request });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};