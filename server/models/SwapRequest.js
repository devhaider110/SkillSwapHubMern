const mongoose = require('mongoose');

const SwapRequestSchema = new mongoose.Schema(
  {
    requesterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    teachSkillId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TeachSkill',
      required: true,
    },
    learnSkillId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LearnSkill',
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'completed', 'cancelled'],
      default: 'pending',
    },
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
    learningGoals: {
      type: String,
      maxlength: 500,
    },
    duration: {
      type: String, // e.g., "4 weeks", "2 months"
    },
    resources: {
      type: String,
    },
    meetingSchedule: {
      type: String,
    },
    feedback: {
      type: String,
      maxlength: 500,
    },
    // Optional rating from both sides can be added later
  },
  { timestamps: true }
);

module.exports = mongoose.model('SwapRequest', SwapRequestSchema);