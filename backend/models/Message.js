import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  conversationId: {
    type: String,
    required: true,
    index: true,
  },
  senderId: {
    type: String,
    required: true,
  },
  receiverId: {
    type: String,
    required: true,
  },
  text: {
    type: String,
  },
  type: {
    type: String,
    enum: ['text', 'image', 'video', 'file'],
    default: 'text',
  },
  mediaUrl: {
    type: String,
  },
  status: {
    type: String,
    enum: ['sent', 'delivered', 'read'],
    default: 'sent',
  },
  sentAt: {
    type: Date,
    default: Date.now,
  },
  deliveredAt: {
    type: Date,
  },
  readAt: {
    type: Date,
  },
}, {
  timestamps: true,
});

// Index for efficient queries
messageSchema.index({ conversationId: 1, createdAt: -1 });
messageSchema.index({ senderId: 1 });
messageSchema.index({ receiverId: 1 });

const Message = mongoose.model('Message', messageSchema);

export default Message;
