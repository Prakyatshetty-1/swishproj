import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      match: [/.+@.+\..+/, 'Please provide a valid email'],
    },
    passwordHash: {
      type: String,
      minlength: 6,
      select: false, // Don't return password by default
      default: null,
    },
    role: {
      type: String,
      enum: ['student', 'faculty', 'admin'],
      default: 'student',
    },
    department: {
      type: String,
      default: null,
    },
    year: {
      type: String,
      default: null,
    },
    division: {
      type: String,
      default: null,
    },
    onboardingComplete: {
      type: Boolean,
      default: false,
    },
    avatarUrl: {
      type: String,
      default: null,
    },
    refreshTokens: {
      type: [String],
      default: [],
    },
    googleId: {
      type: String,
      default: null,
    },
    passwordSetupRequired: {
      type: Boolean,
      default: false,
    },
    posts: {
      type: Number,
      default: 0,
    },
    followers: {
      type: Number,
      default: 0,
    },
    followersList: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'User',
      default: [],
    },
    following: {
      type: Number,
      default: 0,
    },
    followingList: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'User',
      default: [],
    },
    about: {
      type: String,
      default: 'Hi there!',
    },
    notificationPreferences: {
      likes: {
        type: Boolean,
        default: true,
      },
      comments: {
        type: Boolean,
        default: true,
      },
      follows: {
        type: Boolean,
        default: true,
      },
    },
    isBanned: {
      type: Boolean,
      default: false,
    },
    bannedReason: {
      type: String,
      default: null,
    },
    bannedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

export default mongoose.model('User', userSchema);
