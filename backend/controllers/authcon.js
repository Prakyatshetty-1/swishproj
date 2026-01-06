import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || ' ';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || ' ';

// Generate JWT Tokens
const generateTokens = (userId) => {
  const accessToken = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '1h' });
  const refreshToken = jwt.sign({ userId }, JWT_REFRESH_SECRET, { expiresIn: '7d' });
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
      console.log(`❌ Login failed: User not found for email: ${email}`);
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Compare passwords
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      console.log(`❌ Login failed: Invalid password for user: ${email}`);
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    
    console.log(`✅ Login successful for user: ${email}`);

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
