import User from '../models/User.js';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import sharp from 'sharp';
import { createFollowNotification } from './notificationcon.js';

// Load environment variables
dotenv.config();

// Configure Cloudinary with explicit environment variables and timeout settings
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  timeout: 60000, // 60 second timeout
});

// Log configuration (remove in production)
console.log('✅ Cloudinary Config:', {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME ? 'Set' : 'Missing',
  api_key: process.env.CLOUDINARY_API_KEY ? 'Set' : 'Missing',
  api_secret: process.env.CLOUDINARY_API_SECRET ? 'Set' : 'Missing',
});

export const updateProfile = async (req, res) => {
  try {
    const { userId, name, year, department, division, avatarUrl, about } = req.body;

    // Validate inputs
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    // Prepare update object with only provided fields
    const updateData = {};
    if (name) updateData.name = name;
    if (year) updateData.year = year;
    if (department) updateData.department = department;
    if (division) updateData.division = division;
    if (about) updateData.about = about;
    
    // Handle avatar upload to Cloudinary if provided
    if (avatarUrl) {
      try {
        // Check if avatarUrl is a data URL (base64) or a URL
        if (avatarUrl.startsWith('data:')) {
          console.log('📸 Uploading image to Cloudinary...');
          
          // Compress image before upload
          const compressedImage = await compressBase64Image(avatarUrl);
          
          // Upload to Cloudinary with increased timeout
          const result = await cloudinary.uploader.upload(compressedImage, {
            folder: 'swish/profiles',
            resource_type: 'auto',
            width: 500,
            height: 500,
            crop: 'fill',
            quality: 'auto',
            timeout: 60000,
          });
          console.log('✅ Image uploaded successfully:', result.secure_url);
          updateData.avatarUrl = result.secure_url;
        } else if (avatarUrl.startsWith('http')) {
          // Already a URL, keep as is
          console.log('📍 Using existing URL');
          updateData.avatarUrl = avatarUrl;
        } else {
          updateData.avatarUrl = avatarUrl;
        }
      } catch (cloudinaryError) {
        console.error('❌ Cloudinary upload error:', cloudinaryError);
        return res.status(500).json({ 
          message: 'Error uploading image to Cloudinary', 
          error: cloudinaryError.message 
        });
      }
    }

    // Find user and update profile data
    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    console.log(`✅ Profile updated for user: ${user.email}`);

    res.status(200).json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        year: user.year,
        division: user.division,
        avatarUrl: user.avatarUrl,
        about: user.about,
        onboardingComplete: user.onboardingComplete,
      },
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Error updating profile', error: error.message });
  }
};

// Helper function to compress base64 images using sharp
const compressBase64Image = async (base64String) => {
  try {
    // Extract the base64 data (remove data:image/...;base64, prefix)
    const base64Data = base64String.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    
    // Compress with sharp
    const compressedBuffer = await sharp(buffer)
      .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 80 })
      .toBuffer();
    
    // Convert back to base64 data URL
    return `data:image/jpeg;base64,${compressedBuffer.toString('base64')}`;
  } catch (error) {
    console.error('Image compression error:', error);
    // Return original if compression fails
    return base64String;
  }
};

// GET SINGLE USER BY ID
export const getUserById = async (req, res) => {
  try {
    const { userId } = req.params;

    // Validate userId
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const user = await User.findById(userId, {
      name: 1,
      email: 1,
      avatarUrl: 1,
      role: 1,
      about: 1,
      department: 1,
      year: 1,
      division: 1,
      followers: 1,
      following: 1,
      posts: 1,
      followingList: 1,
      followersList: 1,
    }).lean();

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      message: 'User fetched successfully',
      user: {
        _id: user._id,
        id: user._id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
        role: user.role,
        about: user.about,
        department: user.department,
        year: user.year,
        division: user.division,
        followers: user.followers,
        following: user.following,
        posts: user.posts,
        followingList: user.followingList,
        followersList: user.followersList,
      },
    });
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({ message: 'Error fetching user', error: error.message });
  }
};

