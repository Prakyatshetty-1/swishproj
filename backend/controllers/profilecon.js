import User from '../models/User.js';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Configure Cloudinary with explicit environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Log configuration (remove in production)
console.log('✅ Cloudinary Config:', {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME ? 'Set' : 'Missing',
  api_key: process.env.CLOUDINARY_API_KEY ? 'Set' : 'Missing',
  api_secret: process.env.CLOUDINARY_API_SECRET ? 'Set' : 'Missing',
});

export const updateProfile = async (req, res) => {
  try {
    const { userId, name, year, department, division, avatarUrl } = req.body;

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
    
    // Handle avatar upload to Cloudinary if provided
    if (avatarUrl) {
      try {
        // Check if avatarUrl is a data URL (base64) or a URL
        if (avatarUrl.startsWith('data:')) {
          console.log('📸 Uploading image to Cloudinary...');
          // Upload to Cloudinary
          const result = await cloudinary.uploader.upload(avatarUrl, {
            folder: 'swish/profiles',
            resource_type: 'auto',
            width: 500,
            height: 500,
            crop: 'fill',
            quality: 'auto',
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
        onboardingComplete: user.onboardingComplete,
      },
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Error updating profile', error: error.message });
  }
};