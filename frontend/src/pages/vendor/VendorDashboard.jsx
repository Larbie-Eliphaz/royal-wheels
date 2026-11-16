import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import VendorStats from "../../components/vendor/VendorStats";
import UserProfileCard from "../../components/common/UserProfileCard";

const vendorPlanDetails = {
  starter: {
    title: "Starter",
    price: "GH₵ 199/mo",
    summary: "Basic vendor visibility for new inventory.",
    perks: [
      "Up to 10 active listings",
      "Marketplace visibility",
      "Standard support",
    ],
  },
  growth: {
    title: "Growth",
    price: "GH₵ 499/mo",
    summary: "Boosted exposure and stronger buyer conversion.",
    perks: ["Unlimited listings", "Featured placement", "Priority support"],
  },
  pro: {
    title: "Pro",
    price: "GH₵ 999/mo",
    summary: "Premium placement for large-volume dealers.",
    perks: ["Top placement", "Dedicated support", "Marketing tools"],
  },
};

const VendorDashboard = () => {
  const { user, login } = useAuth();
  const [profileError, setProfileError] = useState("");

  useEffect(() => {
    let isMounted = true;
    API.get("/users/profile", { skipGlobalNotifications: true })
      .then(({ data }) => {
        if (isMounted && data.user) {
          const currentUser = JSON.parse(
            localStorage.getItem("userInfo") || "{}",
          );
          login({ ...currentUser, ...data.user });
          setProfileError("");
        }
      })
      .catch((error) => {
        if (isMounted) {
          setProfileError(
            error.response?.data?.message ||
              "Unable to refresh your subscription status.",
          );
        }
      });

    return () => {
      isMounted = false;
    };
  }, [user?._id, login]);

  const expirationDate = user?.subscriptionExpiresAt
    ? new Date(user.subscriptionExpiresAt)
    : null;
  const hasActiveSubscription = user?.subscriptionStatus === "active";
  const isExpired = user?.subscriptionStatus === "expired";
  const daysRemaining = user?.subscriptionDaysRemaining ?? null;
  const planKey = user?.vendorPlan || user?.plan;
  const activePlan = hasActiveSubscription
    ? vendorPlanDetails[planKey]
    : null;
  const subscriptionMessage = hasActiveSubscription
    ? `Active${daysRemaining !== null ? ` · ${daysRemaining} day${daysRemaining === 1 ? "" : "s"} left` : ""}`
    : isExpired
      ? "Expired · renew to restore your plan"
      : "No active plan · up to 3 car listings";

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-4xl font-bold">Vendor Dashboard</h1>
      </div>

      {profileError && (
        <p role="alert" className="rounded-xl bg-red-50 p-4 text-red-700">
          {profileError}
        </p>
      )}

      <div
        role="status"
        className={`flex flex-col gap-3 rounded-2xl border p-4 sm:flex-row sm:items-center sm:justify-between ${
          hasActiveSubscription
            ? daysRemaining <= 7
              ? "border-amber-200 bg-amber-50 text-amber-900"
              : "border-emerald-200 bg-emerald-50 text-emerald-900"
            : "border-red-200 bg-red-50 text-red-800"
        }`}
      >
        <p className="font-semibold">
          {activePlan?.title ? `${activePlan.title} · ` : ""}
          {subscriptionMessage}
        </p>
          <Link
            to="/pricing"
            className="inline-flex shrink-0 items-center justify-center rounded-xl bg-white px-4 py-2 font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50"
          >
            Manage subscription
          </Link>
      </div>

      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="h-1.5 bg-gradient-to-r from-orange-500 via-amber-400 to-orange-200" />
        <div className="p-6 sm:p-8">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-start">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-orange-100 text-xl font-bold text-orange-600">
                {activePlan?.title?.slice(0, 1) || "RW"}
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                  Your subscription
                </p>
                <h2 className="mt-1 text-2xl font-extrabold text-slate-900 sm:text-3xl">
                  {activePlan?.title || (isExpired ? "Plan expired" : "Free vendor")}
                </h2>
                <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">
                  {activePlan?.summary ||
                    "Choose a plan to unlock more listings and vendor benefits."}
                </p>
              </div>
            </div>

            <div className="shrink-0 rounded-2xl bg-slate-50 px-5 py-4 md:min-w-44 md:text-right">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                {hasActiveSubscription ? "Plan price" : "Account access"}
              </p>
              <p className="mt-1 text-xl font-bold text-slate-900">
                {activePlan?.price || "3 free listings"}
              </p>
            </div>
          </div>

          <div className="mt-7 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Status
              </p>
              <p
                className={`mt-1 font-semibold ${
                  hasActiveSubscription
                    ? daysRemaining <= 7
                      ? "text-amber-700"
                      : "text-emerald-700"
                    : "text-red-700"
                }`}
              >
                {subscriptionMessage}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                {expirationDate ? "Renewal date" : "Subscription"}
              </p>
              <p className="mt-1 font-semibold text-slate-900">
                {expirationDate
                  ? expirationDate.toLocaleDateString()
                  : "No active subscription"}
              </p>
            </div>
          </div>

          {activePlan && (
            <div className="mt-6">
              <p className="mb-3 text-sm font-semibold text-slate-800">
                Included with your plan
              </p>
              <div className="flex flex-wrap gap-2">
                {activePlan.perks.map((perk) => (
                  <span
                    key={perk}
                    className="rounded-full bg-orange-50 px-3 py-1.5 text-sm font-medium text-orange-800"
                  >
                    {perk}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      <UserProfileCard />
      <VendorStats />
    </div>
  );
};

export default VendorDashboard;
