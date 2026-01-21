import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || ' ';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || ' ';

// Admin emails from environment
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '').split(',').map(email => email.trim().toLowerCase());

// Generate JWT Tokens
const generateTokens = (userId, isAdmin = false) => {
  console.log('Generating tokens for userId:', userId);
  console.log('JWT_SECRET being used:', process.env.JWT_SECRET?.substring(0, 20) + '...');
  // Admin tokens expire in 30 days (persists until logout), regular users in 1 hour
  const expiresIn = isAdmin ? '30d' : '1h';
  const accessToken = jwt.sign({ userId }, JWT_SECRET, { expiresIn });
  const refreshToken = jwt.sign({ userId }, JWT_REFRESH_SECRET, { expiresIn: '7d' });
  console.log('Generated access token:', accessToken.substring(0, 30) + '...');
  return { accessToken, refreshToken };
};

// Helper: Check if email is admin
const isAdminEmail = (email) => {
  return ADMIN_EMAILS.includes(email.toLowerCase());
};

// SIGNUP
export const signup = async (req, res) => {
  try {
    const { name, email, password, role = 'student', avatarUrl = null } = req.body;

    // Validate inputs
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide name, email, and password' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      // Check if user is banned
      if (existingUser.isBanned) {
        return res.status(403).json({ message: 'Your account has been banned', isBanned: true, bannedReason: existingUser.bannedReason });
      }
      return res.status(409).json({ message: 'Email already registered' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Determine user role - set to admin if email is in admin list
    const userRole = isAdminEmail(email) ? 'admin' : role;

    // Create new user
    const newUser = new User({
      name,
      email: email.toLowerCase(),
      passwordHash,
      role: userRole,
      avatarUrl,
      posts: 0,
      followers: 0,
      following: 0,
      about: 'Hi there!',
    });

    await newUser.save();

    // Generate tokens (pass isAdmin flag)
    const { accessToken, refreshToken } = generateTokens(newUser._id, userRole === 'admin');

    // Save refresh token to database
    newUser.refreshTokens.push(refreshToken);
    await newUser.save();

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        avatarUrl: newUser.avatarUrl,
        posts: newUser.posts,
        followers: newUser.followers,
        following: newUser.following,
        about: newUser.about,
      },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Error creating user', error: error.message });
  }
};

// LOGIN
export const login = async (req, res) => {
  try {
    const { email, password, rememberMe } = req.body;
    console.log('🔐 Login attempt for email:', email);

    // Validate inputs
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    // Find user and include password field
    let user = await User.findOne({ email: email.toLowerCase() }).select('+passwordHash');
    if (!user) {
      console.log('❌ User not found:', email);
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    console.log('✅ User found:', email, 'Current role:', user.role);

    // Check if user is banned
    if (user.isBanned) {
      console.log('❌ User is banned:', email);
      return res.status(403).json({ message: 'Your account has been banned', isBanned: true, bannedReason: user.bannedReason });
    }

    // Compare passwords
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      console.log('❌ Password invalid for user:', email);
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    console.log('✅ Password valid');

    // Check if user should be admin (email in admin list) and update if needed
    if (isAdminEmail(email) && user.role !== 'admin') {
      user.role = 'admin';
      await user.save();
      console.log(`✅ User ${email} promoted to admin`);
    }

    // Generate tokens (pass isAdmin flag for longer expiration)
    const { accessToken, refreshToken } = generateTokens(user._id, user.role === 'admin');
    console.log('✅ Tokens generated successfully');

    // Save refresh token if "Remember me" is checked
    if (rememberMe) {
      user.refreshTokens.push(refreshToken);
      await user.save();
    }

    res.status(200).json({
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        year: user.year,
        division: user.division,
        avatarUrl: user.avatarUrl,
        onboardingComplete: user.onboardingComplete,
      },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ message: 'Error logging in', error: error.message });
  }
};

// LOGOUT
export const logout = async (req, res) => {
  try {
    const { userId, refreshToken } = req.body;

    // Find user and remove the refresh token
    await User.findByIdAndUpdate(userId, {
      $pull: { refreshTokens: refreshToken },
    });

    res.status(200).json({ message: 'Logout successful' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Error logging out', error: error.message });
  }
};

// REFRESH TOKEN
export const refreshAccessToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token required' });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user || !user.refreshTokens.includes(refreshToken)) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    // Generate new access token
    const accessToken = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1h' });

    res.status(200).json({ accessToken });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(401).json({ message: 'Invalid refresh token', error: error.message });
  }
};

// SET PASSWORD (for users created via Google auth who initially had no password)
export const setPassword = async (req, res) => {
  try {
    const { userId, password } = req.body;

    if (!userId || !password) {
      return res.status(400).json({ message: 'Please provide userId and password' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Hash and save password
    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(password, salt);
    user.passwordSetupRequired = false; // Mark password setup as complete
    await user.save();

    console.log(`✅ Password set for user: ${user.email}`);

    res.status(200).json({
      message: 'Password set successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        year: user.year,
        division: user.division,
        avatarUrl: user.avatarUrl,
        onboardingComplete: user.onboardingComplete,
        passwordSetupRequired: false,
      },
    });
  } catch (error) {
    console.error('Set password error:', error);
    res.status(500).json({ message: 'Error setting password', error: error.message });
  }
};

// GOOGLE SIGNIN
// GOOGLE SIGNIN
export const googleSignIn = async (req, res) => {
  try {
    const { idToken, email, name, photoURL } = req.body;

    if (!idToken || !email) {
      return res.status(400).json({ message: 'ID token and email are required' });
    }

    // Check if user exists
    let user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      // Determine role based on admin email list
      const userRole = isAdminEmail(email) ? 'admin' : 'student';
      
      // Create new user from Google sign in
      user = new User({
        name: name || '',
        email: email.toLowerCase(),
        passwordHash: null, // No password for Google auth users
        avatarUrl: photoURL || null,
        role: userRole, // Use determined role instead of hardcoded 'admin'
        googleId: idToken,
        passwordSetupRequired: true, // New Google users must set a password
      });
      await user.save();
      console.log(`✅ New user created via Google Sign In: ${email} with role: ${userRole}`);
    } else {
      // Update existing user with Google profile info
      if (!user.avatarUrl && photoURL) {
        user.avatarUrl = photoURL;
      }
      if (!user.googleId) {
        user.googleId = idToken;
      }
      
      // Check if user should be admin (email in admin list) and update if needed
      if (isAdminEmail(email) && user.role !== 'admin') {
        user.role = 'admin';
        console.log(`✅ User ${email} promoted to admin via Google sign in`);
      }
      
      await user.save();
      console.log(`✅ User logged in via Google: ${email}`);
    }

    // Check if user is banned
    if (user.isBanned) {
      console.log('❌ User is banned:', email);
      return res.status(403).json({ 
        message: 'Your account has been banned', 
        isBanned: true, 
        bannedReason: user.bannedReason 
      });
    }

    // Generate tokens (pass isAdmin flag for longer expiration)
    const { accessToken, refreshToken } = generateTokens(user._id, user.role === 'admin');

    // Save refresh token to database
    user.refreshTokens.push(refreshToken);
    await user.save();

    res.status(200).json({
      message: 'Google sign in successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        year: user.year,
        division: user.division,
        avatarUrl: user.avatarUrl,
        onboardingComplete: user.onboardingComplete,
        passwordSetupRequired: user.passwordSetupRequired,
      },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error('Google sign in error:', error);
    res.status(500).json({ message: 'Error with Google sign in', error: error.message });
  }
};

// SAVE ONBOARDING DATA
export const saveOnboarding = async (req, res) => {
  try {
    const { userId, role, department, year, division } = req.body;

    // Validate inputs
    if (!userId || !role || !department) {
      return res.status(400).json({ message: 'Please provide userId, role, and department' });
    }

    // Find user and update onboarding data
    const user = await User.findByIdAndUpdate(
      userId,
      {
        role,
        department,
        year: role === 'student' ? year : null,
        division: role === 'student' ? division : null,
        onboardingComplete: true,
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    console.log(`✅ Onboarding completed for user: ${user.email}`);

    res.status(200).json({
      message: 'Onboarding data saved successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        year: user.year,
        division: user.division,
        onboardingComplete: user.onboardingComplete,
        avatarUrl: user.avatarUrl,
      },
    });
  } catch (error) {
    console.error('Onboarding error:', error);
    res.status(500).json({ message: 'Error saving onboarding data', error: error.message });
  }
};
