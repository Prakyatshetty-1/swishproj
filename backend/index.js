import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import { Server } from 'socket.io';
import authRoutes from './routes/auth.js';
import postRoutes from "./routes/posts.js";
import notificationRoutes from './routes/notifications.js';
import messageRoutes from './routes/messages.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/swish';

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'], // Vite ports
  credentials: true,
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:5174'],
    credentials: true,
  },
});

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

// Socket.IO Real-time messaging
const onlineUsers = new Map();

io.on('connection', (socket) => {
  socket.on('user:join', ({ userId }) => {
    if (!userId) return;
    socket.data.userId = userId;
    onlineUsers.set(userId, socket.id);
    io.emit('presence:update', Array.from(onlineUsers.keys()));
  });

  socket.on('conversation:join', ({ conversationId }) => {
    if (!conversationId) return;
    socket.join(conversationId);
  });

  socket.on('message:send', ({ conversationId, message }) => {
    if (!conversationId || !message) return;
    socket.to(conversationId).emit('message:new', message);
    socket.emit('message:delivered', { messageId: message.id, conversationId });
  });

  socket.on('message:read', ({ messageId, conversationId }) => {
    if (!messageId || !conversationId) return;
    const readAt = Date.now();
    io.to(conversationId).emit('message:read', { messageId, conversationId, readAt });
  });

  socket.on('typing:start', ({ conversationId, userId }) => {
    if (!conversationId || !userId) return;
    socket.to(conversationId).emit('typing', { conversationId, userId, isTyping: true });
  });

  socket.on('typing:stop', ({ conversationId, userId }) => {
    if (!conversationId || !userId) return;
    socket.to(conversationId).emit('typing', { conversationId, userId, isTyping: false });
  });

  socket.on('disconnect', () => {
    const userId = socket.data.userId;
    if (userId) {
      onlineUsers.delete(userId);
      io.emit('presence:update', Array.from(onlineUsers.keys()));
    }
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
