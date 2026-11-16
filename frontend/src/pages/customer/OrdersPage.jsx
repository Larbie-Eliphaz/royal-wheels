import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../../api/axios";
import OrderStatusBadge from "../../components/customer/OrderStatusBadge";

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

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [cancellingOrderIds, setCancellingOrderIds] = useState([]);

  const fetchOrders = useCallback(async () => {
    try {
      const { data } = await API.get("/orders/my-orders");
      if (!Array.isArray(data.orders)) {
        throw new Error("The orders endpoint did not return an orders list.");
      }

      setOrders(data.orders);
      setErrorMessage("");
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message || error.message || "Unable to load orders.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Data loading is asynchronous; invoke after the effect setup.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchOrders();
  }, [fetchOrders]);

  const cancelOrder = async (order) => {
    if (
      !window.confirm(
        `Cancel your order for "${order.car?.title || "this car"}"?`,
      )
    ) {
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

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold">Order History</h1>
          <p className="mt-2 text-slate-600">
            Track purchases, rentals, and pending requests.
          </p>
        </div>
        <Link
          to="/dashboard"
          className="font-medium text-orange-600 hover:text-orange-700"
        >
          Back to dashboard
        </Link>
      </div>

      {errorMessage && (
        <p role="alert" className="mb-6 rounded-xl bg-red-50 px-4 py-3 text-red-700">
          {errorMessage}
        </p>
      )}

      {loading ? (
        <p className="text-slate-500">Loading order history...</p>
      ) : orders.length === 0 ? (
        <div className="rounded-2xl bg-white p-8 text-center shadow">
          <p className="text-slate-600">You haven’t placed any orders yet.</p>
          <Link
            to="/cars"
            className="mt-4 inline-block rounded-xl bg-orange-500 px-4 py-3 font-medium text-white hover:bg-orange-600"
          >
            Browse cars
          </Link>
        </div>
      ) : (
        <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {orders.map((order) => {
            const status = order.orderStatus || order.status || "pending";
            const orderType = order.orderType || order.type || "order";
            const amount = Number(order.amount ?? order.totalAmount ?? 0);
            const isCancelling = cancellingOrderIds.includes(order._id);
            const canPay = order.paymentStatus !== "paid" && status !== "cancelled";
            const carImage = order.car?.images?.[0];

            return (
              <li
                key={order._id}
                className="overflow-hidden rounded-2xl bg-white shadow"
              >
                {carImage ? (
                  <img
                    src={carImage}
                    alt={order.car?.title || "Ordered car"}
                    className="aspect-[16/10] w-full bg-slate-100 object-cover"
                  />
                ) : (
                  <div
                    role="img"
                    aria-label={`No image available for ${order.car?.title || "this car"}`}
                    className="flex aspect-[16/10] w-full items-center justify-center bg-slate-100 text-sm text-slate-500"
                  >
                    Car image unavailable
                  </div>
                )}

                <div className="p-5">
                  <h2 className="text-xl font-bold">
                    {order.car?.title || "Car details unavailable"}
                  </h2>
                  <p className="mt-1 capitalize text-slate-600">
                    {orderType} · Placed {formatDate(order.createdAt)}
                  </p>
                  {orderType === "rent" && (
                    <p className="mt-1 text-sm text-slate-600">
                      Rental period: {formatDate(order.startDate)} –{" "}
                      {formatDate(order.endDate)}
                    </p>
                  )}
                  <p className="mt-2 font-semibold">
                    GH₵ {amount.toLocaleString("en-GH")}
                  </p>
                  <p className="mt-1 text-sm capitalize text-slate-500">
                    Payment: {order.paymentStatus || "pending"}
                  </p>

                  <div className="mt-5 flex flex-wrap items-center gap-3">
                    <OrderStatusBadge status={status} />
                    {canPay && (
                      <Link
                        to={`/checkout/${order._id}`}
                        className="rounded-lg bg-orange-500 px-3 py-2 text-sm font-medium text-white hover:bg-orange-600"
                      >
                        Make payment
                      </Link>
                    )}
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
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default OrdersPage;
