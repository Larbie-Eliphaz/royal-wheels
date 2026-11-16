import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import authRouter from "./routes/authRoute.js";
import carRouter from "./routes/carRoute.js";
import uploadRoute from "./routes/uploadRoute.js"
import {errorHandler, notFound} from "./middleware/errorHandlerMiddlware.js";
import orderRouter from "./routes/orderRoutes.js";
import paymentRouter from "./routes/paymentRoutes.js";
import NotificationRouter from "./routes/notificationRoutes.js";
import userRouter from "./routes/userRoute.js";
import complaintRouter from "./routes/complaintRoutes.js";
import reviewRouter from "./routes/reviewRoutes.js";

import http from "http";
import {Server} from "socket.io";
import jwt from "jsonwebtoken";
import {createHash} from "node:crypto";
import User from "./models/userModel.js";
import RevokedToken from "./models/revokedTokenModel.js";


// Security
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import mongoSanitize from "express-mongo-sanitize";
import xss from "xss-clean";
import hpp from "hpp";

dotenv.config();
connectDB();
const PORT = process.env.PORT || 4400;
const app = express();

// socket.io server creation
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"],
        credentials: true
    },
});

io.use(async (socket, next) => {
    const token = socket.handshake.auth?.token;
    if (typeof token !== "string") {
        return next(new Error("Not authorized"));
    }

    let decoded;
    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
        return next(new Error("Not authorized"));
    }

    if (
        typeof decoded !== "object" ||
        !decoded ||
        typeof decoded.id !== "string" ||
        typeof decoded.exp !== "number"
    ) {
        return next(new Error("Not authorized"));
    }

    try {
        const tokenHash = createHash("sha256").update(token).digest("hex");
        const [revokedToken, user] = await Promise.all([
            RevokedToken.exists({tokenHash}),
            User.findById(decoded.id).select("_id"),
        ]);

        if (revokedToken || !user) {
            return next(new Error("Not authorized"));
        }

        socket.data.userId = user._id.toString();
        return next();
    } catch (error) {
        return next(error);
    }
});

io.on("connection", (socket) => {
    console.log("User connected:", socket.id);
    socket.join(socket.data.userId);

    // DISCONNECT
    socket.on("disconnect", () => {
        console.log("User disconnected");
    });
});

// console.log("CLOUD_API_KEY:", process.env.CLOUD_API_KEY);
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000,
    message:
        "Too many requests from this IP. Please try again later.",
});
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: "Too many login attempts. Please try again later.",
});

app.use(helmet());
app.use(cors({
    origin: "http://localhost:5173",
    methods: ["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true
}));
app.use(express.json({limit: "10kb",}));
app.use(express.urlencoded({extended: true}));
// app.use(mongoSanitize());
// app.use(xss());
app.use(hpp());
app.use(apiLimiter);


app.get("/", (req, res) => {
    res.send("API is running...");
});

app.use('/api/auth/login', loginLimiter);
app.use('/api/auth', authRouter);
app.use('/api/cars', carRouter);
app.use('/api/upload', uploadRoute)
app.use("/api/orders", orderRouter);
app.use("/api/payment", paymentRouter)
app.use("/api/users", userRouter);
app.use("/api/notifications", NotificationRouter);
app.use("/api/complaints", complaintRouter);
app.use("/api/reviews", reviewRouter);

app.set("io", io);

app.use(notFound);
app.use(errorHandler);


server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
export {io};
// app.listen(PORT, () => {
//   console.log(`Server running on port http://localhost:${PORT}`);
// });