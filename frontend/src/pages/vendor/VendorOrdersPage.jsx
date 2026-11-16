import { useCallback, useEffect, useMemo, useState } from "react";
import API from "../../api/axios";
import OrderStatusBadge from "../../components/customer/OrderStatusBadge";

const currencyFormatter = new Intl.NumberFormat("en-GH", {
  style: "currency",
  currency: "GHS",
  maximumFractionDigits: 2,
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

const VendorOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [approvingOrderIds, setApprovingOrderIds] = useState([]);

  const fetchOrders = useCallback(async () => {
    try {
      const { data } = await API.get("/orders/vendor");
      if (!Array.isArray(data.orders)) {
        throw new Error("The vendor orders endpoint did not return an orders list.");
      }

      setOrders(data.orders);
      setErrorMessage("");
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message ||
          error.message ||
          "Unable to load your orders.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Load the vendor's orders when the page is opened.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchOrders();
  }, [fetchOrders]);

  const summary = useMemo(
    () =>
      orders.reduce(
        (counts, order) => {
          if (order.paymentStatus === "paid") counts.paid += 1;
          if (order.paymentStatus !== "paid") counts.awaitingPayment += 1;
          if (order.orderStatus === "pending") counts.pendingReview += 1;
          return counts;
        },
        { paid: 0, awaitingPayment: 0, pendingReview: 0 },
      ),
    [orders],
  );

  const visibleOrders =
    statusFilter === "all"
      ? orders
      : orders.filter((order) => order.orderStatus === statusFilter);

  const approveOrder = async (order) => {
    setApprovingOrderIds((currentIds) => [...currentIds, order._id]);
    try {
      await API.put(`/orders/approve/${order._id}`);
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
    <section>
      <header className="vendor-orders-header mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-slate-900">Orders</h1>
          <p className="mt-2 text-slate-600">
            Review customer orders, payment progress, and approve paid requests.
          </p>
        </div>
        <button
          type="button"
          onClick={fetchOrders}
          disabled={loading}
          className="vendor-orders-refresh rounded-xl border border-slate-300 bg-white px-4 py-2 font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        >
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </header>

      {errorMessage && (
        <p role="alert" className="mb-6 rounded-xl bg-red-50 px-4 py-3 text-red-700">
          {errorMessage}
        </p>
      )}

      <div className="vendor-order-summary mb-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Total orders</p>
          <p className="mt-2 text-3xl font-bold">{orders.length}</p>
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Paid orders</p>
          <p className="mt-2 text-3xl font-bold text-green-700">
            {summary.paid}
          </p>
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Pending review</p>
          <p className="mt-2 text-3xl font-bold text-orange-600">
            {summary.pendingReview}
          </p>
        </div>
      </div>

      <div className="vendor-order-toolbar mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold text-slate-900">Order history</h2>
        <label className="vendor-order-filter flex items-center gap-2 text-sm text-slate-600">
          Order status
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900"
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="rejected">Rejected</option>
          </select>
        </label>
      </div>

      <div className="vendor-table-scroll overflow-x-auto rounded-2xl bg-white shadow">
        <table className="w-full min-w-[1050px] text-left">
          <thead className="bg-slate-100 text-sm text-slate-700">
            <tr>
              <th className="p-4">Order</th>
              <th className="p-4">Customer</th>
              <th className="p-4">Vehicle / type</th>
              <th className="p-4">Amount</th>
              <th className="p-4">Payment</th>
              <th className="p-4">Order status</th>
              <th className="p-4">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-slate-500">
                  Loading orders...
                </td>
              </tr>
            ) : visibleOrders.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-slate-500">
                  {orders.length
                    ? "No orders match this status."
                    : "You have not received any orders yet."}
                </td>
              </tr>
            ) : (
              visibleOrders.map((order) => {
                const orderStatus = order.orderStatus || "pending";
                const paymentStatus = order.paymentStatus || "pending";
                const canApprove =
                  paymentStatus === "paid" && orderStatus === "pending";
                const isApproving = approvingOrderIds.includes(order._id);
                const hasRentalPeriod =
                  order.orderType === "rent" && order.startDate && order.endDate;

                return (
                  <tr key={order._id} className="border-t align-top">
                    <td className="p-4 text-sm">
                      <p className="font-medium text-slate-900">{order._id}</p>
                      <p className="mt-1 text-slate-500">
                        {order.createdAt
                          ? dateFormatter.format(new Date(order.createdAt))
                          : "Date unavailable"}
                      </p>
                    </td>
                    <td className="p-4">
                      {order.customer?.name || "Unknown customer"}
                    </td>
                    <td className="p-4">
                      <p className="font-medium text-slate-900">
                        {order.car?.title || "Vehicle unavailable"}
                      </p>
                      <p className="mt-1 text-sm capitalize text-slate-500">
                        {order.orderType || "Order"}
                        {order.car?.year ? ` · ${order.car.year}` : ""}
                      </p>
                      {hasRentalPeriod && (
                        <p className="mt-1 text-sm text-slate-500">
                          {dateFormatter.format(new Date(order.startDate))} –{" "}
                          {dateFormatter.format(new Date(order.endDate))}
                          {order.totalDays ? ` · ${order.totalDays} days` : ""}
                        </p>
                      )}
                    </td>
                    <td className="whitespace-nowrap p-4 font-semibold">
                      {currencyFormatter.format(Number(order.amount) || 0)}
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
      <p className="mt-4 text-sm text-slate-500">
        Unpaid orders cannot be approved. Payment confirmation is required first.
        {!summary.awaitingPayment && orders.length > 0
          ? " All current orders have been paid."
          : ""}
      </p>
    </section>
  );
};

export default VendorOrdersPage;