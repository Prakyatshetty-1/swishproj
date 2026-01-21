import Story from "../models/Story.js";
import User from "../models/User.js";
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  timeout: 60000,
});

console.log('✅ Cloudinary Config:', {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME ? 'Set' : 'Missing',
  api_key: process.env.CLOUDINARY_API_KEY ? 'Set' : 'Missing',
  api_secret: process.env.CLOUDINARY_API_SECRET ? 'Set' : 'Missing',
});

// 1. Create a Story
export const createStory = async (req, res) => {
  try {
    const { userId, caption } = req.body;
    let imageUrl = "";

    if (req.file) {
       // Convert buffer to base64 for Cloudinary
       const b64 = Buffer.from(req.file.buffer).toString("base64");
       let dataURI = "data:" + req.file.mimetype + ";base64," + b64;

       const result = await cloudinary.uploader.upload(dataURI, {
         folder: "swish_stories", // Separate folder for organization
       });
       imageUrl = result.secure_url;
    }

    if (!imageUrl) return res.status(400).json("Image is required");

    const newStory = new Story({ userId, img: imageUrl, caption: caption || "" });
    await newStory.save();

    res.status(200).json(newStory);
  } catch (err) {
    console.error("Error creating story:", err);
    res.status(500).json(err);
  }
};

// 2. Get Stories (Feed)
export const getStories = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUser = await User.findById(userId);

    // Fetch stories from: Following List + Self
    // We group them by User so the UI can show "User X has 3 stories"
    const stories = await Story.find({
      userId: { $in: [...currentUser.followingList, userId] }
    })
    .populate("userId", "name avatarUrl")
    .sort({ createdAt: 1 }); // Oldest first (chronological order)

    res.status(200).json(stories);
  } catch (err) {
    res.status(500).json(err);
  }
};

// 3. Delete Stories
export const deleteStory = async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);
    if (!story) return res.status(404).json("Story not found");

    // Check ownership
    if (story.userId.toString() !== req.body.userId) {
        return res.status(403).json("You can only delete your own story");
    }

    await story.deleteOne();
    res.status(200).json("Story deleted");
  } catch (err) {
    res.status(500).json(err);
  }
};

// 4. Record a View
export const viewStory = async (req, res) => {
  try {
    const { storyId, userId } = req.body;

    await Story.findByIdAndUpdate(storyId, {
      $addToSet: { viewers: userId }, // $addToSet prevents duplicates
    });

    res.status(200).json("View recorded");
  } catch (err) {
    res.status(500).json(err);
  }
};