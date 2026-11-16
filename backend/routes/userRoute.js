import express from "express";
import {
  getMyProfile,
  updateMyProfile,
  getAllUsers,
  updateUserStatus,
} from "../controllers/userController.js";
import { admin, protect } from "../middleware/authMiddleware.js";

const userRouter = express.Router();

userRouter.get("/profile", protect, getMyProfile);
userRouter.patch("/profile", protect, updateMyProfile);
userRouter.get("/all-users", protect, admin, getAllUsers);
userRouter.patch("/:id/status", protect, admin, updateUserStatus);

export default userRouter;
