import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FaArrowRight,
  FaChevronLeft,
  FaChevronRight,
  FaCheckCircle,
  FaSearch,
  FaRegStar,
  FaStar,
  FaTag,
} from "react-icons/fa";
import API from "../../api/axios";
import CarCard from "../../components/cars/CarCard";
import CarSkeleton from "../../components/cars/CarSkeleton";

const carImages = [
  {
    src: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1400&q=85",
    alt: "Luxury sports car",
  },
  {
    src: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1400&q=85",
    alt: "Silver sports car on the road",
  },
  {
    src: "https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?auto=format&fit=crop&w=1400&q=85",
    alt: "Modern performance car",
  },
  {
    src: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1400&q=85",
    alt: "Red sports car",
  },
  {
    src: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=1400&q=85",
    alt: "Classic red car",
  },
  {
    src: "https://images.unsplash.com/photo-1506610654-064fbba4780c?auto=format&fit=crop&w=1400&q=85",
    alt: "Luxury car on a scenic drive",
  },
  {
    src: "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1400&q=85",
    alt: "Black luxury sedan",
  },
  {
    src: "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=1400&q=85",
    alt: "Car on a winding road",
  },
];

const HomePage = () => {
  const [activeImage, setActiveImage] = useState(0);
  const [featuredCars, setFeaturedCars] = useState([]);
  const [carsLoading, setCarsLoading] = useState(true);
  const [carsError, setCarsError] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [reviewsError, setReviewsError] = useState(false);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setActiveImage((currentImage) => (currentImage + 1) % carImages.length);
    }, 5000);

    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const fetchFeaturedCars = async () => {
      try {
        const { data } = await API.get("/cars?page=1&sort=newest");
        if (!Array.isArray(data?.cars)) {
          throw new Error("The featured car listings could not be loaded.");
        }
        setFeaturedCars(data.cars.slice(0, 3));
      } catch (error) {
        setCarsError(true);
        if (!error?.globalNotificationShown) {
          console.error("Unable to load featured cars:", error);
        }
      } finally {
        setCarsLoading(false);
      }
    };

    fetchFeaturedCars();
  }, []);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const { data } = await API.get("/reviews", {
          skipGlobalNotifications: true,
        });
        if (!Array.isArray(data?.reviews)) {
          throw new Error("The reviews endpoint did not return a review list.");
        }
        setReviews(data.reviews);
      } catch (error) {
        setReviewsError(true);
        console.error("Unable to load customer reviews:", error);
      } finally {
        setReviewsLoading(false);
      }
    };

    fetchReviews();
  }, []);

  const showPreviousImage = () => {
    setActiveImage(
      (currentImage) =>
        (currentImage - 1 + carImages.length) % carImages.length,
    );
  };

  const showNextImage = () => {
    setActiveImage((currentImage) => (currentImage + 1) % carImages.length);
  };

  return (
    <div className="overflow-hidden bg-white text-slate-900">
      <section className="relative isolate bg-slate-950 text-white">
        <div className="absolute inset-0 -z-10">
          <img
            src={carImages[activeImage].src}
            alt=""
            className="h-full w-full object-cover opacity-25"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/90 to-slate-950/35" />
        </div>

        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-20 sm:px-6 sm:py-24 lg:grid-cols-2 lg:gap-16 lg:px-8 lg:py-28">
          <div className="max-w-2xl">
            <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-orange-200">
              <FaCheckCircle aria-hidden="true" />
              Ghana’s car marketplace
            </p>
            <h1 className="text-5xl font-extrabold leading-tight tracking-tight sm:text-6xl">
              Find a car that
              <span className="hero-title-line hero-title-accent">
                moves you.
              </span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-300">
              Explore cars for sale and rent from vendors across Ghana. Your
              next drive starts with the right choice.
            </p>
            <div className="mt-9 flex flex-wrap gap-4">
              <Link
                to="/cars"
                className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-6 py-3.5 font-semibold text-white shadow-lg shadow-orange-950/20 transition hover:bg-orange-600"
              >
                Explore cars
                <FaArrowRight aria-hidden="true" />
              </Link>
              <Link
                to="/register"
                className="rounded-xl border border-white/30 px-6 py-3.5 font-semibold text-white transition hover:border-white hover:bg-white/10"
              >
                Become a vendor
              </Link>
            </div>
            <div className="mt-10 flex flex-wrap gap-x-7 gap-y-3 text-sm text-slate-300">
              <span className="inline-flex items-center gap-2">
                <FaCheckCircle className="text-orange-400" aria-hidden="true" />
                Cars to buy or rent
              </span>
              <span className="inline-flex items-center gap-2">
                <FaCheckCircle className="text-orange-400" aria-hidden="true" />
                Listings across Ghana
              </span>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                to="/pricing"
                className="inline-flex items-center gap-2 rounded-xl border border-orange-400/60 bg-orange-500/10 px-5 py-3 font-semibold text-orange-100 transition hover:bg-orange-500/20"
              >
                View vendor plans
                <FaArrowRight aria-hidden="true" />
              </Link>
            </div>
          </div>

          <div
            className="relative mx-auto w-full max-w-xl overflow-hidden rounded-3xl border border-white/10 shadow-2xl shadow-black/40"
            role="region"
            aria-roledescription="carousel"
            aria-label="Featured cars"
          >
            <img
              src={carImages[activeImage].src}
              alt={carImages[activeImage].alt}
              className="aspect-[4/3] w-full object-cover"
            />
            <div className="absolute inset-x-0 bottom-0 flex items-end justify-between bg-gradient-to-t from-slate-950/80 to-transparent p-5 pt-16">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-300">
                  Your next drive
                </p>
                <p className="mt-1 text-lg font-semibold">
                  Find it on RoyalWheels
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={showPreviousImage}
                  aria-label="Show previous car"
                  className="rounded-full bg-white/15 p-3 text-white backdrop-blur transition hover:bg-white/30"
                >
                  <FaChevronLeft aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={showNextImage}
                  aria-label="Show next car"
                  className="rounded-full bg-white/15 p-3 text-white backdrop-blur transition hover:bg-white/30"
                >
                  <FaChevronRight aria-hidden="true" />
                </button>
              </div>
            </div>
            <div className="absolute left-5 top-5 flex gap-2">
              {carImages.map((image, index) => (
                <button
                  key={image.src}
                  type="button"
                  onClick={() => setActiveImage(index)}
                  aria-label={`Show car ${index + 1}`}
                  aria-current={index === activeImage ? "true" : undefined}
                  className={`h-2 rounded-full transition-all ${
                    index === activeImage
                      ? "w-7 bg-orange-400"
                      : "w-2 bg-white/70 hover:bg-white"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-orange-500">
                Handpicked for you
              </p>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
                Featured cars
              </h2>
              <p className="mt-3 max-w-xl text-slate-600">
                Take a look at some of the latest cars listed by our vendors.
              </p>
            </div>
            <Link
              to="/cars"
              className="inline-flex w-fit items-center gap-2 font-semibold text-orange-600 transition hover:text-orange-700"
            >
              View all cars
              <FaArrowRight aria-hidden="true" />
            </Link>
          </div>

          {carsLoading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[0, 1, 2].map((item) => (
                <CarSkeleton key={item} />
              ))}
            </div>
          ) : featuredCars.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featuredCars.map((car) => (
                <CarCard key={car._id} car={car} />
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-6 py-14 text-center">
              <p className="text-lg font-semibold text-slate-800">
                {carsError
                  ? "Featured cars are temporarily unavailable."
                  : "New cars are on the way."}
              </p>
              <p className="mt-2 text-slate-600">
                Browse all listings to see what’s available.
              </p>
              <Link
                to="/cars"
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-3 font-semibold text-white transition hover:bg-orange-600"
              >
                Browse cars
                <FaArrowRight aria-hidden="true" />
              </Link>
            </div>
          )}
        </div>
      </section>

      <section className="bg-orange-50 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 overflow-hidden rounded-3xl bg-gradient-to-r from-orange-600 to-orange-500 px-7 py-10 text-white shadow-xl shadow-orange-900/10 sm:px-12 sm:py-14 lg:flex-row lg:items-center">
          <div className="max-w-2xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-sm font-semibold">
              <FaTag aria-hidden="true" />
              Make your next move
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              The right car is closer than you think.
            </h2>
            <p className="mt-3 max-w-xl leading-7 text-orange-50">
              Compare listings, explore your options, and choose a car that fits
              your journey.
            </p>
          </div>
          <Link
            to="/cars"
            className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-white px-6 py-3.5 font-bold text-orange-600 transition hover:bg-orange-50"
          >
            Find your car
            <FaArrowRight aria-hidden="true" />
          </Link>
        </div>
      </section>

      <section className="py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-orange-500">
              Simple from start to finish
            </p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
              Your next car, in three steps
            </h2>
            <p className="mt-4 leading-7 text-slate-600">
              Everything you need to move from browsing to your next set of
              keys.
            </p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              {
                number: "01",
                icon: FaSearch,
                title: "Explore your options",
                description:
                  "Browse cars for sale or rent and filter listings to find the right fit.",
              },
              {
                number: "02",
                icon: FaCheckCircle,
                title: "Choose your car",
                description:
                  "Compare the details, location, and pricing of cars that catch your eye.",
              },
              {
                number: "03",
                icon: FaArrowRight,
                title: "Make your move",
                description:
                  "Continue to checkout and take the next step toward your drive.",
              },
            ].map(({ number, icon: Icon, title, description }) => (
              <article
                key={number}
                className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
                    <Icon aria-hidden="true" />
                  </span>
                  <span className="text-3xl font-extrabold text-slate-200">
                    {number}
                  </span>
                </div>
                <h3 className="mt-6 text-xl font-bold">{title}</h3>
                <p className="mt-3 leading-7 text-slate-600">{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-orange-500">
                Customer stories
              </p>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
                The journey matters
              </h2>
              <p className="mt-3 max-w-xl text-slate-600">
                Read real feedback from people in the RoyalWheels community.
              </p>
            </div>
            <Link
              to="/reviews"
              className="inline-flex w-fit items-center gap-2 rounded-xl border border-orange-200 px-4 py-2.5 font-semibold text-orange-700 transition hover:border-orange-400 hover:bg-orange-50"
            >
              Share your experience
              <FaArrowRight aria-hidden="true" />
            </Link>
          </div>

          {reviewsLoading ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500">
              Loading customer reviews...
            </div>
          ) : reviews.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {reviews.map((review) => {
                const initials = review.name
                  .trim()
                  .split(/\s+/)
                  .slice(0, 2)
                  .map((part) => part[0])
                  .join("")
                  .toUpperCase();

                return (
                  <article
                    key={review._id}
                    className="flex flex-col rounded-2xl border border-slate-200 bg-white p-7 shadow-sm"
                  >
                    <div
                      className="flex gap-1 text-amber-400"
                      role="img"
                      aria-label={`${review.rating} out of 5 stars`}
                    >
                      {[1, 2, 3, 4, 5].map((star) =>
                        review.rating >= star ? (
                          <FaStar key={star} aria-hidden="true" />
                        ) : (
                          <FaRegStar key={star} aria-hidden="true" />
                        ),
                      )}
                    </div>
                    <blockquote className="mt-5 flex-1 text-lg leading-8 text-slate-700">
                      “{review.message}”
                    </blockquote>
                    <div className="mt-7 flex items-center gap-3 border-t border-slate-100 pt-5">
                      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-orange-100 font-bold text-orange-700">
                        {initials}
                      </span>
                      <div>
                        <p className="font-bold text-slate-900">
                          {review.name}
                        </p>
                        {review.location && (
                          <p className="text-sm text-slate-500">
                            {review.location}
                          </p>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white px-6 py-10 text-center">
              <p className="text-lg font-semibold text-slate-800">
                {reviewsError
                  ? "Customer reviews are temporarily unavailable."
                  : "Be the first to share your experience."}
              </p>
              <p className="mt-2 text-slate-600">
                {reviewsError
                  ? "Please try again later."
                  : "Your feedback can help other drivers choose their next car."}
              </p>
              {!reviewsError && (
                <Link
                  to="/reviews"
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-3 font-semibold text-white transition hover:bg-orange-600"
                >
                  Write the first review
                  <FaArrowRight aria-hidden="true" />
                </Link>
              )}
            </div>
          )}
        </div>
      </section>

      <section className="bg-slate-950 px-4 py-16 text-center text-white sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-orange-400">
            Your next chapter starts here
          </p>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
            Ready to get moving?
          </h2>
          <p className="mx-auto mt-4 max-w-xl leading-7 text-slate-300">
            Start exploring cars for sale and rent from vendors across Ghana.
          </p>
          <Link
            to="/cars"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-orange-500 px-6 py-3.5 font-semibold text-white transition hover:bg-orange-600"
          >
            Browse all cars
            <FaArrowRight aria-hidden="true" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
