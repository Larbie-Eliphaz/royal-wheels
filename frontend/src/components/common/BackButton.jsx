import { FaArrowLeft } from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const BackButton = ({ className = "" }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const dashboardPath =
    user?.role === "admin"
      ? "/admin"
      : user?.role === "vendor"
        ? "/vendor"
        : "/dashboard";

  let fallbackPath = "/";
  if (location.pathname.startsWith("/cars/")) {
    fallbackPath = "/cars";
  } else if (
    location.pathname.startsWith("/checkout/") ||
    location.pathname === "/payment/callback"
  ) {
    fallbackPath = user ? "/orders" : "/cars";
  } else if (location.pathname === "/register") {
    fallbackPath = "/login";
  } else if (location.pathname !== "/login" && user) {
    fallbackPath = dashboardPath;
  } else if (location.pathname === "/cars") {
    fallbackPath = "/";
  }

  const hasPreviousPage =
    location.key !== "default" || fallbackPath !== location.pathname;

  const handleBack = () => {
    if (location.key !== "default") {
      navigate(-1);
      return;
    }

    if (fallbackPath !== location.pathname) {
      navigate(fallbackPath);
    }
  };

  return (
    <button
      type="button"
      onClick={handleBack}
      disabled={!hasPreviousPage}
      className={`mb-4 inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-orange-400 hover:text-orange-600 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      aria-label="Go back to the previous page"
    >
      <FaArrowLeft aria-hidden="true" />
      Back
    </button>
  );
};

export default BackButton;
