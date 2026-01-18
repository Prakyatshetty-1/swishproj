import User from "../models/User.js";
import Post from "../models/Post.js";
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

//Create post logic

export const createPost = async(req,res)=>{
    try{
        const { userId, caption, location, hashtags } = req.body;
        let imageUrl = "";

        if(req.file){
            const result = await cloudinary.uploader.upload(req.file.path, {
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

//get feed/fyp posts logic

export const getFeedPosts = async (req,res)=>{
    try{
        const posts = await Post.find()
        .populate("userId", "name avatarUrl role")
        .sort({ createdAt: -1 }); 

        res.status(200).json(posts);
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
        .sort({ createdAt: -1 }); 

        res.status(200).json(posts);
    }
    catch(err){
        console.error("Error in getting posts on your profile: ", err);
        res.status(500).json(err);
    }
};