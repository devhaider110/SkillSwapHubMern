const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
    },
    username: {
      type: String,
      required: [true, 'Please provide a username'],
      unique: true,
      trim: true,
      lowercase: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: 6,
      select: false,
    },

    // Roles
    role: {
      type: String,
      enum: ['user', 'mentor', 'admin'],
      default: 'user',
    },

    // Email verification
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: {
      type: String,
      select: false,
    },
    verificationTokenExpire: {
      type: Date,
      select: false,
    },

    // Password reset
    resetPasswordToken: {
      type: String,
      select: false,
    },
    resetPasswordExpire: {
      type: Date,
      select: false,
    },

    // Refresh token
    refreshToken: {
      type: String,
      select: false,
    },

    // Profile
    profilePic: { type: String, default: '' },
    coverImage: { type: String, default: '' },
    bio: { type: String, maxlength: 500, default: '' },
    college: { type: String, default: '' },
    company: { type: String, default: '' },
    city: { type: String, default: '' },
    country: { type: String, default: '' },
    github: { type: String, default: '' },
    linkedin: { type: String, default: '' },
    website: { type: String, default: '' },

    // Platform stats
    rating: { type: Number, default: 0 },
    followers: { type: Number, default: 0 },
    following: { type: Number, default: 0 },
    completedSwaps: { type: Number, default: 0 },
    hoursTaught: { type: Number, default: 0 },
    hoursLearned: { type: Number, default: 0 },

    // Account status
    isBlocked: { type: Boolean, default: false },

    // User settings
    settings: {
      theme: {
        type: String,
        enum: ['light', 'dark', 'system'],
        default: 'system',
      },
      emailNotifications: {
        type: Boolean,
        default: true,
      },
      pushNotifications: {
        type: Boolean,
        default: true,
      },
      isPrivate: {
        type: Boolean,
        default: false,
      },
      showEmail: {
        type: Boolean,
        default: false,
      },
      showSkills: {
        type: Boolean,
        default: true,
      },
      twoFactorAuth: {
        type: Boolean,
        default: false,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Hash password only when it changes.
UserSchema.pre('save', async function () {
  if (!this.isModified('password')) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);