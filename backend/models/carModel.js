import mongoose from "mongoose";

const carSchema = new mongoose.Schema(
  {
    title: String,
    brand: String,
    model: String,
    year: Number,
    price: Number,
    rentalPrice: Number,
    type: {
      type: String,
      enum: ["sale", "rent", "both"],
    },
    images: [String],
    description: String,
    fuelType: String,
    transmission: String,
    location: String,
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", },
    isApproved: { type: Boolean, default: false },
    availability: { type: Boolean, default: true, },
    isSold: { type: Boolean, default: false, },
  },

  { timestamps: true }
);

carSchema.index({
  brand: 1,
  model: 1,
  price: 1,
  location: 1,
});

const Car = mongoose.model("Car", carSchema);
export default Car;