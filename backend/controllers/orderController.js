import expressAsyncHandler from "express-async-handler";
import Order from "../models/orderModel.js";
import Payment from "../models/paymentModel.js";
import Car from "../models/carModel.js";
import sendNotification from "../utils/notify.js";
import {
    ADD_ON_CURRENCY,
    CHECKOUT_ADD_ONS,
    resolveCheckoutAddOns,
} from "../config/monetization.js";

const findConflictingRental = ({
                                   carId,
                                   startDate,
                                   endDate,
                                   excludeOrderId,
                                   includePending = true,
                               }) =>
    Order.findOne({
        car: carId,
        orderType: "rent",
        orderStatus: {
            $in: includePending ? ["pending", "approved", "active"] : ["approved", "active"],
        },
        ...(excludeOrderId ? {_id: {$ne: excludeOrderId}} : {}),
        startDate: {$lte: endDate},
        endDate: {$gte: startDate},
    });

const assertNoRentalConflict = async ({
                                          carId,
                                          startDate,
                                          endDate,
                                          excludeOrderId,
                                          includePending,
                                          res,
                                      }) => {
    const conflictingOrder = await findConflictingRental({
        carId,
        startDate,
        endDate,
        excludeOrderId,
        includePending,
    });

    if (conflictingOrder) {
        res.status(400);
        throw new Error("Car unavailable for selected dates.");
    }
};

// PUBLIC CHECKOUT ADD-ON CATALOG
export const getCheckoutAddOns = (_req, res) => {
    res.json({currency: ADD_ON_CURRENCY, addOns: CHECKOUT_ADD_ONS});
};

// GET ALL ORDERS (ADMIN ONLY)
export const getAllOrders = expressAsyncHandler(async (req, res) => {
    const orders = await Order.find({})
        .select(
            "paymentStatus orderStatus orderType amount baseAmount addOns startDate endDate totalDays createdAt car customer vendor",
        )
        .populate("car", "title brand model year")
        .populate("customer", "name")
        .populate("vendor", "name")
        .lean();

    res.status(200).json({orders});
});

// CREATE ORDER
export const createOrder = expressAsyncHandler(async (req, res) => {
    const {carId, orderType, startDate, endDate} = req.body;
    const addOns = resolveCheckoutAddOns(req.body);

    // FIND CAR
    const car = await Car.findById(carId);

    if (!car) {
        res.status(404);
        throw new Error("Car not found");
    }

    // CHECK APPROVAL
    if (!car.isApproved) {
        res.status(400);
        throw new Error("Car not approved");
    }

    // CHECK SOLD
    if (car.isSold) {
        res.status(400);
        throw new Error("Car already sold");
    }

    if (!car.availability) {
        res.status(400);
        throw new Error("Car is currently unavailable.");
    }

    if (!["buy", "rent"].includes(orderType)) {
        res.status(400);
        throw new Error("Choose a valid order type.");
    }

    if (
        (orderType === "buy" && car.type === "rent") ||
        (orderType === "rent" && car.type === "sale")
    ) {
        res.status(400);
        throw new Error("Order type does not match the car listing.");
    }

    if (!car.owner) {
        res.status(400);
        throw new Error("Car owner is unavailable.");
    }

    // RENTAL LOGIC
    let amount = orderType === "buy" ? car.price : car.rentalPrice;
    let totalDays = null;

    if (orderType === "rent") {
        if (!startDate || !endDate) {
            res.status(400);
            throw new Error("Rental dates required");
        }

        const start = new Date(startDate);
        const end = new Date(endDate);

        if (
            Number.isNaN(start.getTime()) ||
            Number.isNaN(end.getTime()) ||
            end <= start
        ) {
            res.status(400);
            throw new Error("Rental end date must be later than the start date.");
        }

        await assertNoRentalConflict({
            carId: car._id,
            startDate: start,
            endDate: end,
            res,
        });

        totalDays = (end - start) / (1000 * 60 * 60 * 24);
        amount = totalDays * car.rentalPrice;
    }

    const baseAmount = amount;
    if (!Number.isFinite(baseAmount) || baseAmount <= 0) {
        res.status(400);
        throw new Error("The car price must be greater than zero.");
    }

    const addOnTotal = addOns.reduce((total, addOn) => total + addOn.price, 0);
    amount += addOnTotal;

    if (!Number.isFinite(amount) || amount <= 0) {
        res.status(400);
        throw new Error("The car price must be greater than zero.");
    }

    // CREATE ORDER
    const order = await Order.create({
        customer: req.user._id,
        vendor: car.owner,
        car: car._id,
        orderType,
        amount,
        baseAmount,
        addOns,
        startDate,
        endDate,
        totalDays,
    });
    // Notify
    const io = req.app.get("io");
    await sendNotification({
        io,
        recipient: car.owner,
        sender: req.user._id,
        title: "New Order Request",
        message: "A customer placed an order on your car.",
        type: "order",
    });

    res.status(201).json({success: true, order});
});

