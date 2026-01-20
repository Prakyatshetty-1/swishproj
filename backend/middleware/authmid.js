import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    console.log('🔐 AUTH CHECK:', {
      hasAuthHeader: !!authHeader,
      authHeaderPreview: authHeader ? authHeader.substring(0, 20) + '...' : 'none'
    });

    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      console.log('❌ Authentication failed: No token provided');
      return res.status(401).json({ message: 'Access token required' });
    }

    console.log('🔍 Token received, length:', token.length);
    console.log('🔑 JWT_SECRET exists:', !!process.env.JWT_SECRET);
    console.log('🔑 JWT_SECRET length:', process.env.JWT_SECRET?.length);
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('✅ Token verified successfully!');
    console.log('👤 Decoded token data:', {
      userId: decoded.userId,
      iat: decoded.iat,
      exp: decoded.exp,
      expiresAt: new Date(decoded.exp * 1000).toISOString()
    });
    
    // Get user from database
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      console.log('❌ Authentication failed: User not found for ID:', decoded.userId);
      return res.status(401).json({ message: 'User not found' });
    }

    console.log('✅ User authenticated:', user.username, '(', user.email, ')');
    req.user = user;
    next();
  } catch (error) {
    console.error('❌ Authentication error:', {
      name: error.name,
      message: error.message,
      stack: error.stack?.split('\n')[0]
    });
    
    if (error.name === 'JsonWebTokenError') {
      console.log('🚨 JWT Error - Token is malformed or signed with wrong secret');
      return res.status(403).json({ message: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      console.log('🚨 Token Expired at:', new Date(error.expiredAt).toISOString());
      return res.status(403).json({ message: 'Token expired' });
    }
    return res.status(500).json({ message: 'Server error' });
  }
};
