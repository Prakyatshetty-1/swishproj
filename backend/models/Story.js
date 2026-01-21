import mongoose from "mongoose";

const StorySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    img: { type: String, required: true },
    caption: { type: String, default: "" },
    viewers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    createdAt: { type: Date, default: Date.now, expires: 86400 } //auto delete stories after 24 hours ie 86400s
  },
  { timestamps: true }
);

export default mongoose.model("Story", StorySchema);