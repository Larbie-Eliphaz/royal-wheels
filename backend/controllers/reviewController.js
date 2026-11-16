import expressAsyncHandler from "express-async-handler";
import Review from "../models/reviewModel.js";

export const createReview = expressAsyncHandler(async (req, res) => {
  const { name, location = "", rating, message } = req.body ?? {};

  if (
    typeof name !== "string" ||
    name.trim().length < 2 ||
    name.trim().length > 80 ||
    typeof location !== "string" ||
    location.trim().length > 80 ||
    !Number.isInteger(rating) ||
    rating < 1 ||
    rating > 5 ||
    typeof message !== "string" ||
    message.trim().length < 10 ||
    message.trim().length > 1000
  ) {
    return res.status(400).json({
      message:
        "Provide a name, a rating from 1 to 5, and a review between 10 and 1000 characters.",
    });
  }

  const review = await Review.create({
    name: name.trim(),
    location: location.trim(),
    rating,
    message: message.trim(),
  });

  res.status(201).json({
    message: "Thank you for sharing your review.",
    review,
  });
});

export const getPublicReviews = expressAsyncHandler(async (_req, res) => {
  const reviews = await Review.find({})
    .select("name location rating message createdAt")
    .sort({ createdAt: -1 })
    .limit(6)
    .lean();

  res.json({ reviews });
});
