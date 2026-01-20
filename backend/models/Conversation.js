import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  lastMessageTime: {
    type: Date,
    default: Date.now
  },
  unreadCount: {
    type: Map,
    of: Number,
    default: new Map()
  }
}, { 
  timestamps: true 
});

// Compound index for finding conversations by participants
conversationSchema.index({ participants: 1 });
conversationSchema.index({ lastMessageTime: -1 });

// Method to find or create a conversation
conversationSchema.statics.findOrCreate = async function(userId1, userId2) {
  let conversation = await this.findOne({
    participants: { $all: [userId1, userId2], $size: 2 }
  });

  if (!conversation) {
    conversation = await this.create({
      participants: [userId1, userId2],
      unreadCount: new Map([[userId1.toString(), 0], [userId2.toString(), 0]])
    });
  }

  return conversation;
};

const Conversation = mongoose.model('Conversation', conversationSchema);

export default Conversation;
