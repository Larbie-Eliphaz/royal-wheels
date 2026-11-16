import { useEffect, useState } from "react";
import API from "../../api/axios";
import StatsCard from "../../components/admin/StatsCard";
import UserProfileCard from "../../components/common/UserProfileCard";

const currencyFormatter = new Intl.NumberFormat("en-GH", {
  style: "currency",
  currency: "GHS",
  maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat("en-GH", {
  dateStyle: "medium",
});

const getCollection = (response, key) => {
  const payload = response.data;

  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.[key])) return payload[key];
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.data?.[key])) return payload.data[key];

  return null;
};

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    const fetchStats = async () => {
      try {
        const [usersResponse, carsResponse, ordersResponse] = await Promise.all(
          [
            API.get("/users/all-users"),
            API.get("/cars"),
            API.get("/orders/all-orders"),
          ],
        );
        const users = getCollection(usersResponse, "users");
        const cars = getCollection(carsResponse, "cars");
        const orders = getCollection(ordersResponse, "orders");

        if (!users) throw new Error("Unexpected response from /users/all-users.");
        if (!cars) throw new Error("Unexpected response from /cars.");
        if (!orders) throw new Error("Unexpected response from /orders/all-orders.");

        if (isMounted) {
          setStats({
            users: users.length,
            vendors: users.filter((user) => user.role === "vendor"),
            cars: cars.length,
            orders: orders.length,
            revenue: orders.reduce(
              (total, order) =>
                order.paymentStatus === "paid"
                  ? total + (Number(order.amount ?? order.totalAmount) || 0)
                  : total,
              0,
            ),
          });
          setErrorMessage("");
        }
      } catch (error) {
        if (isMounted) {
          setErrorMessage(
            error.response?.data?.message ||
              error.message ||
              "Unable to load dashboard statistics.",
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchStats();

    return () => {
      isMounted = false;
    };
  }, []);

  const cards = [
    { title: "Users", value: stats?.users.toLocaleString("en-GH") },
    { title: "Cars", value: stats?.cars.toLocaleString("en-GH") },
    { title: "Orders", value: stats?.orders.toLocaleString("en-GH") },
    {
      title: "Revenue",
      value: currencyFormatter.format(stats?.revenue ?? 0),
    },
  ];

  return (
    <div>
      <h1 className="text-4xl font-bold mb-8">Admin Dashboard</h1>

      {errorMessage && (
        <p
          role="alert"
          className="mb-6 rounded-xl bg-red-50 px-4 py-3 text-red-700"
        >
          {errorMessage}
        </p>
      )}

      <UserProfileCard />

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map(({ title, value }) => (
          <StatsCard
            key={title}
            title={title}
            value={loading || !stats ? "—" : value}
          />
        ))}
      </div>

      <section className="mt-10">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              Vendor subscriptions
            </h2>
            <p className="mt-1 text-slate-600">
              Review each vendor’s plan, expiry date, and renewal status.
            </p>
          </div>
          <p className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
            {stats?.vendors.length ?? 0} vendors
          </p>
        </div>

        <div className="overflow-x-auto rounded-2xl bg-white shadow-sm">
          <table className="w-full min-w-[850px] text-left">
            <thead className="bg-slate-100 text-sm text-slate-700">
              <tr>
                <th className="p-4">Vendor</th>
                <th className="p-4">Plan</th>
                <th className="p-4">Status</th>
                <th className="p-4">Expires</th>
                <th className="p-4">Time left</th>
                <th className="p-4">Renewal flag</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    Loading vendors...
                  </td>
                </tr>
              ) : stats?.vendors.length ? (
                stats.vendors.map((vendor) => {
                  const expiresAt = vendor.subscriptionExpiresAt
                    ? new Date(vendor.subscriptionExpiresAt)
                    : null;
                  const daysLeft =
                    vendor.subscriptionStatus === "active"
                      ? vendor.subscriptionDaysRemaining
                      : null;
                  const needsRenewal =
                    vendor.subscriptionStatus !== "active" || daysLeft <= 7;

                  return (
                    <tr key={vendor._id} className="border-t align-top">
                      <td className="p-4">
                        <p className="font-semibold text-slate-900">
                          {vendor.name}
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          {vendor.email}
                        </p>
                      </td>
                      <td className="p-4 capitalize text-slate-700">
                        {vendor.subscriptionStatus === "active"
                          ? vendor.vendorPlan || vendor.plan || "Unknown"
                          : "No active plan"}
                      </td>
                      <td className="p-4">
                        <span
                          className={`rounded-full px-3 py-1 text-sm font-medium capitalize ${
                            vendor.subscriptionStatus === "active"
                              ? "bg-green-100 text-green-700"
                              : vendor.subscriptionStatus === "expired"
                                ? "bg-red-100 text-red-700"
                                : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {vendor.subscriptionStatus}
                        </span>
                      </td>
                      <td className="p-4 text-slate-700">
                        {expiresAt ? dateFormatter.format(expiresAt) : "—"}
                      </td>
                      <td className="p-4 text-slate-700">
                        {daysLeft === null
                          ? vendor.subscriptionStatus === "expired"
                            ? "Expired"
                            : "—"
                          : daysLeft === 0
                            ? "Less than 1 day"
                            : `${daysLeft} day${daysLeft === 1 ? "" : "s"}`}
                      </td>
                      <td className="p-4">
                        {needsRenewal ? (
                          <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-800">
                            {vendor.subscriptionStatus === "active"
                              ? "Renew soon"
                              : "Renewal required"}
                          </span>
                        ) : (
                          <span className="text-sm text-slate-500">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    No vendors found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default AdminDashboard;
