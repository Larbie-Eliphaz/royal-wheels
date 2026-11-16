import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    car: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Car",
      required: true,
    },

    orderType: {
      type: String,
      enum: ["buy", "rent"],
      required: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    baseAmount: Number,

    addOns: [
      {
        id: { type: String, required: true },
        name: { type: String, required: true },
        price: { type: Number, required: true },
      },
    ],

    startDate: Date,

    endDate: Date,

    totalDays: Number,

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },

    orderStatus: {
      type: String,
      enum: [
        "pending",
        "approved",
        "rejected",
        "cancelled",
        "active",
        "completed",
      ],
      default: "pending",
    },

    cancellationReason: String,
  },
  { timestamps: true },
);

export default mongoose.model("Order", orderSchema);
