import Car from "../models/carModel.js";
import expressAsyncHandler from "express-async-handler";
import cloudinary from "../config/cloudinary.js";
import {unlink} from "node:fs/promises";
import { getVendorCarLimit } from "../config/vendorSubscriptions.js";

const editableCarFields = [
    "title",
    "brand",
    "model",
    "year",
    "price",
    "rentalPrice",
    "type",
    "description",
    "fuelType",
    "transmission",
    "location",
];

const getListingFields = (body) => {
    if (!body || typeof body !== "object" || Array.isArray(body)) return null;
    if (Object.keys(body).some((field) => !editableCarFields.includes(field))) {
        return null;
    }

    return Object.fromEntries(
        Object.entries(body).filter(([field]) => editableCarFields.includes(field)),
    );
};

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// CREATE CAR
export const createCar = expressAsyncHandler(async (req, res) => {
    const files = req.files ?? [];
    const listingFields = getListingFields(req.body);
    if (!listingFields) {
        await Promise.all(files.map((file) => unlink(file.path)));
        res.status(400);
        throw new Error("Only car listing details can be submitted.");
    }

    const carLimit = getVendorCarLimit(req.user);
    if (Number.isFinite(carLimit)) {
        const existingCarCount = await Car.countDocuments({owner: req.user._id});
        if (existingCarCount >= carLimit) {
            await Promise.all(files.map((file) => unlink(file.path)));
            res.status(403);
            throw new Error(
                carLimit === 3
                    ? "Free vendors can upload up to 3 cars. Subscribe to a plan to upload more."
                    : `Your ${req.user.vendorPlan || req.user.plan} plan allows up to ${carLimit} cars.`,
            );
        }
    }

    const images = [];

    try {
        for (const file of files) {
            const result = await cloudinary.uploader.upload(file.path, {
                folder: "car-marketplace",
            });
            images.push(result.secure_url);
        }

        const car = await Car.create({
            ...listingFields,
            ...(files.length > 0 && {images}),
            owner: req.user._id,
        });

        res.status(201).json(car);
    } finally {
        await Promise.all(files.map((file) => unlink(file.path)));
    }
});

// GET ALL APPROVED CARS (PUBLIC)
export const getCars = expressAsyncHandler(async (req, res) => {
        const {
            keyword,
            brand,
            type,
            transmission,
            fuelType,
            location,
            minPrice,
            maxPrice,
            sort,
            page = "1",
            limit = "10",
        } = req.query;

        const pageNumber = Number(page);
        const limitNumber = Number(limit);
        if (
            !Number.isInteger(pageNumber) ||
            pageNumber < 1 ||
            !Number.isInteger(limitNumber) ||
            limitNumber < 1 ||
            limitNumber > 100
        ) {
            res.status(400);
            throw new Error("Page must be positive and limit must be between 1 and 100.");
        }

        const parsedMinPrice =
            minPrice === undefined || minPrice === "" ? null : Number(minPrice);
        const parsedMaxPrice =
            maxPrice === undefined || maxPrice === "" ? null : Number(maxPrice);
        if (
            (parsedMinPrice !== null &&
                (!Number.isFinite(parsedMinPrice) || parsedMinPrice < 0)) ||
            (parsedMaxPrice !== null &&
                (!Number.isFinite(parsedMaxPrice) || parsedMaxPrice < 0)) ||
            (parsedMinPrice !== null &&
                parsedMaxPrice !== null &&
                parsedMinPrice > parsedMaxPrice)
        ) {
            res.status(400);
            throw new Error("Provide a valid price range.");
        }

        // FILTER OBJECT
        const filter = {
            isApproved: true,
            availability: true,
            isSold: false,
        };

        // SEARCH KEYWORD
        if (typeof keyword === "string" && keyword.trim()) {
            const keywordPattern = escapeRegExp(keyword.trim());
            filter.$or = [
                {
                    title: {
                        $regex: keywordPattern,
                        $options: "i",
                    },
                },
                {
                    brand: {
                        $regex: keywordPattern,
                        $options: "i",
                    },
                },
                {
                    model: {
                        $regex: keywordPattern,
                        $options: "i",
                    },
                },
            ];
        }

        // BRAND FILTER
        if (typeof brand === "string" && brand.trim()) {
            filter.brand = brand;
        }

        // TYPE FILTER
        if (typeof type === "string" && type.trim()) {
            filter.type = type;
        }

        // TRANSMISSION FILTER
        if (typeof transmission === "string" && transmission.trim()) {
            filter.transmission = transmission;
        }

        // FUEL FILTER
        if (typeof fuelType === "string" && fuelType.trim()) {
            filter.fuelType = fuelType;
        }

        // LOCATION FILTER
        if (typeof location === "string" && location.trim()) {
            filter.location = {
                $regex: escapeRegExp(location.trim()),
                $options: "i",
            };
        }

        // PRICE FILTER
        if (parsedMinPrice !== null || parsedMaxPrice !== null) {
            filter.price = {};

            if (parsedMinPrice !== null) {
                filter.price.$gte = parsedMinPrice;
            }

            if (parsedMaxPrice !== null) {
                filter.price.$lte = parsedMaxPrice;
            }
        }

        // SORTING
        let sortOption = {};
        switch (sort) {
            case "price_asc":
                sortOption.price = 1;
                break;

            case "price_desc":
                sortOption.price = -1;
                break;

            case "newest":
                sortOption.createdAt = -1;
                break;

            default:
                sortOption.createdAt = -1;
        }

        // PAGINATION
        const skip = (pageNumber - 1) * limitNumber;

        // FETCH CARS
        const cars = await Car.find(filter).sort(sortOption).skip(skip).limit(limitNumber);

        // TOTAL COUNT
        const totalCars = await Car.countDocuments(filter);

        res.json({
            success: true,
            pagination: {
                currentPage: pageNumber,
                totalPages: Math.ceil(totalCars / limitNumber),
                totalCars,
            },
            cars,
        });
    }
);

