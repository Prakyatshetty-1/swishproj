import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || ' ';
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '').split(',').map(email => email.trim().toLowerCase());

// Verify if user is authenticated
export const verifyToken = (req, res, next) => {
  try {
    console.log('🔒 verifyToken middleware called');
    console.log('📦 All headers:', Object.keys(req.headers));
    console.log('📦 Authorization header:', req.headers.authorization);
    
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1];
    
    console.log('📦 Auth header exists:', !!authHeader);
    console.log('📦 Token exists:', !!token);
    console.log('📦 Token first 30 chars:', token?.substring(0, 30));
    
    if (!token) {
      console.log('❌ No token found in authorization header');
      return res.status(401).json({ message: 'No token provided' });
    }

    console.log('🔑 Attempting JWT verification with JWT_SECRET length:', JWT_SECRET.length);
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('✅ Token verified successfully. userId:', decoded.userId);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    console.error('❌ Token verification error:', error.message);
    console.error('   Error name:', error.name);
    console.error('   Full error:', error);
    return res.status(401).json({ message: 'Invalid or expired token', error: error.message });
  }
};

// Verify if user is admin
export const verifyAdmin = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      console.log('No token in authorization header for admin check');
      return res.status(401).json({ message: 'No token provided' });
    }

    console.log('Verifying admin token...');
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      console.log('User not found for userId:', decoded.userId);
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('User check - role:', user.role, 'email:', user.email);

    // Check if user is admin either by role or by email
    if (user.role !== 'admin' && !ADMIN_EMAILS.includes(user.email.toLowerCase())) {
      console.log('User is not admin');
      return res.status(403).json({ message: 'Access denied. Admin only' });
    }

    req.userId = decoded.userId;
    req.user = user;
    next();
  } catch (error) {
    console.error('Admin verification error:', error.message);
    return res.status(401).json({ message: 'Invalid or expired token', error: error.message });
  }
};
