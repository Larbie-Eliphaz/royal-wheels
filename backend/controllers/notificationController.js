import expressAsyncHandler from "express-async-handler";
import Notification from "../models/notificationModel.js";

// GET MY NOTIFICATIONS
export const getNotifications = expressAsyncHandler(async (req, res) => {
    const notifications = await Notification.find({recipient: req.user._id,}).sort({createdAt: -1,});

    res.json({success: true, notifications,});
});

// MARK AS READ
export const markAsRead = expressAsyncHandler(async (req, res) => {
    const notification = await Notification.findOne({
        _id: req.params.id,
        recipient: req.user._id,
    });

    if (!notification) {
        res.status(404);
        throw new Error("Notification not found");
    }

    notification.isRead = true;
    await notification.save();

    res.json({success: true,});
});