import cloudinary from "../config/cloudinary.js";
import fs from "fs";

export const uploadImages = async (req, res) => {
    try {
        console.log("Cloudinary Config:", cloudinary.config());
        const uploadedImages = [];

        for (const file of req.files) {
            const result = await cloudinary.uploader.upload(
                file.path,
                { folder: "car-marketplace", }
            );

            uploadedImages.push(result.secure_url);

            // Delete temp file
            fs.unlinkSync(file.path);
        }

        res.json(uploadedImages);
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};