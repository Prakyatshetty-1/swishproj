import Post from "../models/Post.js";
import User from "../models/User.js";
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import { createLikeNotification, createCommentNotification, createCommentLikeNotification } from './notificationcon.js';

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

//Create post logic

export const createPost = async(req,res)=>{
    try{
        const { userId, caption, location, hashtags } = req.body;
        let imageUrl = "";

        if(req.file){
            //base 64 string and dataURI, these two lines are for multer memory storage.
            const b64 = Buffer.from(req.file.buffer).toString("base64");
            let dataURI = "data:" + req.file.mimetype + ";base64," + b64;

            const result = await cloudinary.uploader.upload(dataURI, {
                folder: "swish_posts",
            });
            imageUrl = result.secure_url;
        }

        const newPost = new Post({
            userId,
            caption,
            img: imageUrl,
            location,
            hashtags: hashtags ? JSON.parse(hashtags) : [],
        });

        const savedPost = await newPost.save();
        // await User.findByIdAndUpdate(userId, { $push: { posts: savedPost._id } });

        res.status(200).json(savedPost);
    }
    catch(err){
        console.error("Error creating the post: ",err);
        res.status(500).json(err);
    }
};

//this is for home feed, only followed users ka posts dikhega.

export const getTimelinePosts = async (req, res) => {
    try {
      const currentUserId = req.params.userId;
      const currentUser = await User.findById(currentUserId);
      
      // Safety check if user not found
      if (!currentUser) {
        return res.status(404).json("User not found");
      }
  
      // Fetch posts where the author is in the user's following list
      // Optional: Add currentUserId to the list if you want to see your own posts too
      const timelinePosts = await Post.find({ 
        userId: { $in: currentUser.followingList } 
      })
      .populate("userId", "name avatarUrl role")
      .populate("comments.userId", "name avatarUrl")  //this fixed the unknown user problem in comments section.
      .sort({ createdAt: -1 });
  
      res.status(200).json(timelinePosts);
    } catch (err) {
      res.status(500).json(err);
    }
  };

//get feed/fyp posts logic

export const getFeedPosts = async (req,res)=>{
    try{
        // Get pagination parameters from query
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Get total count of posts
        const totalPosts = await Post.countDocuments();

        // Get posts with pagination
        const posts = await Post.find()
        .populate("userId", "name avatarUrl role")
        .populate("comments.userId", "name avatarUrl")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

        res.status(200).json({
            posts,
            totalPosts,
            currentPage: page,
            totalPages: Math.ceil(totalPosts / limit),
            hasMore: skip + limit < totalPosts
        });
    }
    catch(err){
        console.error("Error in getting posts on your fyp/feed: ",err);
        res.status(500).json(err);
    }

};

//Get users posts logic for profile section

export const getUserPosts = async(req,res) => {
    try{
        const posts = await Post.find({userId: req.params.userId})
        .populate("userId", "name avatarUrl")
        .populate("comments.userId", "name avatarUrl")
        .sort({ createdAt: -1 }); 

        res.status(200).json(posts);
    }
    catch(err){
        console.error("Error in getting posts on your profile: ", err);
        res.status(500).json(err);
    }
};

//Get trending hashtags
export const getTrendingHashtags = async(req,res) => {
    try{
        // Aggregate hashtags and count their frequency
        const trendingHashtags = await Post.aggregate([
            { $unwind: "$hashtags" },
            { $group: { 
                _id: "$hashtags", 
                count: { $sum: 1 } 
            }},
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]);

        res.status(200).json({
            trendingHashtags: trendingHashtags.map(item => ({
                hashtag: item._id,
                count: item.count
            }))
        });
    }
    catch(err){
        console.error("Error in getting trending hashtags: ", err);
        res.status(500).json(err);
    }
};

//Get posts by hashtag with pagination
export const getPostsByHashtag = async(req,res) => {
    try{
        const { hashtag } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Get total count of posts with this hashtag
        const totalPosts = await Post.countDocuments({ hashtags: hashtag });

        // Get posts with this hashtag with pagination
        const posts = await Post.find({ hashtags: hashtag })
        .populate("userId", "name avatarUrl role")
        .populate("comments.userId", "name avatarUrl")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

        res.status(200).json({
            posts,
            totalPosts,
            currentPage: page,
            totalPages: Math.ceil(totalPosts / limit),
            hasMore: skip + limit < totalPosts,
            hashtag: hashtag
        });
    }
    catch(err){
        console.error("Error in getting posts by hashtag: ", err);
        res.status(500).json(err);
    }
};

