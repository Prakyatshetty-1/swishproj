import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import authRoutes from './routes/auth.js';
import postRoutes from "./routes/posts.js";
import notificationRoutes from './routes/notifications.js';
import messageRoutes from './routes/messages.js';
import Message from './models/Message.js';
import Conversation from './models/Conversation.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'],
    credentials: true
  }
});

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/swish';

// Store online users
const onlineUsers = new Map(); // userId -> socketId

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'], // Vite ports
  credentials: true,
  exposedHeaders: ['Cross-Origin-Opener-Policy', 'Cross-Origin-Embedder-Policy']
}));

// Add security headers
app.use((req, res, next) => {
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
  res.setHeader('Cross-Origin-Embedder-Policy', 'unsafe-none');
  next();
});

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// MongoDB Connection
mongoose.connect(MONGODB_URI, {
  serverSelectionTimeoutMS: 30000, // 30 seconds
  connectTimeoutMS: 30000,
  socketTimeoutMS: 30000,
})
  .then(() => console.log('✅ MongoDB connected successfully'))
  .catch((error) => {
    console.error('❌ MongoDB connection error:', error.message);
    console.log('Retrying MongoDB connection...');
    setTimeout(() => {
      mongoose.connect(MONGODB_URI);
    }, 5000);
  });

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/messages', messageRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ message: 'Server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
  });
});

// Socket.IO authentication middleware
io.use((socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      console.log('Authentication error: No token provided');
      return next(new Error('Authentication error: No token provided'));
    }

    console.log('Verifying token...');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token verified for user:', decoded.userId);
    
    socket.userId = decoded.userId;
    next();
  } catch (error) {
    console.error('Authentication error:', error.message);
    next(new Error('Authentication error: ' + error.message));
  }
});

// Socket.IO Connection
io.on('connection', (socket) => {
  console.log('✅ User connected:', socket.id);

  // User comes online
  socket.on('user-online', async (userId) => {
    console.log(`User ${userId} is online`);
    onlineUsers.set(userId, socket.id);
    
    // Broadcast to all clients that this user is online
    io.emit('user-status-change', { userId, online: true });
    
    // Send all pending (undelivered) messages to the user
    try {
      const pendingMessages = await Message.find({
        sender: { $ne: userId },
        delivered: false
      })
      .populate('sender', 'name username avatarUrl')
      .populate('conversationId');
      
      // Filter messages where user is a participant
      const userPendingMessages = pendingMessages.filter(msg => 
        msg.conversationId && 
        msg.conversationId.participants.some(p => p.toString() === userId)
      );
      
      if (userPendingMessages.length > 0) {
        console.log(`📦 Sending ${userPendingMessages.length} pending messages to user ${userId}`);
        
        // Send each pending message
        for (const message of userPendingMessages) {
          socket.emit('receive-message', message);
          
          // Mark as delivered
          message.delivered = true;
          await message.save();
          
          // Notify sender that message was delivered
          const senderSocketId = onlineUsers.get(message.sender._id.toString());
          if (senderSocketId) {
            io.to(senderSocketId).emit('message-delivered', { messageId: message._id });
          }
        }
      }
    } catch (error) {
      console.error('Error sending pending messages:', error);
    }
  });

  // Send message
  socket.on('send-message', async (data) => {
    try {
      const { conversationId, senderId, recipientId, text, type, mediaUrl, thumbnail } = data;

      // Create message in database
      const message = await Message.create({
        conversationId,
        sender: senderId,
        text,
        type: type || 'text',
        mediaUrl,
        thumbnail,
        delivered: false
      });

      await message.populate('sender', 'name username avatarUrl');

      // Update conversation
      const conversation = await Conversation.findById(conversationId);
      if (conversation) {
        conversation.lastMessage = message._id;
        conversation.lastMessageTime = message.createdAt;
        
        // Increment unread count for recipient
        const currentUnread = conversation.unreadCount.get(recipientId) || 0;
        conversation.unreadCount.set(recipientId, currentUnread + 1);
        
        await conversation.save();
      }

      // Send to recipient if online
      const recipientSocketId = onlineUsers.get(recipientId);
      if (recipientSocketId) {
        io.to(recipientSocketId).emit('receive-message', message);
        
        // Mark as delivered
        message.delivered = true;
        await message.save();
        
        // Send delivery confirmation to sender
        socket.emit('message-delivered', { messageId: message._id });
      } else {
        console.log(`📪 Recipient ${recipientId} is offline. Message saved and will be delivered when they come online.`);
      }

      // Send confirmation to sender (message is saved in DB)
      socket.emit('message-sent', message);

    } catch (error) {
      console.error('Send message error:', error);
      socket.emit('message-error', { error: 'Failed to send message' });
    }
  });

  // Typing indicator
  socket.on('typing', (data) => {
    const { recipientId, isTyping, conversationId } = data;
    const recipientSocketId = onlineUsers.get(recipientId);
    if (recipientSocketId) {
      io.to(recipientSocketId).emit('user-typing', { conversationId, isTyping });
    }
  });

  // Mark messages as read
  socket.on('mark-as-read', async (data) => {
    try {
      const { conversationId, userId } = data;
      
      await Message.updateMany(
        {
          conversationId,
          sender: { $ne: userId },
          read: false
        },
        { read: true }
      );

      const conversation = await Conversation.findById(conversationId);
      if (conversation) {
        conversation.unreadCount.set(userId, 0);
        await conversation.save();
        
        // Notify the other user that messages were read
        const otherUserId = conversation.participants.find(
          p => p.toString() !== userId
        )?.toString();
        
        if (otherUserId) {
          const otherSocketId = onlineUsers.get(otherUserId);
          if (otherSocketId) {
            io.to(otherSocketId).emit('messages-read', { conversationId });
          }
        }
      }
    } catch (error) {
      console.error('Mark as read error:', error);
    }
  });

  // User disconnects
  socket.on('disconnect', () => {
    console.log('❌ User disconnected:', socket.id);
    // Find and remove user from online users
    for (const [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        onlineUsers.delete(userId);
        io.emit('user-status-change', { userId, online: false });
        break;
      }
    }
  });
});

// Get online users endpoint
app.get('/api/users/online', (req, res) => {
  const onlineUserIds = Array.from(onlineUsers.keys());
  res.json({ onlineUsers: onlineUserIds });
});

// Start server
httpServer.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('✅ Socket.IO server is ready');
});
