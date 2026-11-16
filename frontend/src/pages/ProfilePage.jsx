import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";

const ProfilePage = () => {
  const { user, login } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isMounted = true;
    API.get("/users/profile", { skipGlobalNotifications: true })
      .then(({ data }) => {
        if (isMounted && data.user) {
          setFormData({
            name: data.user.name || "",
            email: data.user.email || "",
            phone: data.user.phone || "",
          });
          setErrorMessage("");
        }
      })
      .catch((error) => {
        if (isMounted) {
          setErrorMessage(
            error.response?.data?.message || "Unable to load your profile.",
          );
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setErrorMessage("");

    try {
      const { data } = await API.patch("/users/profile", formData, {
        skipGlobalSuccessNotification: true,
        skipGlobalNotifications: true,
      });
      const currentUser = JSON.parse(
        localStorage.getItem("userInfo") || "{}",
      );
      login({ ...currentUser, ...data.user });
      setFormData({
        name: data.user.name || "",
        email: data.user.email || "",
        phone: data.user.phone || "",
      });
      toast.success(data.message || "Profile updated successfully.");
    } catch (error) {
      const message =
        error.response?.data?.message || "Unable to update your profile.";
      setErrorMessage(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const dashboardPath =
    user?.role === "admin"
      ? "/admin"
      : user?.role === "vendor"
        ? "/vendor"
        : "/dashboard";

  return (
    <section className="mx-auto max-w-3xl rounded-3xl bg-white p-6 shadow-sm sm:p-8">
      <div className="mb-7 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-orange-500">
            Account settings
          </p>
          <h1 className="mt-2 text-3xl font-extrabold text-slate-900">
            My Profile
          </h1>
          <p className="mt-2 text-slate-600">
            Update the personal details associated with your account.
          </p>
        </div>
        <Link
          to={dashboardPath}
          className="rounded-xl border border-slate-300 px-4 py-2 font-medium text-slate-700 hover:bg-slate-50"
        >
          Back to dashboard
        </Link>
      </div>

      {errorMessage && (
        <p role="alert" className="mb-5 rounded-xl bg-red-50 p-4 text-red-700">
          {errorMessage}
        </p>
      )}

      {loading ? (
        <p className="text-slate-500">Loading your profile...</p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="profile-name"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Full name
            </label>
            <input
              id="profile-name"
              name="name"
              type="text"
              autoComplete="name"
              required
              minLength={2}
              maxLength={100}
              value={formData.name}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
            />
          </div>

          <div>
            <label
              htmlFor="profile-email"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Email address
            </label>
            <input
              id="profile-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              maxLength={254}
              value={formData.email}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
            />
          </div>

          <div>
            <label
              htmlFor="profile-phone"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Phone number
            </label>
            <input
              id="profile-phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              maxLength={20}
              pattern="[+]?[0-9][0-9 ()-]{6,19}"
              title="Enter a valid phone number, including country code if needed."
              value={formData.phone}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-5">
            <p className="text-sm capitalize text-slate-500">
              Account type: {user?.role}
            </p>
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-orange-500 px-5 py-3 font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Saving changes..." : "Save changes"}
            </button>
          </div>
        </form>
      )}
    </section>
  );
};

export default ProfilePage;
