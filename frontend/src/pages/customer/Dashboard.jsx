import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import API from "../../api/axios";
import UserProfileCard from "../../components/common/UserProfileCard";
import OrderStatusBadge from "../../components/customer/OrderStatusBadge";
import { useNotifications } from "../../context/NotificationContext";

const formatDate = (date) => {
  if (!date) return "—";
  const parsedDate = new Date(date);
  return Number.isNaN(parsedDate.getTime())
    ? "—"
    : parsedDate.toLocaleDateString("en-GH", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
};

const formatAmount = (order) =>
  Number(order.amount ?? order.totalAmount ?? 0).toLocaleString("en-GH");

const CustomerDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [ordersError, setOrdersError] = useState("");
  const [cancellingOrderIds, setCancellingOrderIds] = useState([]);
  const { notifications, errorMessage: notificationsError } = useNotifications();

  const fetchOrders = useCallback(async () => {
    try {
      const { data } = await API.get("/orders/my-orders");
      if (!Array.isArray(data.orders)) {
        throw new Error("The orders endpoint did not return an orders list.");
      }

      setOrders(data.orders);
      setOrdersError("");
    } catch (error) {
      setOrdersError(
        error.response?.data?.message || error.message || "Unable to load orders.",
      );
    } finally {
      setLoadingOrders(false);
    }
  }, []);

  useEffect(() => {
    // Data loading is asynchronous; invoke after the effect setup.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchOrders();
  }, [fetchOrders]);

  const purchases = useMemo(
    () => orders.filter((order) => (order.orderType || order.type) === "buy"),
    [orders],
  );
  const rentals = useMemo(
    () => orders.filter((order) => (order.orderType || order.type) === "rent"),
    [orders],
  );
  const unreadNotifications = notifications.filter(
    (notification) => !notification.isRead,
  ).length;

  const cancelOrder = async (order) => {
    const carTitle = order.car?.title || "this order";
    if (!window.confirm(`Cancel your order for "${carTitle}"?`)) {
      return;
    }

    setCancellingOrderIds((currentIds) => [...currentIds, order._id]);
    try {
      await API.put(`/orders/cancel/${order._id}`);
      setOrders((currentOrders) =>
        currentOrders.map((currentOrder) =>
          currentOrder._id === order._id
            ? { ...currentOrder, orderStatus: "cancelled" }
            : currentOrder,
        ),
      );
    } catch {
      // The API interceptor displays the server error.
    } finally {
      setCancellingOrderIds((currentIds) =>
        currentIds.filter((id) => id !== order._id),
      );
    }
  };

  const renderOrderSection = (title, sectionOrders, orderType) => (
    <section className="rounded-2xl bg-white p-6 shadow">
      <div className="mb-5 flex items-center justify-between gap-3">
        <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-600">
          {sectionOrders.length}
        </span>
      </div>

      {loadingOrders ? (
        <p className="text-slate-500">Loading {title.toLowerCase()}...</p>
      ) : sectionOrders.length === 0 ? (
        <p className="text-slate-500">No {title.toLowerCase()} yet.</p>
      ) : (
        <ul className="space-y-4">
          {sectionOrders.map((order) => {
            const status = order.orderStatus || order.status || "pending";
            const isCancelling = cancellingOrderIds.includes(order._id);

            return (
              <li
                key={order._id}
                className="flex flex-col justify-between gap-4 rounded-xl border border-slate-200 p-4 sm:flex-row sm:items-center"
              >
                <div className="min-w-0">
                  <h3 className="truncate font-semibold text-slate-900">
                    {order.car?.title || "Car details unavailable"}
                  </h3>
                  <p className="mt-1 text-sm capitalize text-slate-600">
                    {orderType} · Ordered {formatDate(order.createdAt)}
                  </p>
                  {orderType === "Rental" && (
                    <p className="mt-1 text-sm text-slate-600">
                      Rental: {formatDate(order.startDate)} –{" "}
                      {formatDate(order.endDate)}
                    </p>
                  )}
                  <p className="mt-2 font-semibold text-slate-900">
                    GH₵ {formatAmount(order)}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-3">
                  <OrderStatusBadge status={status} />
                  {status === "pending" && (
                    <button
                      type="button"
                      disabled={isCancelling}
                      onClick={() => cancelOrder(order)}
                      className="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isCancelling ? "Cancelling..." : "Cancel"}
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-slate-900">Your Dashboard</h1>
          <p className="mt-2 text-slate-600">
            Your account, orders, and notifications in one place.
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            to="/cars"
            className="rounded-xl bg-orange-500 px-4 py-3 font-medium text-white hover:bg-orange-600"
          >
            Browse cars
          </Link>
          <Link
            to="/orders"
            className="rounded-xl border border-slate-300 px-4 py-3 font-medium text-slate-800 hover:bg-white"
          >
            Order history
          </Link>
        </div>
      </div>

      <UserProfileCard />

      <section
        aria-labelledby="customer-notifications-heading"
        className="rounded-2xl bg-white p-6 shadow"
      >
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <h2
              id="customer-notifications-heading"
              className="text-xl font-semibold text-slate-900"
            >
              Notifications
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {unreadNotifications} unread
            </p>
          </div>
          <Link
            to="/orders"
            className="text-sm font-medium text-orange-600 hover:text-orange-700"
          >
            View orders
          </Link>
        </div>

        {notificationsError ? (
          <p role="alert" className="text-red-700">
            {notificationsError}
          </p>
        ) : notifications.length === 0 ? (
          <p className="text-slate-500">You have no notifications.</p>
        ) : (
          <ul className="space-y-3">
            {notifications.slice(0, 5).map((notification) => (
              <li
                key={notification._id}
                className={`rounded-xl border p-4 ${
                  notification.isRead
                    ? "border-slate-200"
                    : "border-orange-200 bg-orange-50"
                }`}
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="font-semibold text-slate-900">
                    {notification.title || "Notification"}
                  </h3>
                  <time className="text-xs text-slate-500">
                    {formatDate(notification.createdAt)}
                  </time>
                </div>
                <p className="mt-1 text-sm text-slate-600">
                  {notification.message}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      {ordersError && (
        <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-red-700">
          {ordersError}
        </p>
      )}

      <div className="grid gap-6 xl:grid-cols-2">
        {renderOrderSection("Purchases", purchases, "Purchase")}
        {renderOrderSection("Rentals", rentals, "Rental")}
      </div>
    </div>
  );
};

export default CustomerDashboard;
