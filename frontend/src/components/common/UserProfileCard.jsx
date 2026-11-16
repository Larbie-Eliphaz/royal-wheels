import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../../api/axios";

const UserProfileCard = () => {
  const [profile, setProfile] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    const fetchProfile = async () => {
      try {
        const { data } = await API.get("/users/profile");

        if (isMounted) {
          setProfile(data.user);
          setErrorMessage("");
        }
      } catch (error) {
        if (isMounted) {
          setErrorMessage(
            error.response?.data?.message || "Unable to load your profile.",
          );
        }
      }
    };

    fetchProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section
      aria-labelledby="user-profile-heading"
      className="mb-8 rounded-2xl bg-white p-6 shadow"
    >
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h2
          id="user-profile-heading"
          className="text-2xl font-semibold text-slate-900"
        >
          My Profile
        </h2>
        <Link
          to="/profile"
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          Edit profile
        </Link>
      </div>

      {errorMessage ? (
        <p role="alert" className="text-red-700">
          {errorMessage}
        </p>
      ) : !profile ? (
        <p className="text-slate-500">Loading profile...</p>
      ) : (
        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <dt className="text-sm text-slate-500">Name</dt>
            <dd className="font-medium text-slate-900">
              {profile.name || "Not provided"}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-slate-500">Email</dt>
            <dd className="font-medium text-slate-900">
              {profile.email || "Not provided"}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-slate-500">Phone</dt>
            <dd className="font-medium text-slate-900">
              {profile.phone || "Not provided"}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-slate-500">Account type</dt>
            <dd className="font-medium capitalize text-slate-900">
              {profile.role}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-slate-500">Verification</dt>
            <dd
              className={`font-medium ${
                profile.isVerified ? "text-green-700" : "text-amber-700"
              }`}
            >
              {profile.isVerified ? "Verified" : "Not verified"}
            </dd>
          </div>
          {profile.role === "vendor" && (
            <div>
              <dt className="text-sm text-slate-500">Vendor approval</dt>
              <dd
                className={`font-medium ${
                  profile.isApproved ? "text-green-700" : "text-amber-700"
                }`}
              >
                {profile.isApproved ? "Approved" : "Pending approval"}
              </dd>
            </div>
          )}
        </dl>
      )}
    </section>
  );
};

export default UserProfileCard;
