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
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

export default mongoose.model('User', userSchema);
