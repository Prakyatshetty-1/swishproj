import express from "express";
import { createPost, getFeedPosts, getUserPosts, getTrendingHashtags, getPostsByHashtag } from "../controllers/postcon.js";
import upload from "../middleware/multer.js";

const router = express.Router();

//Defining the endpoints

router.post("/", upload.single("image"), createPost);
router.get("/feed", getFeedPosts);
router.get("/profile/:userId", getUserPosts);
router.get("/trending/hashtags", getTrendingHashtags);
router.get("/hashtag/:hashtag", getPostsByHashtag);

export default router;