// GET ALL CARS (ADMIN)
export const getAllCars = expressAsyncHandler(async (req, res) => {
    const cars = await Car.find({})
        .populate("owner", "name email")
        .sort({createdAt: -1})
        .lean();

    res.json({success: true, cars});
});

// GET SINGLE CAR
export const getCarById = expressAsyncHandler(async (req, res) => {
    const car = await Car.findOne({
        _id: req.params.id,
        isApproved: true,
        availability: true,
        isSold: false,
    }).populate("owner", "name email");

    if (!car) {
        return res.status(404).json({
            message: "Car not found",
        });
    }

    res.json(car);
});

// GET VENDOR CARS
export const getVendorCars = expressAsyncHandler(async (req, res) => {
    try {
        const cars = await Car.find({
            owner: req.user._id,
        });

        res.json(cars);
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
});

// UPDATE CAR
export const updateCar = expressAsyncHandler(async (req, res) => {
    const listingFields = getListingFields(req.body);
    if (!listingFields || Object.keys(listingFields).length === 0) {
        return res.status(400).json({
            message: "Provide car listing details only; status and ownership are managed separately.",
        });
    }

    try {
        const car = await Car.findById(req.params.id);

        if (!car) {
            return res.status(404).json({
                message: "Car not found",
            });
        }

        // Ensure vendor owns the car
        if (car.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                message: "Unauthorized",
            });
        }

        Object.assign(car, listingFields);

        const updatedCar = await car.save();

        res.json(updatedCar);
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
});

// DELETE CAR
export const deleteCar = expressAsyncHandler(async (req, res) => {
    try {
        const car = await Car.findById(req.params.id);

        if (!car) {
            return res.status(404).json({
                message: "Car not found",
            });
        }

        if (car.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                message: "Unauthorized",
            });
        }

        await car.deleteOne();

        res.json({
            message: "Car deleted",
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
});

// ADMIN APPROVE CAR
export const approveCar = expressAsyncHandler(async (req, res) => {
    try {
        const car = await Car.findById(req.params.id);

        if (!car) {
            return res.status(404).json({message: "Car not found"});
        }

        car.isApproved = true;

        await car.save();

        res.json({
            message: "Car approved",
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
});

// ADMIN MARK CAR AS SOLD
export const markCarAsSold = expressAsyncHandler(async (req, res) => {
    try {
        const car = await Car.findById(req.params.id);
        if (!car) {
            return res.status(404).json({message: "Car not found"});
        }
        car.isSold = true;
        car.availability = false;
        await car.save();

        res.json({message: "Car status updated"});
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
});

// ADMIN MARK CAR AS AVAILABLE
export const markCarAsAvailable = expressAsyncHandler(async (req, res) => {
    try {
        const car = await Car.findById(req.params.id);

        if (!car) {
            return res.status(404).json({message: "Car not found"});
        }

        car.isSold = false;
        car.availability = true;
        await car.save();

        res.json({message: "Car status updated"});
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
});