// FOLLOW USER
export const followUser = async (req, res) => {
  try {
    const { currentUserId, targetUserId } = req.body;
    
    console.log(`\n📌 FOLLOW REQUEST:`, { currentUserId, targetUserId });

    // Validate inputs
    if (!currentUserId || !targetUserId) {
      console.error(`❌ Missing IDs`);
      return res.status(400).json({ message: 'Current user ID and target user ID are required' });
    }

    // Check if trying to follow self
    if (String(currentUserId) === String(targetUserId)) {
      console.error(`❌ Cannot follow self`);
      return res.status(400).json({ message: 'You cannot follow yourself' });
    }

    // Get both users
    const currentUser = await User.findById(currentUserId);
    const targetUser = await User.findById(targetUserId);
    
    console.log(`👤 Current User:`, currentUser ? currentUser.name : 'NOT FOUND');
    console.log(`👤 Target User:`, targetUser ? targetUser.name : 'NOT FOUND');

    if (!currentUser || !targetUser) {
      console.error(`❌ User not found - Current: ${currentUser ? '✓' : '✗'}, Target: ${targetUser ? '✓' : '✗'}`);
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if already following using string comparison
    console.log(`📋 Current followingList:`, currentUser.followingList.map(id => id.toString()));
    console.log(`🎯 Target User ID (type: ${typeof targetUserId}):`, targetUserId);
    
    const targetUserIdString = String(targetUserId);
    const isAlreadyFollowing = currentUser.followingList.some(
      (id) => String(id) === targetUserIdString
    );
    
    console.log(`🔍 Already following?`, isAlreadyFollowing);
    
    if (isAlreadyFollowing) {
      console.warn(`⚠️ ${currentUser.name} already follows ${targetUser.name}`);
      return res.status(400).json({ message: 'You are already following this user' });
    }

    console.log(`📝 Attempting to follow: ${currentUser.name} -> ${targetUser.name}`);

    // Add target user to current user's following list (as ObjectId)
    currentUser.followingList.push(targetUserId);
    currentUser.following += 1;

    // Add current user to target user's followers list (as ObjectId)
    targetUser.followersList.push(currentUserId);
    targetUser.followers += 1;

    // Save both users
    console.log(`💾 Saving users...`);
    await currentUser.save();
    console.log(`✅ Current user saved`);
    await targetUser.save();
    console.log(`✅ Target user saved`);

    // Create follow notification
    await createFollowNotification(targetUserId, currentUserId);

    console.log(`✅ ${currentUser.name} followed ${targetUser.name}`);

    res.status(200).json({
      message: 'Successfully followed user',
      currentUser: {
        id: currentUser._id,
        following: currentUser.following,
      },
      targetUser: {
        id: targetUser._id,
        followers: targetUser.followers,
      },
    });
  } catch (error) {
    console.error('Follow user error:', error);
    res.status(500).json({ message: 'Error following user', error: error.message });
  }
};

// UNFOLLOW USER
export const unfollowUser = async (req, res) => {
  try {
    const { currentUserId, targetUserId } = req.body;

    // Validate inputs
    if (!currentUserId || !targetUserId) {
      return res.status(400).json({ message: 'Current user ID and target user ID are required' });
    }

    // Get both users
    const currentUser = await User.findById(currentUserId);
    const targetUser = await User.findById(targetUserId);

    if (!currentUser || !targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if not following
    if (!currentUser.followingList.includes(targetUserId)) {
      return res.status(400).json({ message: 'You are not following this user' });
    }

    // Remove target user from current user's following list
    currentUser.followingList = currentUser.followingList.filter(
      (id) => id.toString() !== targetUserId.toString()
    );
    currentUser.following -= 1;

    // Remove current user from target user's followers list
    targetUser.followersList = targetUser.followersList.filter(
      (id) => id.toString() !== currentUserId.toString()
    );
    targetUser.followers -= 1;

    // Save both users
    await currentUser.save();
    await targetUser.save();

    console.log(`✅ ${currentUser.name} unfollowed ${targetUser.name}`);

    res.status(200).json({
      message: 'Successfully unfollowed user',
      currentUser: {
        id: currentUser._id,
        following: currentUser.following,
      },
      targetUser: {
        id: targetUser._id,
        followers: targetUser.followers,
      },
    });
  } catch (error) {
    console.error('Unfollow user error:', error);
    res.status(500).json({ message: 'Error unfollowing user', error: error.message });
  }
};