import { Link } from "react-router-dom";
import { FaArrowRight, FaCarSide } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-slate-950 text-slate-300">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr] lg:px-8 lg:py-16">
        <div className="max-w-sm">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xl font-extrabold tracking-wide text-white"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500 text-white">
              <FaCarSide aria-hidden="true" />
            </span>
            ROYAL<span className="text-orange-400">WHEELS</span>
          </Link>
          <p className="mt-5 leading-7 text-slate-400">
            Your next drive starts here. Explore cars for sale and rent from
            vendors across Ghana.
          </p>
          <Link
            to="/cars"
            className="mt-6 inline-flex items-center gap-2 font-semibold text-orange-400 transition hover:text-orange-300"
          >
            Find your next car
            <FaArrowRight aria-hidden="true" className="text-sm" />
          </Link>
        </div>

        <nav aria-label="Explore RoyalWheels">
          <h2 className="text-sm font-bold uppercase tracking-[0.16em] text-white">
            Explore
          </h2>
          <ul className="mt-5 space-y-3">
            <li>
              <Link to="/" className="transition hover:text-orange-400">
                Home
              </Link>
            </li>
            <li>
              <Link to="/cars" className="transition hover:text-orange-400">
                Browse cars
              </Link>
            </li>
            <li>
              <Link to="/contact" className="transition hover:text-orange-400">
                Contact us
              </Link>
            </li>
            <li>
              <Link to="/reviews" className="transition hover:text-orange-400">
                Share a review
              </Link>
            </li>
            <li>
              <Link to="/login" className="transition hover:text-orange-400">
                Sign in
              </Link>
            </li>
          </ul>
        </nav>

        <nav aria-label="Join RoyalWheels">
          <h2 className="text-sm font-bold uppercase tracking-[0.16em] text-white">
            Join us
          </h2>
          <p className="mt-5 max-w-xs leading-6 text-slate-400">
            Have a car to list? Create an account and start sharing your
            listings.
          </p>
          <Link
            to="/register"
            className="mt-4 inline-flex items-center gap-2 font-semibold text-white transition hover:text-orange-400"
          >
            Become a vendor
            <FaArrowRight aria-hidden="true" className="text-sm" />
          </Link>
        </nav>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-5 text-sm text-slate-500 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <p>© {new Date().getFullYear()} RoyalWheels. All rights reserved.</p>
          <p>Find your ride. Make your move.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