// CUSTOMER ORDERS
export const getMyOrders = expressAsyncHandler(async (req, res) => {
    const orders = await Order.find({customer: req.user._id})
        .populate("car")
        .populate("vendor", "name");
    res.json({success: true, orders});
});

// GET CUSTOMER ORDER BY ID
export const getMyOrderById = expressAsyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id)
        .populate("car")
        .populate("vendor", "name")
        .lean();

    if (!order) {
        res.status(404);
        throw new Error("Order not found.");
    }

    if (order.customer.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error("Unauthorized.");
    }

    res.json({success: true, order});
});

// VENDOR ORDERS
export const getVendorOrders = expressAsyncHandler(async (req, res) => {
    const orders = await Order.find({vendor: req.user._id})
        .sort({createdAt: -1})
        .populate("car", "title brand model year")
        .populate("customer", "name email")
        .lean();
    res.json({success: true, orders});
});

// APPROVE ORDER
export const approveOrder = expressAsyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id).populate("car");

    if (!order) {
        res.status(404);
        throw new Error("Order not found");
    }

    // ENSURE VENDOR OWNS CAR
    if (order.vendor.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error("Unauthorized");
    }

    if (order.paymentStatus !== "paid") {
        res.status(400);
        throw new Error("Order cannot be approved until payment is confirmed.");
    }

    if (order.orderStatus !== "pending") {
        res.status(400);
        throw new Error("Only pending orders can be approved.");
    }

    if (order.orderType === "rent") {
        await assertNoRentalConflict({
            carId: order.car._id,
            startDate: order.startDate,
            endDate: order.endDate,
            excludeOrderId: order._id,
            includePending: false,
            res,
        });
    }

    order.orderStatus = "approved";

    // IF BUY ORDER
    if (order.orderType === "buy") {
        order.car.isSold = true;
        order.car.availability = false;

        await order.car.save();
    }

    await order.save();

    // Notify
    const io = req.app.get("io");
    await sendNotification({
        io,
        recipient: order.customer,
        sender: req.user._id,
        title: "Order Approved",
        message: "Your order has been approved.",
        type: "order",
    });

    res.json({success: true, message: "Order approved"});
});

// ADMIN APPROVES A PAID ORDER
export const adminApproveOrder = expressAsyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id).populate("car");

    if (!order) {
        res.status(404);
        throw new Error("Order not found.");
    }

    if (order.paymentStatus !== "paid") {
        res.status(400);
        throw new Error("Order cannot be approved until payment is confirmed.");
    }

    if (order.orderStatus !== "pending") {
        res.status(400);
        throw new Error("Only pending orders can be approved.");
    }

    if (order.orderType === "rent") {
        await assertNoRentalConflict({
            carId: order.car._id,
            startDate: order.startDate,
            endDate: order.endDate,
            excludeOrderId: order._id,
            includePending: false,
            res,
        });
    }

    order.orderStatus = "approved";

    if (order.orderType === "buy") {
        order.car.isSold = true;
        order.car.availability = false;
        await order.car.save();
    }

    await order.save();

    await sendNotification({
        io: req.app.get("io"),
        recipient: order.customer,
        sender: req.user._id,
        title: "Order Approved",
        message: "Your order has been approved.",
        type: "order",
    });

    res.json({success: true, message: "Order approved."});
});

// CANCEL ORDER
export const cancelOrder = expressAsyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (!order) {
        res.status(404);
        throw new Error("Order not found");
    }

    // ENSURE CUSTOMER OWNS ORDER
    if (order.customer.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error("Unauthorized");
    }

    if (order.orderStatus !== "pending") {
        res.status(400);
        throw new Error("Only pending orders can be cancelled.");
    }

    if (order.paymentStatus === "paid") {
        res.status(400);
        throw new Error("Paid orders cannot be cancelled here. Contact support to request a refund.");
    }

    const pendingPayment = await Payment.exists({
        order: order._id,
        status: "pending",
    });
    if (pendingPayment) {
        res.status(400);
        throw new Error("A payment is in progress. Verify its status before cancelling the order.");
    }

    order.orderStatus = "cancelled";

    await order.save();

    res.json({success: true, message: "Order cancelled"});
});
