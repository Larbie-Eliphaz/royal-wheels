import express from "express";
import {
  createOrder,
  getMyOrders,
  getMyOrderById,
  getVendorOrders,
  approveOrder,
  adminApproveOrder,
  cancelOrder,
  getAllOrders,
  getCheckoutAddOns,
} from "../controllers/orderController.js";
import { protect, vendor, admin } from "../middleware/authMiddleware.js";
import orderModel from "../models/orderModel.js";

const orderRouter = express.Router();

orderRouter.get("/add-ons", getCheckoutAddOns);

// CUSTOMER
orderRouter.post("/create", protect, createOrder);

orderRouter.get("/my-orders", protect, getMyOrders);

orderRouter.put("/cancel/:id", protect, cancelOrder);

orderRouter.get("/my-orders/:id", protect, getMyOrderById);

// VENDOR
orderRouter.get("/vendor", protect, vendor, getVendorOrders);

orderRouter.put("/approve/:id", protect, vendor, approveOrder);

//GET ALL ORDERS (ADMIN ONLY)
orderRouter.get("/all-orders", protect, admin, getAllOrders);
orderRouter.put("/admin/approve/:id", protect, admin, adminApproveOrder);
orderRouter.get("/:id", protect, getMyOrderById);

export default orderRouter;
