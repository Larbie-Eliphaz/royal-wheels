import { Link, useParams,} from "react-router-dom";
import { useEffect, useState,} from "react";
import API from "../../api/axios";

const CarDetailsPage = () => {
  const { id } = useParams();
  const [car, setCar] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // FETCH CAR
  useEffect(() => {
    const fetchCar = async () => {
      const { data } = await API.get(`/cars/${id}`);
      setCar(data);
      setSelectedImageIndex(0);
    };

    fetchCar();
  }, [id]);

  if (!car) {
    return (
      <div className="p-10">
        Loading...
      </div>
    );
  }

  const images = Array.isArray(car.images) ? car.images.filter(Boolean) : [];
  const selectedImage = images[selectedImageIndex] || images[0];

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 grid lg:grid-cols-2 gap-10">
      <div>
        {selectedImage ? (
          <img
            src={selectedImage}
            alt={`${car.title} - image ${selectedImageIndex + 1}`}
            className="aspect-[4/3] w-full rounded-3xl bg-slate-100 object-cover"
          />
        ) : (
          <div
            role="img"
            aria-label={`No images available for ${car.title}`}
            className="flex aspect-[4/3] w-full items-center justify-center rounded-3xl bg-slate-100 text-slate-500"
          >
            No images available
          </div>
        )}

        {images.length > 1 && (
          <div
            aria-label="Car images"
            className="mt-4 grid grid-cols-4 gap-3 sm:grid-cols-5"
          >
            {images.map((image, index) => (
              <button
                key={`${image}-${index}`}
                type="button"
                onClick={() => setSelectedImageIndex(index)}
                aria-label={`Show image ${index + 1} of ${images.length}`}
                aria-pressed={selectedImageIndex === index}
                className={`overflow-hidden rounded-xl border-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 ${
                  selectedImageIndex === index
                    ? "border-orange-500"
                    : "border-transparent hover:border-slate-300"
                }`}
              >
                <img
                  src={image}
                  alt=""
                  className="aspect-[4/3] w-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      <div>
        <h1 className="text-5xl font-bold">
          {car.title}
        </h1>
        <p className="text-gray-500 mt-3">
          {car.brand} • {car.model}
        </p>
        <h2 className="text-4xl font-bold mt-6 text-orange-500">
          GH₵ {car.price}
        </h2>
        <p className="mt-6 leading-7 text-gray-700">
          {car.description}
        </p>

        <div className="mt-8 flex gap-4">
          {/* <button className="bg-orange-500 text-white px-8 py-3 rounded-xl">
            Buy Now
          </button>
          <button className="border border-slate-900 px-8 py-3 rounded-xl">
            Rent Car
          </button> */}
          <Link
            to={`/checkout/car/${car._id}`}
            className="inline-block bg-orange-500 text-white px-8 py-3 rounded-xl"
          >
            Book Now
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CarDetailsPage;