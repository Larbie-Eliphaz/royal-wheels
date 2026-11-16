import jwt from "jsonwebtoken";
import { createHash } from "node:crypto";
import User from "../models/userModel.js";
import RevokedToken from "../models/revokedTokenModel.js";

export const protect = async (req, res, next) => {
  const authorization = req.headers.authorization;

  if (!authorization?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token" });
  }

  const token = authorization.slice("Bearer ".length);
  let decoded;

  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return res.status(401).json({ message: "Not authorized" });
  }

  if (typeof decoded !== "object" || !decoded || typeof decoded.id !== "string" || typeof decoded.exp !== "number") {
    return res.status(401).json({ message: "Not authorized" });
  }

  const tokenHash = createHash("sha256").update(token).digest("hex");
  const revokedToken = await RevokedToken.exists({ tokenHash });

  if (revokedToken) {
    return res.status(401).json({ message: "Not authorized" });
  }

  req.user = await User.findById(decoded.id).select("-password");
  if (!req.user) {
    return res.status(401).json({ message: "Not authorized" });
  }

  req.authToken = {
    tokenHash,
    expiresAt: new Date(decoded.exp * 1000),
  };
  next();
};

// Admin only
export const admin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({ message: "Admin only" });
  }
};

// Vendor only
export const vendor = (req, res, next) => {
  if (req.user && req.user.role === "vendor") {
    next();
  } else {
    res.status(403).json({ message: "Vendor only" });
  }
};