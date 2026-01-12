# Cloudinary Setup Guide for Profile Photo Upload

## Overview
The profile photo upload system has been configured to store images on Cloudinary and save their URLs to the MongoDB database.

## Setup Steps

### 1. Cloudinary Account & API Keys
If you don't have a Cloudinary account:
1. Visit [https://cloudinary.com](https://cloudinary.com)
2. Sign up for a free account
3. Go to your Dashboard and find your API credentials:
   - Cloud Name
   - API Key
   - API Secret

### 2. Environment Variables
Add the following to your `.env` file in the `/backend` directory:

```
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Make sure to keep these credentials **secret** and never commit them to version control.

### 3. How It Works

#### Frontend (EditProfile Component)
- User selects a photo file
- Component converts it to a Data URL (base64) using FileReader
- Sends the base64 string to the backend API

#### Backend (Update Profile Endpoint)
- Receives the base64 image data
- Uploads it to Cloudinary using the Cloudinary SDK
- Stores the returned secure URL in MongoDB
- Returns the Cloudinary URL to the frontend

#### Storage
- Images are stored in the `swish/profiles` folder on Cloudinary
- Only the secure HTTPS URL is stored in the database
- Images are automatically optimized (500x500px, quality: auto)

## File Changes Made

### Backend Files Modified:
1. **`/backend/controllers/profilecon.js`**
   - Added Cloudinary configuration
   - Added image upload logic before saving to database
   - Handles both base64 data URLs and regular URLs

### Frontend Files (No changes needed):
- **`/src/components/EditProfile.jsx`** - Already converts files to Data URLs
- System already sends the data to the backend correctly

## Testing

1. Start the backend server:
   ```bash
   cd backend
   npm run dev
   ```

2. Start the frontend development server:
   ```bash
   cd swishmern
   npm run dev
   ```

3. Go to your profile and click "Edit Profile"

4. Change your profile photo and save

5. The new photo should appear on your profile after the page reloads

## Troubleshooting

### Issue: "Missing environment variables"
- **Solution**: Check that `.env` file exists in `/backend` directory with all Cloudinary credentials

### Issue: "Cloudinary upload error"
- **Solution**: Verify your API credentials are correct and your Cloudinary account is active

### Issue: "Image not showing after upload"
- **Solution**: Check browser console for errors. Ensure Cloudinary folder structure is created properly

## Benefits of This Setup

✅ **Secure**: Images stored in the cloud, not on your server
✅ **Scalable**: Cloudinary handles all image optimization and delivery
✅ **Fast**: CDN distribution ensures fast loading
✅ **Automatic Optimization**: Images are automatically compressed and resized
✅ **Backup**: Images backed up on Cloudinary servers

## Security Notes

- Never expose your API Secret in frontend code
- Always keep credentials in `.env` file
- Add `.env` to `.gitignore` to prevent accidental commits
- The current setup uses secure HTTPS URLs only
