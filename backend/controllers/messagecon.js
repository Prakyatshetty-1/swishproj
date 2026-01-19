import Message from '../models/Message.js';
import Conversation from '../models/Conversation.js';
import User from '../models/User.js';

// Get all conversations for a user
export const getConversations = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id || req.user.uid;

    // Get all messages where user is sender or receiver
    const messages = await Message.find({
      $or: [{ senderId: userId }, { receiverId: userId }]
    }).sort({ createdAt: -1 });

    // Group by conversation and get the latest message
    const conversationsMap = new Map();

    for (const message of messages) {
      const otherUserId = message.senderId === userId ? message.receiverId : message.senderId;
      const conversationId = [userId, otherUserId].sort().join(':');

      if (!conversationsMap.has(conversationId)) {
        conversationsMap.set(conversationId, {
          conversationId,
          otherUserId,
          lastMessage: message,
          unreadCount: 0,
        });
      }
    }

    // Get user details for each conversation
    const conversations = await Promise.all(
      Array.from(conversationsMap.values()).map(async (conv) => {
        const otherUser = await User.findOne({
          $or: [
            { _id: conv.otherUserId },
            { uid: conv.otherUserId },
            { id: conv.otherUserId }
          ]
        }).select('name username avatarUrl uid _id');

        // Count unread messages
        const unreadCount = await Message.countDocuments({
          conversationId: conv.conversationId,
          receiverId: userId,
          status: { $ne: 'read' }
        });

        return {
          id: conv.conversationId,
          user: {
            id: otherUser?.uid || otherUser?._id?.toString() || conv.otherUserId,
            name: otherUser?.name || 'Unknown User',
            username: otherUser?.username || '@unknown',
            avatarUrl: otherUser?.avatarUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default',
          },
          lastMessage: {
            text: conv.lastMessage.text || 'Media',
            timestamp: conv.lastMessage.createdAt,
            unread: unreadCount > 0,
          },
        };
      })
    );

    res.json(conversations);
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ message: 'Failed to fetch conversations' });
  }
};

// Get messages for a conversation
export const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id || req.user._id || req.user.uid;

    const messages = await Message.find({ conversationId })
      .sort({ createdAt: 1 })
      .limit(100);

    // Format messages
    const formattedMessages = messages.map((msg) => ({
      id: msg._id.toString(),
      conversationId: msg.conversationId,
      senderId: msg.senderId,
      receiverId: msg.receiverId,
      text: msg.text,
      type: msg.type,
      mediaUrl: msg.mediaUrl,
      timestamp: new Date(msg.sentAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      status: msg.status,
      sentAt: msg.sentAt,
      deliveredAt: msg.deliveredAt,
      readAt: msg.readAt,
    }));

    res.json(formattedMessages);
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ message: 'Failed to fetch messages' });
  }
};

// Send a message
export const sendMessage = async (req, res) => {
  try {
    const { conversationId, receiverId, text, type, mediaUrl } = req.body;
    const senderId = req.user.id || req.user._id || req.user.uid;

    const message = new Message({
      conversationId,
      senderId,
      receiverId,
      text,
      type: type || 'text',
      mediaUrl,
      status: 'sent',
      sentAt: new Date(),
    });

    await message.save();

    // Update or create conversation
    const participants = [senderId, receiverId].sort();
    await Conversation.findOneAndUpdate(
      { participants: { $all: participants } },
      {
        participants,
        lastMessage: {
          text: text || 'Media',
          senderId,
          timestamp: new Date(),
        },
        $inc: { [`unreadCount.${receiverId}`]: 1 },
      },
      { upsert: true }
    );

    const formattedMessage = {
      id: message._id.toString(),
      conversationId: message.conversationId,
      senderId: message.senderId,
      receiverId: message.receiverId,
      text: message.text,
      type: message.type,
      mediaUrl: message.mediaUrl,
      timestamp: new Date(message.sentAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      status: message.status,
      sentAt: message.sentAt,
    };

    res.status(201).json(formattedMessage);
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Failed to send message' });
  }
};

// Mark messages as read
export const markAsRead = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id || req.user._id || req.user.uid;

    await Message.updateMany(
      {
        conversationId,
        receiverId: userId,
        status: { $ne: 'read' }
      },
      {
        status: 'read',
        readAt: new Date()
      }
    );

    res.json({ message: 'Messages marked as read' });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({ message: 'Failed to mark messages as read' });
  }
};

// Get all users for starting new conversations
export const getUsers = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id || req.user.uid;
    const { search } = req.query;

    let query = {
      $and: [
        {
          $or: [
            { _id: { $ne: userId } },
            { uid: { $ne: userId } },
          ]
        }
      ]
    };

    if (search) {
      query.$and.push({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { username: { $regex: search, $options: 'i' } }
        ]
      });
    }

    const users = await User.find(query)
      .select('name username avatarUrl uid _id')
      .limit(20);

    const formattedUsers = users.map(user => ({
      id: user.uid || user._id.toString(),
      name: user.name,
      username: user.username,
      avatarUrl: user.avatarUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + user.name,
    }));

    res.json(formattedUsers);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
};
