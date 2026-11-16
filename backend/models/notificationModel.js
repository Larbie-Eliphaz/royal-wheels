import mongoose from "mongoose";

const notificationSchema =
  new mongoose.Schema(
    {
      recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },

      sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },

      title: String,
      message: String,

      type: {
        type: String,
        enum: ["order", "payment", "car", "system",],
      },

      isRead: {type: Boolean, default: false,},
    },
    { timestamps: true }
  );

export default mongoose.model("Notification", notificationSchema);