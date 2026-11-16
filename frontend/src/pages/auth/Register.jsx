import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import API from "../../api/axios";
import { useAuth } from "../../context/AuthContext";

const vendorPlans = [
  {
    id: "starter",
    name: "Starter",
    price: "GH₵ 199/mo",
    description: "Perfect for new vendors starting to sell.",
    highlight: false,
  },
  {
    id: "growth",
    name: "Growth",
    price: "GH₵ 499/mo",
    description: "Best for vendors who want stronger visibility.",
    highlight: true,
  },
  {
    id: "pro",
    name: "Pro",
    price: "GH₵ 999/mo",
    description: "For large inventories and premium placements.",
    highlight: false,
  },
];

const RegisterPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: searchParams.get("role") === "vendor" ? "vendor" : "customer",
    plan: vendorPlans.some((plan) => plan.id === searchParams.get("plan"))
      ? searchParams.get("plan")
      : "starter",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const { data } = await API.post("/auth/register", formData);

      if (formData.role === "vendor") {
        login(data);
        navigate(`/vendor/subscribe?plan=${formData.plan}`, { replace: true });
      } else {
        navigate("/login");
      }
    } catch (error) {
      if (!error?.globalNotificationShown) {
        toast.error(error?.message || "Registration failed.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center mb-2">Create Account</h1>
        <p className="text-center text-gray-500 mb-6">Join the marketplace</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="name"
            autoComplete="name"
            minLength={2}
            maxLength={100}
            pattern=".*\S.*"
            title="Enter your name using at least 2 characters."
            required
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
            className="w-full border rounded-xl p-3"
          />

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
            className="w-full border rounded-xl p-3"
          />

          <input
            type="tel"
            name="phone"
            placeholder="Phone Number"
            autoComplete="tel"
            pattern="[+]?[0-9][0-9 ()-]{6,19}"
            title="Enter a valid phone number, including country code if needed."
            maxLength={20}
            required
            value={formData.phone}
            onChange={handleChange}
            className="w-full border rounded-xl p-3"
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            autoComplete="new-password"
            minLength={8}
            maxLength={128}
            title="Use a password with at least 8 characters."
            required
            value={formData.password}
            onChange={handleChange}
            className="w-full border rounded-xl p-3"
          />

          <select
            name="role"
            value={formData.role}
            onChange={(event) => {
              const nextRole = event.target.value;
              setFormData((current) => ({
                ...current,
                role: nextRole,
                plan:
                  nextRole === "vendor" ? current.plan || "starter" : "starter",
              }));
            }}
            className="w-full border rounded-xl p-3"
          >
            <option value="customer">Customer</option>
            <option value="vendor">Vendor</option>
          </select>

          {formData.role === "vendor" && (
            <div className="space-y-3 rounded-2xl border border-orange-200 bg-orange-50 p-4">
              <p className="text-sm font-semibold text-orange-900">
                Choose a vendor plan
              </p>
              <div className="grid gap-3">
                {vendorPlans.map((plan) => (
                  <label
                    key={plan.id}
                    className={`flex cursor-pointer items-center justify-between gap-3 rounded-xl border p-3 transition ${
                      formData.plan === plan.id
                        ? "border-orange-500 bg-white"
                        : "border-orange-100 bg-orange-50"
                    }`}
                  >
                    <div>
                      <p className="font-semibold text-slate-900">
                        {plan.name}
                      </p>
                      <p className="text-sm text-slate-600">
                        {plan.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-orange-600">
                        {plan.price}
                      </span>
                      <input
                        type="radio"
                        name="plan"
                        checked={formData.plan === plan.id}
                        onChange={() =>
                          setFormData((current) => ({
                            ...current,
                            plan: plan.id,
                          }))
                        }
                        className="h-4 w-4 accent-orange-500"
                      />
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          <button
            disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl"
          >
            {loading ? "Creating..." : "Register"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm">
          Already have an account?{" "}
          <Link
            to={
              formData.role === "vendor"
                ? `/login?role=vendor&plan=${formData.plan}`
                : "/login"
            }
            className="text-orange-500 font-medium"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
