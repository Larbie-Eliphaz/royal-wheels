import expressAsyncHandler from "express-async-handler";
import axios from "axios";
import Order from "../models/orderModel.js";
import Payment from "../models/paymentModel.js";
import User from "../models/userModel.js";
import sendNotification from "../utils/notify.js";
import {
  addOneSubscriptionMonth,
  getSubscriptionDaysRemaining,
  VENDOR_SUBSCRIPTION_PLANS,
} from "../config/vendorSubscriptions.js";

export const getAllPayments = expressAsyncHandler(async (_req, res) => {
  const payments = await Payment.find({})
    .populate("user", "name email role vendorPlan subscriptionExpiresAt")
    .populate({
      path: "order",
      select: "orderStatus paymentStatus orderType amount car",
      populate: { path: "car", select: "title brand model" },
    })
    .sort({ createdAt: -1 })
    .lean();

  res.json({ success: true, payments });
});

const ensurePaystackConfigured = () => {
  const secretKey = process.env.PAYSTACK_SECRET_KEY?.trim();

  if (!secretKey || /^(your_|replace_me|placeholder)/i.test(secretKey)) {
    const error = new Error(
      "Payment service is not configured. Set a valid PAYSTACK_SECRET_KEY.",
    );
    error.status = 503;
    throw error;
  }

  return secretKey;
};

const initializePaystack = async ({ email, amount, currency, metadata }) => {
  const secretKey = ensurePaystackConfigured();
  const response = await axios.post(
    "https://api.paystack.co/transaction/initialize",
    {
      email,
      amount: Math.round(amount * 100),
      currency,
      metadata,
      callback_url: `${(process.env.FRONTEND_URL || "http://localhost:5173").replace(/\/+$/, "")}/payment/callback`,
    },
    {
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/json",
      },
    },
  );

  if (
    !response.data?.status ||
    !response.data?.data?.reference ||
    !response.data?.data?.authorization_url
  ) {
    const error = new Error(
      response.data?.message || "Unable to initialize payment.",
    );
    error.status = 502;
    throw error;
  }

  return response.data.data;
};

export const initializePayment = expressAsyncHandler(async (req, res) => {
  const { orderId } = req.body;
  const order = await Order.findById(orderId).populate("customer");

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  if (order.customer._id.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Unauthorized");
  }

  if (order.paymentStatus === "paid") {
    res.status(409);
    throw new Error("Order has already been paid");
  }

  if (order.orderStatus !== "pending") {
    res.status(400);
    throw new Error("Only pending orders can be paid.");
  }

  const currency = process.env.PAYSTACK_CURRENCY || "GHS";
  const transaction = await initializePaystack({
    email: order.customer.email,
    amount: order.amount,
    currency,
    metadata: {
      purpose: "order",
      orderId: order._id.toString(),
      customerId: req.user._id.toString(),
    },
  });

  await Payment.create({
    user: req.user._id,
    order: order._id,
    purpose: "order",
    reference: transaction.reference,
    amount: order.amount,
    currency,
  });

  res.json({
    success: true,
    authorization_url: transaction.authorization_url,
    reference: transaction.reference,
  });
});

export const initializeVendorSubscription = expressAsyncHandler(
  async (req, res) => {
    const planKey = req.body?.plan;
    const plan = VENDOR_SUBSCRIPTION_PLANS[planKey];

    if (!plan) {
      res.status(400);
      throw new Error("Choose a valid vendor subscription plan.");
    }

    const currency = process.env.PAYSTACK_CURRENCY || "GHS";
    const transaction = await initializePaystack({
      email: req.user.email,
      amount: plan.amount,
      currency,
      metadata: {
        purpose: "subscription",
        vendorId: req.user._id.toString(),
        plan: planKey,
      },
    });

    await Payment.create({
      user: req.user._id,
      purpose: "subscription",
      subscriptionPlan: planKey,
      reference: transaction.reference,
      amount: plan.amount,
      currency,
    });

    res.json({
      success: true,
      authorization_url: transaction.authorization_url,
      reference: transaction.reference,
    });
  },
);

