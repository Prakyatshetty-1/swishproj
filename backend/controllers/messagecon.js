import Message from '../models/Message.js';
import Conversation from '../models/Conversation.js';
import User from '../models/User.js';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  timeout: 120000, // 2 minutes for large files
});

// Upload media file to Cloudinary
export const uploadMedia = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const file = req.file;
    console.log('File mimetype:', file.mimetype);
    console.log('File name:', file.originalname);
    
    const fileType = file.mimetype.startsWith('image') ? 'image' : 
                     file.mimetype.startsWith('video') ? 'video' : 'file';

    // Determine resource_type based on file type
    let resourceType = 'auto';
    if (fileType === 'image') {
      resourceType = 'image';
    } else if (fileType === 'video') {
      resourceType = 'video';
    } else {
      // Documents, PDFs, etc. should use 'raw'
      resourceType = 'raw';
    }

    let uploadOptions = {
      folder: 'swish_messages',
      resource_type: resourceType
    };

    // For videos, generate thumbnail
    if (fileType === 'video') {
      uploadOptions.eager = [
        { width: 300, height: 300, crop: 'pad', format: 'jpg' }
      ];
      uploadOptions.eager_async = false;
    }

    console.log(`Uploading ${fileType} file with resource_type:`, resourceType);
    console.log('Upload options:', uploadOptions);

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(file.path, uploadOptions);

    console.log('Cloudinary result:', {
      url: result.secure_url,
      resource_type: result.resource_type,
      format: result.format
    });

    // Delete local file after upload
    fs.unlinkSync(file.path);

    // Get thumbnail URL for videos
    let thumbnailUrl = null;
    if (fileType === 'video' && result.eager && result.eager[0]) {
      thumbnailUrl = result.eager[0].secure_url;
    }

    // Construct proper URL based on resource type
    let fileUrl = result.secure_url;
    
    // Cloudinary sometimes returns wrong URL path for raw files
    // Raw files should use /raw/upload/ not /image/upload/
    if (resourceType === 'raw' && fileUrl.includes('/image/upload/')) {
      fileUrl = fileUrl.replace('/image/upload/', '/raw/upload/');
      console.log('Corrected URL from:', result.secure_url);
      console.log('Corrected URL to:', fileUrl);
    }

    console.log('Final file URL:', fileUrl);

    res.json({
      success: true,
      url: fileUrl,
      thumbnail: thumbnailUrl,
      type: fileType,
      filename: file.originalname,
      size: file.size
    });
  } catch (error) {
    console.error('Upload media error:', error);
    
    // Delete local file if it exists
    if (req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (e) {
        console.error('Error deleting file:', e);
      }
    }
    
    res.status(500).json({ message: 'Failed to upload media', error: error.message });
  }
};

// Get all conversations for a user
export const getConversations = async (req, res) => {
  try {
    const userId = req.user._id;

    const conversations = await Conversation.find({
      participants: userId
    })
      .populate('participants', 'name username avatarUrl')
      .populate('lastMessage')
      .sort({ lastMessageTime: -1 });

    // Format the response
    const formattedConversations = conversations.map(conv => {
      const otherParticipant = conv.participants.find(
        p => p._id.toString() !== userId.toString()
      );

      return {
        id: conv._id,
        user: {
          _id: otherParticipant._id,
          name: otherParticipant.name,
          username: otherParticipant.username,
          avatarUrl: otherParticipant.avatarUrl
        },
        lastMessage: conv.lastMessage ? {
          text: conv.lastMessage.text,
          timestamp: conv.lastMessage.createdAt,
          unread: conv.unreadCount.get(userId.toString()) > 0
        } : null,
        unreadCount: conv.unreadCount.get(userId.toString()) || 0,
        updatedAt: conv.updatedAt
      };
    });

    res.json(formattedConversations);
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ message: 'Failed to get conversations' });
  }
};

// Get messages for a conversation
export const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user._id;

    // Verify user is part of the conversation
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: userId
    });

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    const messages = await Message.find({ conversationId })
      .populate('sender', 'name username avatarUrl')
      .sort({ createdAt: 1 });

    // Mark messages as read
    await Message.updateMany(
      {
        conversationId,
        sender: { $ne: userId },
        read: false
      },
      { read: true }
    );

    // Reset unread count
    conversation.unreadCount.set(userId.toString(), 0);
    await conversation.save();

    res.json(messages);
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ message: 'Failed to get messages' });
  }
};

// Send a message
export const sendMessage = async (req, res) => {
  try {
    const { recipientId, text, type, mediaUrl, thumbnail } = req.body;
    const senderId = req.user._id;

    if (!recipientId) {
      return res.status(400).json({ message: 'Recipient ID is required' });
    }

    if (!text && !mediaUrl) {
      return res.status(400).json({ message: 'Message content is required' });
    }

    // Find or create conversation
    const conversation = await Conversation.findOrCreate(senderId, recipientId);

    // Create message
    const message = await Message.create({
      conversationId: conversation._id,
      sender: senderId,
      text,
      type: type || 'text',
      mediaUrl,
      thumbnail,
      delivered: true
    });

    // Update conversation
    conversation.lastMessage = message._id;
    conversation.lastMessageTime = message.createdAt;
    
    // Increment unread count for recipient
    const currentUnread = conversation.unreadCount.get(recipientId.toString()) || 0;
    conversation.unreadCount.set(recipientId.toString(), currentUnread + 1);
    
    await conversation.save();

    // Populate sender info
    await message.populate('sender', 'name username avatarUrl');

    res.status(201).json(message);
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Failed to send message' });
  }
};

// Create or get a conversation with a user
export const createConversation = async (req, res) => {
  try {
    const { userId } = req.body;
    const currentUserId = req.user._id;

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Find or create conversation
    const conversation = await Conversation.findOrCreate(currentUserId, userId);
    await conversation.populate('participants', 'name username avatarUrl');

    const otherParticipant = conversation.participants.find(
      p => p._id.toString() !== currentUserId.toString()
    );

    res.json({
      id: conversation._id,
      user: {
        _id: otherParticipant._id,
        name: otherParticipant.name,
        username: otherParticipant.username,
        avatarUrl: otherParticipant.avatarUrl
      },
      lastMessage: null,
      unreadCount: 0
    });
  } catch (error) {
    console.error('Create conversation error:', error);
    res.status(500).json({ message: 'Failed to create conversation' });
  }
};

// Mark messages as read
export const markAsRead = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user._id;

    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: userId
    });

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    await Message.updateMany(
      {
        conversationId,
        sender: { $ne: userId },
        read: false
      },
      { read: true }
    );

    conversation.unreadCount.set(userId.toString(), 0);
    await conversation.save();

    res.json({ message: 'Messages marked as read' });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({ message: 'Failed to mark messages as read' });
  }
};
