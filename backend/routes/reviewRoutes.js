import express from "express";
import {
  createReview,
  getPublicReviews,
} from "../controllers/reviewController.js";

const reviewRouter = express.Router();

reviewRouter.get("/", getPublicReviews);
reviewRouter.post("/", createReview);

export default reviewRouter;
