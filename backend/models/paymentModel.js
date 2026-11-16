import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
    },

    purpose: {
      type: String,
      enum: ["order", "subscription"],
      default: "order",
    },

    subscriptionPlan: {
      type: String,
      enum: ["starter", "growth", "pro"],
    },

    reference: {
      type: String,
      required: true,
    },

    amount: Number,

    currency: { type: String, required: true, default: "GHS" },

    paymentMethod: {type: String, default: "paystack", },

    status: {
      type: String,
      enum: ["pending", "success", "failed", ],
      default: "pending",
    },
  },
  { timestamps: true }
);

export default mongoose.model( "Payment", paymentSchema);