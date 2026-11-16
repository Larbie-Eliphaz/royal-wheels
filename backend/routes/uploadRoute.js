import express from "express";
import upload from "../middleware/uploadMiddleware.js";
import { uploadImages } from "../controllers/uploadController.js";

import { protect, vendor,} from "../middleware/authMiddleware.js";

const uploadRouter = express.Router();

uploadRouter.post("/", protect, vendor, upload.array("images", 10), uploadImages);

export default uploadRouter;