import express from "express";
import { createStory, getStories, deleteStory, viewStory } from "../controllers/storycon.js";
import upload from "../middleware/multer.js";

const router = express.Router();

router.post("/", upload.single("image"), createStory);
router.get("/:userId", getStories);
router.delete("/:id", deleteStory);
router.put("/view", viewStory);

export default router;