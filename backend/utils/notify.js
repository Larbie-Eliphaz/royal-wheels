import Notification from "../models/notificationModel.js";

const sendNotification = async ({ io, recipient, sender, title, message, type,}) => {
  // SAVE TO DATABASE
  const notification = await Notification.create({
    recipient,
    sender,
    title,
    message,
    type,
  });

  // REAL-TIME EMIT
  io.to(recipient.toString()).emit("newNotification", notification);

  return notification;
};

export default sendNotification;
