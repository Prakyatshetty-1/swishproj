import express from 'express';
import { verifyAdmin } from '../middleware/adminmid.js';
import {
  getDashboardStats,
  getAllUsers,
  getAllPosts,
  banUser,
  unbanUser,
  deletePost,
  setAdminRole,
  removeAdminRole,
  searchUsers,
} from '../controllers/admincon.js';

const router = express.Router();

// DEBUG: Test endpoint to check token without admin verification
router.get('/test-token', (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    console.log('📋 Test endpoint - Auth header:', authHeader?.substring(0, 50) + '...');
    
    if (!authHeader) {
      return res.status(401).json({ message: 'No authorization header' });
    }
    
    const token = authHeader.split(' ')[1];
    console.log('📋 Token extracted:', token?.substring(0, 50) + '...');
    
    return res.status(200).json({ 
      message: 'Token received',
      token: token?.substring(0, 50) + '...',
      headerReceived: !!authHeader,
    });
  } catch (error) {
    console.error('📋 Test endpoint error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// All routes require admin verification
router.get('/dashboard-stats', verifyAdmin, getDashboardStats);
router.get('/users', verifyAdmin, getAllUsers);
router.get('/posts', verifyAdmin, getAllPosts);
router.post('/ban-user', verifyAdmin, banUser);
router.post('/unban-user', verifyAdmin, unbanUser);
router.post('/delete-post', verifyAdmin, deletePost);
router.post('/set-admin', verifyAdmin, setAdminRole);
router.post('/remove-admin', verifyAdmin, removeAdminRole);
router.get('/search-users', verifyAdmin, searchUsers);

export default router;
