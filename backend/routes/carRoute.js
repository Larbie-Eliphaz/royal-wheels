import express from "express";
import { createCar, getCars, getAllCars, getCarById, getVendorCars, updateCar, deleteCar, approveCar, markCarAsSold, markCarAsAvailable} from "../controllers/carController.js";
import { protect, vendor, admin,} from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const carRouter = express.Router();

// PUBLIC ROUTES
carRouter.get("/", getCars);
carRouter.get("/admin/all-cars", protect, admin, getAllCars);
carRouter.get("/:id", getCarById);

// VENDOR ROUTES
carRouter.post("/create", protect, vendor, upload.array("images", 10), createCar);

carRouter.get("/vendor/my-cars", protect, vendor, getVendorCars);

carRouter.put("/:id", protect, vendor, updateCar);

carRouter.delete( "/:id", protect, vendor, deleteCar);

// ADMIN ROUTES
carRouter.put("/admin/approve/:id",protect, admin, approveCar);
carRouter.put("/admin/mark-is-sold/:id", protect, admin, markCarAsSold);
carRouter.put("/admin/mark-is-available/:id", protect, admin, markCarAsAvailable);

export default carRouter;