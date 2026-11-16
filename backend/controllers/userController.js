import expressAsyncHandler from "express-async-handler";
import User from "../models/userModel.js";
import {
  getSubscriptionDaysRemaining,
  getSubscriptionStatus,
} from "../config/vendorSubscriptions.js";

// GET CURRENT USER PROFILE
export const getMyProfile = expressAsyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .select(
      "name email phone role plan vendorPlan subscriptionStatus subscriptionStartedAt subscriptionExpiresAt isVerified isApproved createdAt",
    )
    .lean();

  if (!user) {
    return res.status(404).json({ message: "User not found." });
  }

  res.json({
    user: {
      ...user,
      subscriptionStatus:
        user.role === "vendor" ? getSubscriptionStatus(user) : user.subscriptionStatus,
      subscriptionDaysRemaining:
        user.role === "vendor" ? getSubscriptionDaysRemaining(user) : null,
    },
  });
});

// UPDATE CURRENT USER PROFILE
export const updateMyProfile = expressAsyncHandler(async (req, res) => {
  const allowedFields = ["name", "email", "phone"];
  const body =
    req.body && typeof req.body === "object" && !Array.isArray(req.body)
      ? req.body
      : {};
  const fields = Object.keys(body);

  if (
    fields.length === 0 ||
    fields.some((field) => !allowedFields.includes(field)) ||
    Object.values(body).some((value) => typeof value !== "string")
  ) {
    return res.status(400).json({
      message: "Update your name, email, or phone using valid text values.",
    });
  }

  const updates = {};
  if (Object.hasOwn(body, "name")) {
    updates.name = body.name.trim();
    if (updates.name.length < 2 || updates.name.length > 100) {
      return res.status(400).json({
        message: "Name must be between 2 and 100 characters.",
      });
    }
  }

  if (Object.hasOwn(body, "email")) {
    updates.email = body.email.trim().toLowerCase();
    if (
      updates.email.length > 254 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(updates.email)
    ) {
      return res.status(400).json({ message: "Enter a valid email address." });
    }

    const emailInUse = await User.exists({
      email: updates.email,
      _id: { $ne: req.user._id },
    });
    if (emailInUse) {
      return res.status(409).json({
        message: "That email address is already associated with another account.",
      });
    }
  }

  if (Object.hasOwn(body, "phone")) {
    updates.phone = body.phone.trim();
    if (
      updates.phone.length > 20 ||
      (updates.phone &&
        !/^[+]?[0-9][0-9 ()-]{6,19}$/.test(updates.phone))
    ) {
      return res.status(400).json({ message: "Enter a valid phone number." });
    }
  }

  const user = await User.findByIdAndUpdate(req.user._id, updates, {
    new: true,
    runValidators: true,
  }).select(
    "name email phone role plan vendorPlan subscriptionStatus subscriptionStartedAt subscriptionExpiresAt isVerified isApproved createdAt",
  );

  if (!user) {
    return res.status(404).json({ message: "User not found." });
  }

  const profile = user.toObject();
  res.json({
    message: "Profile updated successfully.",
    user: {
      ...profile,
      subscriptionStatus:
        user.role === "vendor" ? getSubscriptionStatus(user) : user.subscriptionStatus,
      subscriptionDaysRemaining:
        user.role === "vendor" ? getSubscriptionDaysRemaining(user) : null,
    },
  });
});

// GET ALL USERS (ADMIN ONLY)
export const getAllUsers = expressAsyncHandler(async (req, res) => {
  const users = await User.find({})
    .select(
      "name email phone role plan vendorPlan subscriptionStatus subscriptionStartedAt subscriptionExpiresAt isVerified isApproved createdAt",
    )
    .sort({ createdAt: -1 })
    .lean();

  res.json({
    users: users.map((user) => ({
      ...user,
      subscriptionStatus:
        user.role === "vendor" ? getSubscriptionStatus(user) : user.subscriptionStatus,
      subscriptionDaysRemaining:
        user.role === "vendor" ? getSubscriptionDaysRemaining(user) : null,
    })),
  });
});

// UPDATE USER VERIFICATION OR APPROVAL (ADMIN ONLY)
export const updateUserStatus = expressAsyncHandler(async (req, res) => {
  const allowedFields = ["isVerified", "isApproved"];
  const body =
    req.body && typeof req.body === "object" && !Array.isArray(req.body)
      ? req.body
      : {};
  const updates = Object.fromEntries(
    Object.entries(body).filter(([field]) => allowedFields.includes(field)),
  );
  const updateFields = Object.keys(updates);

  if (
    updateFields.length === 0 ||
    updateFields.length !== Object.keys(body).length ||
    Object.values(updates).some((value) => typeof value !== "boolean")
  ) {
    return res.status(400).json({
      message: "Provide isVerified or isApproved as a boolean value.",
    });
  }

  const user = await User.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true,
  })
    .select("name email phone role isVerified isApproved createdAt")
    .lean();

  if (!user) {
    return res.status(404).json({ message: "User not found." });
  }

  res.json({ user });
});
