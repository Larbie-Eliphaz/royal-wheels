import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import expressAsyncHandler from "express-async-handler";
import RevokedToken from "../models/revokedTokenModel.js";
import {
    getSubscriptionDaysRemaining,
    getSubscriptionStatus,
} from "../config/vendorSubscriptions.js";

// Generate token
const generateToken = (id) => {
    return jwt.sign({id}, process.env.JWT_SECRET, {
        expiresIn: "1h",
    });
};

// Register
export const registerUser = expressAsyncHandler(async (req, res) => {
    const {name, email, password, phone} = req.body;
    const role = req.body.role || "customer";

    if (!["customer", "vendor"].includes(role)) {
        return res.status(400).json({message: "Choose a valid account type."});
    }

    const userExists = await User.findOne({email});
    if (userExists) {
        return res.status(400).json({message: "User already exists"});
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
        name,
        email,
        password: hashedPassword,
        role,
        phone,
    });

    res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        subscriptionStatus: user.subscriptionStatus,
        subscriptionStartedAt: user.subscriptionStartedAt,
        subscriptionExpiresAt: user.subscriptionExpiresAt,
        subscriptionDaysRemaining: getSubscriptionDaysRemaining(user),
        token: generateToken(user._id),
    });
});

// Login
export const loginUser = expressAsyncHandler(async (req, res) => {
    const {email, password} = req.body;

    const user = await User.findOne({email});

    if (user && (await bcrypt.compare(password, user.password))) {
        res.json({
            _id: user._id,
            name: user.name,
            role: user.role,
            plan: user.plan,
            vendorPlan: user.vendorPlan,
            subscriptionStatus: getSubscriptionStatus(user),
            subscriptionStartedAt: user.subscriptionStartedAt,
            subscriptionExpiresAt: user.subscriptionExpiresAt,
            subscriptionDaysRemaining: getSubscriptionDaysRemaining(user),
            token: generateToken(user._id),
        });
    } else {
        res.status(401).json({message: "Invalid credentials"});
    }
});

// Logout
export const logoutUser = expressAsyncHandler(async (req, res) => {
    await RevokedToken.create(req.authToken);
    res.json({message: "Logged out successfully"});
});
