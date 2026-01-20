import mongoose from "mongoose";

const EventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      max: 200,
    },
    description: {
      type: String,
      required: true,
      max: 1000,
    },
    date: {
      type: Date,
      required: true,
    },
    time: {
      type: String,
      required: true,
    },
    endDate: {
      type: Date,
      default: null,
    },
    location: {
      type: String,
      required: true,
      max: 300,
    },
    category: {
      type: String,
      enum: ["academic", "career", "sports", "workshop", "cultural", "social", "other"],
      default: "other",
    },
    attendees: {
      type: Number,
      default: 0,
    },
    image: {
      type: String,
      required: false,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    registeredUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Event", EventSchema);
