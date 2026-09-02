const mongoose = require('mongoose');

const TeachSkillSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    skillName: {
      type: String,
      required: [true, 'Skill name is required'],
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    level: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
      default: 'Intermediate',
    },
    experience: {
      type: String, // e.g., "2 years", "5+ years"
      trim: true,
    },
    description: {
      type: String,
      maxlength: 500,
      default: '',
    },
    availability: {
      type: String,
      enum: ['Weekdays', 'Weekends', 'Both', 'Flexible'],
      default: 'Flexible',
    },
    price: {
      type: Number,
      default: 0, // 0 = free
    },
    tags: [String],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('TeachSkill', TeachSkillSchema);