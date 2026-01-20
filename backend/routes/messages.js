import express from 'express';
import { 
  getConversations, 
  getMessages, 
  sendMessage, 
  createConversation,
  markAsRead,
  uploadMedia
} from '../controllers/messagecon.js';
import { authenticateToken } from '../middleware/authmid.js';
import messageUpload from '../middleware/messageMulter.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Upload media file
router.post('/upload', messageUpload.single('file'), uploadMedia);

// Get all conversations
router.get('/conversations', getConversations);

// Get messages for a conversation
router.get('/conversations/:conversationId/messages', getMessages);

// Send a message
router.post('/messages', sendMessage);

// Create or get conversation
router.post('/conversations', createConversation);

// Mark messages as read
router.patch('/conversations/:conversationId/read', markAsRead);

export default router;