// Like a post
// Like a post - FIXED VERSION
export const likePost = async(req, res) => {
    try {
        const { postId, userId } = req.body;
        
        if (!postId || !userId) {
            return res.status(400).json({ message: "PostId and UserId are required" });
        }

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        // Convert userId to string for comparison
        const userIdString = userId.toString();
        
        // Check if user already liked the post (compare as strings)
        const likeIndex = post.likes.findIndex(id => id.toString() === userIdString);
        
        if (likeIndex !== -1) {
            // User already liked, so remove the like
            post.likes.splice(likeIndex, 1);
        } else {
            // User hasn't liked, so add the like
            post.likes.push(userId);
            // Create like notification
            await createLikeNotification(postId, userId);
        }
        
        await post.save();
        
        // Populate the post data before sending response
        const populatedPost = await Post.findById(postId)
            .populate("userId", "name avatarUrl role")
            .populate("comments.userId", "name avatarUrl");
        
        res.status(200).json({ 
            message: "Like toggled successfully", 
            likes: post.likes,
            post: populatedPost 
        });
    } catch(err) {
        console.error("Error liking post: ", err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

// Add comment to post
export const addComment = async(req, res) => {
    try {
        const { postId, userId, text } = req.body;
        
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        const newComment = {
            userId,
            text,
            createdAt: new Date()
        };

        post.comments.push(newComment);
        const savedPost = await post.save();
        
        // Create comment notification
        await createCommentNotification(postId, userId);
                                                        // //this fixed the unknown user problem in name of person who posted.
        const populatedPost = await Post.findById(postId).populate("userId", "name avatarUrl role").populate("comments.userId", "name avatarUrl");
        
        res.status(200).json({ message: "Comment added", post: populatedPost });
    } catch(err) {
        console.error("Error adding comment: ", err);
        res.status(500).json(err);
    }
};

// backend/controllers/postcon.js

// Like a specific comment
export const likeComment = async (req, res) => {
  try {
    const { postId, commentId, userId } = req.body;

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    // Find the specific comment
    const comment = post.comments.id(commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    // Check if user already liked the comment
    const likeIndex = comment.likes.indexOf(userId);

    if (likeIndex === -1) {
      comment.likes.push(userId); // Like
      await createCommentLikeNotification(postId, commentId, userId, comment.userId); //notify the user if someone liked his/her comment
    } else {
      comment.likes.splice(likeIndex, 1); // Unlike
    }

    await post.save();

    // Repopulate everything so frontend updates instantly
    const populatedPost = await Post.findById(postId)
      .populate("userId", "name avatarUrl role")
      .populate("comments.userId", "name avatarUrl");

    res.status(200).json({ post: populatedPost });
  } catch (err) {
    console.error("Error liking comment:", err);
    res.status(500).json(err);
  }
};

// Save / Unsave a Post
export const savePost = async (req, res) => {
  try {
    const { postId, userId } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const isSaved = user.savedPosts.includes(postId);

    if (isSaved) {
      // Unsave: Remove from array
      user.savedPosts = user.savedPosts.filter((id) => id.toString() !== postId);
      await user.save();
      res.status(200).json({ message: "Post unsaved", isSaved: false });
    } else {
      // Save: Add to array
      user.savedPosts.push(postId);
      await user.save();
      res.status(200).json({ message: "Post saved", isSaved: true });
    }
  } catch (err) {
    console.error("Error saving post:", err);
    res.status(500).json(err);
  }
};

// Get Saved Posts for a User (For the Profile Tab)
export const getSavedPosts = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Find user and populate the savedPosts array with full post details
    const user = await User.findById(userId).populate({
      path: "savedPosts",
      populate: { path: "userId", select: "name avatarUrl role" } // Populate author of the saved post
    });

    if (!user) return res.status(404).json({ message: "User not found" });

    // Return the reversed array so most recently saved appears first
    res.status(200).json(user.savedPosts.reverse());
  } catch (err) {
    console.error("Error fetching saved posts:", err);
    res.status(500).json(err);
  }
};

// Get all comments for a post
export const getPostComments = async(req, res) => {
    try {
        const { postId } = req.params;
        
        const post = await Post.findById(postId).populate("comments.userId", "name avatarUrl");
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        res.status(200).json({ comments: post.comments });
    } catch(err) {
        console.error("Error getting comments: ", err);
        res.status(500).json(err);
    }
};