export const verifyPayment = expressAsyncHandler(async (req, res) => {
  const { reference } = req.params;
  const secretKey = ensurePaystackConfigured();
  const payment = await Payment.findOne({ reference, user: req.user._id });

  if (!payment) {
    res.status(404);
    throw new Error("Payment not found");
  }

  const order =
    payment.purpose === "subscription"
      ? null
      : await Order.findById(payment.order);
  if (payment.purpose !== "subscription" && !order) {
    res.status(404);
    throw new Error("Order not found");
  }

  const response = await axios.get(
    `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
    { headers: { Authorization: `Bearer ${secretKey}` } },
  );
  const paymentData = response.data.data;
  const expectedCurrency =
    payment.currency || process.env.PAYSTACK_CURRENCY || "GHS";

  if (
    paymentData.reference !== reference ||
    paymentData.amount !== Math.round(payment.amount * 100) ||
    (order && payment.amount !== order.amount) ||
    paymentData.currency !== expectedCurrency
  ) {
    res.status(400);
    throw new Error("Payment details do not match the order");
  }

  if (paymentData.status === "success") {
    if (payment.purpose === "subscription") {
      const vendor = await User.findById(payment.user);
      if (!vendor || vendor.role !== "vendor") {
        res.status(404);
        throw new Error("Vendor account not found.");
      }

      if (
        vendor.lastSubscriptionPayment?.toString() !== payment._id.toString()
      ) {
        const now = new Date();
        const hasCurrentSubscription =
          vendor.subscriptionExpiresAt > now;
        const startsAt = hasCurrentSubscription
          ? vendor.subscriptionStartedAt || now
          : now;
        const expiresAt = addOneSubscriptionMonth(
          hasCurrentSubscription ? vendor.subscriptionExpiresAt : now,
        );
        const updatedVendor = await User.findOneAndUpdate(
          {
            _id: vendor._id,
            lastSubscriptionPayment: { $ne: payment._id },
          },
          {
            $set: {
              plan: payment.subscriptionPlan,
              vendorPlan: payment.subscriptionPlan,
              subscriptionStatus: "active",
              subscriptionStartedAt: startsAt,
              subscriptionExpiresAt: expiresAt,
              lastSubscriptionPayment: payment._id,
            },
          },
          { new: true },
        );

        if (!updatedVendor) {
          const latestVendor = await User.findById(vendor._id);
          if (
            latestVendor?.lastSubscriptionPayment?.toString() !==
            payment._id.toString()
          ) {
            res.status(409);
            throw new Error("Unable to activate the vendor subscription.");
          }
        }
      }

      await Payment.findOneAndUpdate(
        { _id: payment._id, status: { $ne: "success" } },
        { $set: { status: "success" } },
      );

      const activeVendor = await User.findById(vendor._id).select(
        "plan vendorPlan subscriptionStatus subscriptionStartedAt subscriptionExpiresAt",
      );
      return res.json({
        success: true,
        paymentStatus: paymentData.status,
        paymentType: "subscription",
        subscription: {
          plan: activeVendor.vendorPlan,
          vendorPlan: activeVendor.vendorPlan,
          subscriptionStatus: activeVendor.subscriptionStatus,
          subscriptionStartedAt: activeVendor.subscriptionStartedAt,
          subscriptionExpiresAt: activeVendor.subscriptionExpiresAt,
          subscriptionDaysRemaining:
            getSubscriptionDaysRemaining(activeVendor),
        },
      });
    }

    const transitionedToSuccess = await Payment.findOneAndUpdate(
      { _id: payment._id, status: { $ne: "success" } },
      { $set: { status: "success" } },
      { new: true },
    );

    order.paymentStatus = "paid";
    await order.save();

    if (transitionedToSuccess) {
      await sendNotification({
        io: req.app.get("io"),
        recipient: order.customer,
        title: "Payment Successful",
        message: "Your payment was successful.",
        type: "payment",
      });
    }
  } else if (paymentData.status === "failed") {
    await Payment.findOneAndUpdate(
      { _id: payment._id, status: "pending" },
      { $set: { status: "failed" } },
    );
  }

  res.json({
    success: true,
    paymentStatus: paymentData.status,
    paymentType: payment.purpose,
  });
});
