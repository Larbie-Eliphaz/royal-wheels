import express from "express";
import {
  createComplaint,
  getAllComplaints,
} from "../controllers/complaintController.js";
import { admin, protect } from "../middleware/authMiddleware.js";

const complaintRouter = express.Router();

complaintRouter.post("/", createComplaint);
complaintRouter.get("/admin", protect, admin, getAllComplaints);

export default complaintRouter;
