import { useCallback, useEffect, useState } from "react";
import API from "../../api/axios";
import OrderStatusBadge from "../../components/customer/OrderStatusBadge";

const currencyFormatter = new Intl.NumberFormat("en-GH", {
  style: "currency",
  currency: "GHS",
  maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat("en-GH", {
  dateStyle: "medium",
});

const paymentStatusClasses = {
  paid: "bg-green-100 text-green-700",
  pending: "bg-yellow-100 text-yellow-700",
  failed: "bg-red-100 text-red-700",
  refunded: "bg-slate-100 text-slate-700",
};

const AdminOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [approvingOrderIds, setApprovingOrderIds] = useState([]);

  const fetchOrders = useCallback(async () => {
    try {
      const { data } = await API.get("/orders/all-orders");
      const responseOrders = Array.isArray(data)
        ? data
        : (data?.orders ?? data?.data?.orders ?? data?.data);

      if (!Array.isArray(responseOrders)) {
        throw new Error("The orders endpoint did not return an orders list.");
      }

      setOrders(responseOrders);
      setErrorMessage("");
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message ||
          error.message ||
          "Unable to load orders.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Load the latest order data after the page mounts.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchOrders();
  }, [fetchOrders]);

  const approveOrder = async (order) => {
    setApprovingOrderIds((currentIds) => [...currentIds, order._id]);
    try {
      await API.put(`/orders/admin/approve/${order._id}`);
      setOrders((currentOrders) =>
        currentOrders.map((currentOrder) =>
          currentOrder._id === order._id
            ? { ...currentOrder, orderStatus: "approved" }
            : currentOrder,
        ),
      );
      setErrorMessage("");
    } catch (error) {
      if (!error?.globalNotificationShown) {
        setErrorMessage(
          error.response?.data?.message ||
            error.message ||
            "Unable to approve this order.",
        );
      }
    } finally {
      setApprovingOrderIds((currentIds) =>
        currentIds.filter((id) => id !== order._id),
      );
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold">Orders</h1>
        <p className="mt-2 text-slate-600">
          Review order details, payment status, and approve paid orders.
        </p>
      </div>

      {errorMessage && (
        <p
          role="alert"
          className="mb-6 rounded-xl bg-red-50 px-4 py-3 text-red-700"
        >
          {errorMessage}
        </p>
      )}

      <div className="overflow-x-auto rounded-2xl bg-white shadow">
        <table className="w-full min-w-[1050px] text-left">
          <thead className="bg-slate-100">
            <tr>
              <th className="p-4">Order</th>
              <th className="p-4">Customer / Vendor</th>
              <th className="p-4">Vehicle</th>
              <th className="p-4">Amount</th>
              <th className="p-4">Payment</th>
              <th className="p-4">Order status</th>
              <th className="p-4">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className="p-6 text-center text-gray-500" colSpan={7}>
                  Loading orders...
                </td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td className="p-6 text-center text-gray-500" colSpan={7}>
                  No orders found.
                </td>
              </tr>
            ) : (
              orders.map((order) => {
                const paymentStatus = order.paymentStatus || "pending";
                const orderStatus = order.orderStatus || order.status || "pending";
                const isApproving = approvingOrderIds.includes(order._id);
                const canApprove =
                  paymentStatus === "paid" && orderStatus === "pending";
                const rentalPeriod =
                  order.orderType === "rent" && order.startDate && order.endDate;

                return (
                  <tr key={order._id} className="border-t align-top">
                    <td className="p-4 text-sm">
                      <p className="font-medium text-slate-900">
                        {order._id}
                      </p>
                      <p className="mt-1 text-slate-500">
                        {order.createdAt
                          ? dateFormatter.format(new Date(order.createdAt))
                          : "Date unavailable"}
                      </p>
                    </td>
                    <td className="p-4">
                      <p className="font-medium">
                        {order.customer?.name ?? "Unknown customer"}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        Vendor: {order.vendor?.name ?? "Unknown vendor"}
                      </p>
                    </td>
                    <td className="p-4">
                      <p className="font-medium">
                        {order.car?.title ?? "Car unavailable"}
                      </p>
                      <p className="mt-1 text-sm capitalize text-slate-500">
                        {order.orderType || "Order"}
                        {order.car?.year ? ` · ${order.car.year}` : ""}
                      </p>
                      {rentalPeriod && (
                        <p className="mt-1 text-sm text-slate-500">
                          {dateFormatter.format(new Date(order.startDate))} –{" "}
                          {dateFormatter.format(new Date(order.endDate))}
                        </p>
                      )}
                    </td>
                    <td className="whitespace-nowrap p-4 font-semibold">
                      {currencyFormatter.format(
                        Number(order.amount ?? order.totalAmount) || 0,
                      )}
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-sm font-medium capitalize ${
                          paymentStatusClasses[paymentStatus] ||
                          "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {paymentStatus}
                      </span>
                    </td>
                    <td className="p-4">
                      <OrderStatusBadge status={orderStatus} />
                    </td>
                    <td className="p-4">
                      {canApprove ? (
                        <button
                          type="button"
                          disabled={isApproving}
                          onClick={() => approveOrder(order)}
                          className="whitespace-nowrap rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {isApproving ? "Approving..." : "Approve order"}
                        </button>
                      ) : (
                        <span className="text-sm text-slate-400">
                          {orderStatus !== "pending"
                            ? "No action needed"
                            : "Payment required"}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminOrdersPage;
