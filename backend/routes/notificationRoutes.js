import express from "express";
import { getNotifications, markAsRead,} from "../controllers/notificationController.js";
import { protect } from "../middleware/authMiddleware.js";

const NotificationRouter = express.Router();

NotificationRouter.get("/", protect, getNotifications);

NotificationRouter.put("/:id/read", protect, markAsRead);

export default NotificationRouter;