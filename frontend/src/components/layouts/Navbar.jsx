import { Link } from "react-router-dom";
import { FaBars, FaBell, FaTimes } from "react-icons/fa";
import NotificationDropdown from "./NotificationDropdown";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import LogoutButton from "../common/LogoutButton";

const Navbar = () => {
  const { user } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const dashboardPath =
    user?.role === "admin"
      ? "/admin"
      : user?.role === "vendor"
        ? "/vendor"
        : "/dashboard";

  return (
    <nav className="bg-white shadow-sm">
      <div className="navbar-inner max-w-7xl mx-auto px-4 py-4 flex flex-wrap items-center justify-between">
        <Link
          to="/"
          className="whitespace-nowrap text-xl font-bold text-orange-500"
          onClick={() => setShowMobileMenu(false)}
        >
          ROYALWHEELS
        </Link>

        <div className="navbar-desktop-links items-center gap-3 lg:gap-6">
          <Link className="whitespace-nowrap text-sm lg:text-base" to="/">
            Home
          </Link>
          <Link className="whitespace-nowrap text-sm lg:text-base" to="/cars">
            Cars
          </Link>
          <Link
            className="whitespace-nowrap text-sm lg:text-base"
            to="/pricing"
          >
            Pricing
          </Link>
          <Link
            className="whitespace-nowrap text-sm lg:text-base"
            to="/contact"
          >
            Contact
          </Link>
          <Link
            className="whitespace-nowrap text-sm lg:text-base"
            to="/reviews"
          >
            Reviews
          </Link>

          {user ? (
            <>
              <Link
                to={dashboardPath}
                className="text-sm font-medium text-slate-700 hover:text-orange-500"
                aria-label={`Go to ${user.name || "user"} dashboard`}
              >
                {user.name || user.email || "User"}
              </Link>
              <LogoutButton className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition" />
            </>
          ) : (
            <Link to="/login">Login</Link>
          )}

          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="text-2xl"
              aria-label="Toggle notifications"
              aria-expanded={showNotifications}
            >
              <FaBell aria-hidden="true" />
            </button>

            {showNotifications && <NotificationDropdown />}
          </div>
        </div>

        <button
          type="button"
          className="navbar-mobile-toggle rounded-lg p-2 text-2xl text-slate-700 hover:bg-slate-100"
          onClick={() => setShowMobileMenu((isOpen) => !isOpen)}
          aria-label={
            showMobileMenu ? "Close navigation menu" : "Open navigation menu"
          }
          aria-expanded={showMobileMenu}
          aria-controls="mobile-navigation"
        >
          {showMobileMenu ? (
            <FaTimes aria-hidden="true" />
          ) : (
            <FaBars aria-hidden="true" />
          )}
        </button>

        {showMobileMenu && (
          <div
            id="mobile-navigation"
            className="navbar-mobile-menu mt-4 flex w-full flex-col gap-4 border-t border-slate-100 pt-4"
          >
            <Link to="/" onClick={() => setShowMobileMenu(false)}>
              Home
            </Link>
            <Link to="/cars" onClick={() => setShowMobileMenu(false)}>
              Cars
            </Link>
            <Link to="/pricing" onClick={() => setShowMobileMenu(false)}>
              Pricing
            </Link>
            <Link to="/contact" onClick={() => setShowMobileMenu(false)}>
              Contact
            </Link>
            <Link to="/reviews" onClick={() => setShowMobileMenu(false)}>
              Reviews
            </Link>

            {user ? (
              <>
                <Link
                  to={dashboardPath}
                  className="text-sm font-medium text-slate-700 hover:text-orange-500"
                  aria-label={`Go to ${user.name || "user"} dashboard`}
                  onClick={() => setShowMobileMenu(false)}
                >
                  {user.name || user.email || "User"}
                </Link>
                <LogoutButton className="w-fit bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition" />
              </>
            ) : (
              <Link to="/login" onClick={() => setShowMobileMenu(false)}>
                Login
              </Link>
            )}

            <div className="relative w-fit">
              <button
                type="button"
                onClick={() => setShowNotifications((isOpen) => !isOpen)}
                className="flex items-center gap-2 text-slate-700"
                aria-label="Toggle notifications"
                aria-expanded={showNotifications}
              >
                <FaBell aria-hidden="true" />
                Notifications
              </button>
              {showNotifications && <NotificationDropdown />}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
