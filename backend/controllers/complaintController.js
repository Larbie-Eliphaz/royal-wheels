import expressAsyncHandler from "express-async-handler";
import Complaint from "../models/complaintModel.js";

const isValidEmail = (email) =>
  typeof email === "string" &&
  email.length <= 254 &&
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const createComplaint = expressAsyncHandler(async (req, res) => {
  const { name = "", email, subject, message } = req.body ?? {};

  if (
    typeof name !== "string" ||
    name.trim().length > 100 ||
    !isValidEmail(email) ||
    typeof subject !== "string" ||
    subject.trim().length < 3 ||
    subject.trim().length > 120 ||
    typeof message !== "string" ||
    message.trim().length < 10 ||
    message.trim().length > 5000
  ) {
    return res.status(400).json({
      message:
        "Provide a valid email, a subject between 3 and 120 characters, and complaint details between 10 and 5000 characters.",
    });
  }

  const complaint = await Complaint.create({
    name: name.trim(),
    email: email.trim().toLowerCase(),
    subject: subject.trim(),
    message: message.trim(),
  });

  res.status(201).json({
    message: "Your complaint has been submitted.",
    complaint: { id: complaint._id, createdAt: complaint.createdAt },
  });
});

export const getAllComplaints = expressAsyncHandler(async (_req, res) => {
  const complaints = await Complaint.find({})
    .sort({ createdAt: -1 })
    .lean();

  res.json({ complaints });
});
