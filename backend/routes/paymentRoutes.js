import express from "express";

import {
    getAllPayments,
    initializePayment,
    initializeVendorSubscription,
    verifyPayment,
} from "../controllers/paymentController.js";

import { admin, protect, vendor } from "../middleware/authMiddleware.js";

const paymentRouter = express.Router();

paymentRouter.get("/all", protect, admin, getAllPayments);
paymentRouter.post("/initialize", protect, initializePayment);
paymentRouter.post("/subscription/initialize", protect, vendor, initializeVendorSubscription);

paymentRouter.get("/verify/:reference", protect, verifyPayment);

export default paymentRouter;