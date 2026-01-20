import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

// Ensure dotenv is loaded
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

// Log JWT secrets on startup (only first few chars for security)
console.log('🔐 JWT_SECRET in authcon.js:', JWT_SECRET ? `${JWT_SECRET.substring(0, 10)}... (${JWT_SECRET.length} chars)` : '❌ UNDEFINED');
console.log('🔐 JWT_REFRESH_SECRET in authcon.js:', JWT_REFRESH_SECRET ? `${JWT_REFRESH_SECRET.substring(0, 10)}... (${JWT_REFRESH_SECRET.length} chars)` : '❌ UNDEFINED');

if (!JWT_SECRET || !JWT_REFRESH_SECRET) {
  console.error('❌ CRITICAL ERROR: JWT secrets are not defined! Check your .env file');
  process.exit(1);
}

// Generate JWT Tokens
const generateTokens = (userId) => {
  console.log('🔑 Generating tokens with JWT_SECRET length:', JWT_SECRET.length);
  const accessToken = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '1h' });
  const refreshToken = jwt.sign({ userId }, JWT_REFRESH_SECRET, { expiresIn: '7d' });
  console.log('✅ Tokens generated, accessToken length:', accessToken.length);
  return { accessToken, refreshToken };
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
      return res.status(409).json({ message: 'Email already registered' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = new User({
      name,
      email: email.toLowerCase(),
      passwordHash,
      role,
      avatarUrl,
      posts: 0,
      followers: 0,
      following: 0,
      about: 'Hi there!',
    });

    await newUser.save();

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(newUser._id);

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

    // Validate inputs
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    // Find user and include password field
    const user = await User.findOne({ email: email.toLowerCase() }).select('+passwordHash');
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Compare passwords
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user._id);

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
    console.error('Login error:', error);
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
export const googleSignIn = async (req, res) => {
  try {
    const { idToken, email, name, photoURL } = req.body;

    if (!idToken || !email) {
      return res.status(400).json({ message: 'ID token and email are required' });
    }

    // Check if user exists
    let user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      // Create new user from Google sign in
      user = new User({
        name: name || '',
        email: email.toLowerCase(),
        passwordHash: null, // No password for Google auth users
        avatarUrl: photoURL || null,
        role: 'student', // Default role
        googleId: idToken,
        passwordSetupRequired: true, // New Google users must set a password
      });
      await user.save();
      console.log(`✅ New user created via Google Sign In: ${email}`);
    } else {
      // Update existing user with Google profile info
      if (!user.avatarUrl && photoURL) {
        user.avatarUrl = photoURL;
      }
      if (!user.googleId) {
        user.googleId = idToken;
      }
      await user.save();
      console.log(`✅ User logged in via Google: ${email}`);
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user._id);

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
