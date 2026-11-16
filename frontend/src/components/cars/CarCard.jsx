import { Link } from "react-router-dom";

import {
  FaMapMarkerAlt,
  FaGasPump,
} from "react-icons/fa";

const CarCard = ({ car }) => {
  return (
    <div className="w-full max-w-[400px] mx-auto bg-white rounded-2xl overflow-hidden shadow hover:shadow-xl transition">

      <img
        src={car.images?.[0]}
        alt={car.title}
        className="h-56 w-full object-cover"
      />

      <div className="p-5">

        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-xl font-bold">
              {car.title}
            </h2>

            <p className="text-gray-500">
              {car.brand} • {car.year}
            </p>
          </div>

          <span className="bg-orange-100 text-orange-600 text-sm px-3 py-1 rounded-full">
            {car.type}
          </span>
        </div>

        <div className="flex items-center gap-4 text-gray-500 text-sm mt-4">

          <div className="flex items-center gap-1">
            <FaGasPump />
            {car.fuelType}
          </div>

          <div className="flex items-center gap-1">
            <FaMapMarkerAlt />
            {car.location}
          </div>
        </div>

        <div className="mt-5 flex justify-between items-center">

          <div>
            <h3 className="text-2xl font-bold text-slate-800">
              GH₵ {car.price}
            </h3>

            {car.rentalPrice && (
              <p className="text-sm text-gray-500">
                GH₵ {car.rentalPrice}/day
              </p>
            )}
          </div>

          <Link
            to={`/cars/${car._id}`}
            className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2 rounded-xl"
          >
            View
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CarCard;