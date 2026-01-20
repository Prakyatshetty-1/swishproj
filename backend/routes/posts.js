import express from "express";
import { createPost, getTimelinePosts, getFeedPosts, savePost, getSavedPosts, getUserPosts, getTrendingHashtags, getPostsByHashtag, likePost, addComment, likeComment, getPostComments } from "../controllers/postcon.js";
import upload from "../middleware/multer.js";

const router = express.Router();

//Defining the endpoints

router.post("/", upload.single("image"), createPost);
router.get("/feed", getFeedPosts);
router.get("/timeline/:userId", getTimelinePosts); 
router.get("/profile/:userId", getUserPosts);
router.get("/trending/hashtags", getTrendingHashtags);
router.get("/hashtag/:hashtag", getPostsByHashtag);
router.post("/like", likePost);
router.post("/save", savePost);
router.get("/saved/:userId", getSavedPosts);
router.post("/comment", addComment);
router.post("/comment/like", likeComment);      
router.get("/:postId/comments", getPostComments);

export default router;