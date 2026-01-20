import mongoose from "mongoose";

const PostSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    caption: {
      type: String,
      max: 500,
    },
    img: {
      type: String, // Cloudinary wali url
    },
    location: {
      type: String,
      default: "",
    },
    hashtags: {
      type: Array,
      default: [],
    },
    likes: {
      type: Array,
      default: [],
    },
    comments: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        text: String,
        likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true } 
);

export default mongoose.model("Post", PostSchema);