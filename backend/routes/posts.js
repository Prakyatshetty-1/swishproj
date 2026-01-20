import express from "express";
import { createPost, getTimelinePosts, getFeedPosts, getUserPosts, getTrendingHashtags, getPostsByHashtag, likePost, addComment, getPostComments } from "../controllers/postcon.js";
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
router.post("/comment", addComment);
router.get("/:postId/comments", getPostComments);

export default router;