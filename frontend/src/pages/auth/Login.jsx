import { useState, useEffect } from "react";
import {
  Link,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import toast from "react-hot-toast";
import API from "../../api/axios";
import { useAuth } from "../../context/AuthContext";

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { user, login } = useAuth();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const selectedPlan = ["starter", "growth", "pro"].includes(
    searchParams.get("plan"),
  )
    ? searchParams.get("plan")
    : null;

  // HANDLE CHANGE
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // HANDLE SUBMIT
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const { data } = await API.post("/auth/login", formData);
      const account = data.user || data;
      login(account);
    } catch (error) {
      if (!error?.globalNotificationShown) {
        toast.error(error?.message || "Login failed.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Navigate after user state updates
  useEffect(() => {
    if (user) {
      if (user.role === "admin") {
        navigate("/admin");
      } else if (user.role === "vendor") {
        navigate(
          selectedPlan
            ? `/vendor/subscribe?plan=${selectedPlan}`
            : "/vendor",
          { replace: true },
        );
      } else {
        const destination = location.state?.from;
        navigate(
          destination
            ? `${destination.pathname}${destination.search || ""}${destination.hash || ""}`
            : "/dashboard",
          { replace: true },
        );
      }
    }
  }, [user, navigate, location.state, selectedPlan]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center mb-2">Welcome Back</h1>
        <p className="text-center text-gray-500 mb-6">Login to continue</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            name="email"
            autoComplete="email"
            maxLength={254}
            pattern="[^\s@]+@[^\s@]+\.[^\s@]+"
            title="Enter an email address in the format name@example.com."
            required
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            disabled={loading}
            className="w-full border rounded-xl p-3 outline-none focus:ring-2 focus:ring-orange-500"
          />

          <input
            type="password"
            name="password"
            autoComplete="current-password"
            required
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            disabled={loading}
            className="w-full border rounded-xl p-3 outline-none focus:ring-2 focus:ring-orange-500"
          />

          <button
            disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl transition"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm">
          Don't have an account?{" "}
          <Link
            to={
              searchParams.get("role") === "vendor" && selectedPlan
                ? `/register?role=vendor&plan=${selectedPlan}`
                : "/register"
            }
            className="text-orange-500 font-medium"
          >
            Register
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
