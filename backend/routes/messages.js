import express from 'express';
import { authenticateToken } from '../middleware/authmid.js';
import {
  getConversations,
  getMessages,
  sendMessage,
  markAsRead,
  getUsers,
} from '../controllers/messagecon.js';

const router = express.Router();

router.get('/conversations', authenticateToken, getConversations);
router.get('/conversations/:conversationId/messages', authenticateToken, getMessages);
router.post('/send', authenticateToken, sendMessage);
router.put('/conversations/:conversationId/read', authenticateToken, markAsRead);
router.get('/users', authenticateToken, getUsers);

export default router;
