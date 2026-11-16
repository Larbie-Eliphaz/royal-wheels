import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true },
    password: String,
    phone: String,
    role: {
      type: String,
      enum: ["customer", "vendor", "admin"],
      default: "customer",
    },
    plan: String,
    vendorPlan: String,
    subscriptionStatus: {
      type: String,
      enum: ["unpaid", "active", "expired"],
      default: "unpaid",
    },
    subscriptionStartedAt: Date,
    subscriptionExpiresAt: Date,
    lastSubscriptionPayment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
    },
    isVerified: { type: Boolean, default: false },
    isApproved: { type: Boolean, default: false }, // for vendors
  },
  { timestamps: true },
);

const User = mongoose.model("User", userSchema);
export default User;
