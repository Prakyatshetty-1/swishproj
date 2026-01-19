import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema({
  participants: [{
    type: String,
    required: true,
  }],
  lastMessage: {
    text: String,
    senderId: String,
    timestamp: Date,
  },
  unreadCount: {
    type: Map,
    of: Number,
    default: {},
  },
}, {
  timestamps: true,
});

// Compound index for efficient participant queries
conversationSchema.index({ participants: 1 });

const Conversation = mongoose.model('Conversation', conversationSchema);

export default Conversation;
