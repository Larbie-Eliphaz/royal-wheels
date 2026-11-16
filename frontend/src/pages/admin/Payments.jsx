import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import API from "../../api/axios";

const currencyFormatter = new Intl.NumberFormat("en-GH", {
  style: "currency",
  currency: "GHS",
  maximumFractionDigits: 2,
});

const dateFormatter = new Intl.DateTimeFormat("en-GH", {
  dateStyle: "medium",
  timeStyle: "short",
});

const statusClasses = {
  success: "bg-green-100 text-green-700",
  paid: "bg-green-100 text-green-700",
  pending: "bg-yellow-100 text-yellow-700",
  failed: "bg-red-100 text-red-700",
  refunded: "bg-slate-100 text-slate-700",
  approved: "bg-blue-100 text-blue-700",
  active: "bg-blue-100 text-blue-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
  rejected: "bg-red-100 text-red-700",
};

const StatusBadge = ({ status }) => {
  const value = status || "unknown";

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-sm font-medium capitalize ${
        statusClasses[value] || "bg-slate-100 text-slate-700"
      }`}
    >
      {value}
    </span>
  );
};

const PaymentsPage = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchPayments = useCallback(async () => {
    try {
      const { data } = await API.get("/payment/all");
      if (!Array.isArray(data.payments)) {
        throw new Error("The payments endpoint did not return a payments list.");
      }

      setPayments(data.payments);
      setErrorMessage("");
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message ||
          error.message ||
          "Unable to load payment records.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Load the payment records when the page is opened.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchPayments();
  }, [fetchPayments]);

  const summary = useMemo(
    () =>
      payments.reduce(
        (totals, payment) => {
          if (payment.status === "success") {
            totals.successfulCount += 1;
            totals.successfulAmount += Number(payment.amount) || 0;
          } else if (payment.status === "pending") {
            totals.pendingCount += 1;
          } else if (payment.status === "failed") {
            totals.failedCount += 1;
          }
          return totals;
        },
        {
          successfulCount: 0,
          successfulAmount: 0,
          pendingCount: 0,
          failedCount: 0,
        },
      ),
    [payments],
  );

  const filteredPayments =
    statusFilter === "all"
      ? payments
      : payments.filter((payment) => payment.status === statusFilter);

  return (
    <section>
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-slate-900">Payments</h1>
          <p className="mt-2 text-slate-600">
            Review customer transactions and their related order statuses.
          </p>
        </div>
        <button
          type="button"
          onClick={fetchPayments}
          disabled={loading}
          className="rounded-xl border border-slate-300 bg-white px-4 py-2 font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        >
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </header>

      {errorMessage && (
        <p role="alert" className="mb-6 rounded-xl bg-red-50 px-4 py-3 text-red-700">
          {errorMessage}
        </p>
      )}

      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Payment records</p>
          <p className="mt-2 text-2xl font-bold">{payments.length}</p>
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Successful transactions</p>
          <p className="mt-2 text-2xl font-bold text-green-700">
            {summary.successfulCount}
          </p>
          <p className="mt-1 text-sm text-slate-600">
            {currencyFormatter.format(summary.successfulAmount)}
          </p>
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Pending transactions</p>
          <p className="mt-2 text-2xl font-bold text-yellow-700">
            {summary.pendingCount}
          </p>
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Failed transactions</p>
          <p className="mt-2 text-2xl font-bold text-red-700">
            {summary.failedCount}
          </p>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold text-slate-900">
          Transaction history
        </h2>
        <label className="flex items-center gap-2 text-sm text-slate-600">
          Payment status
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900"
          >
            <option value="all">All</option>
            <option value="success">Successful</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>
        </label>
      </div>

      <div className="overflow-x-auto rounded-2xl bg-white shadow">
        <table className="w-full min-w-[1050px] text-left">
          <thead className="bg-slate-100 text-sm text-slate-700">
            <tr>
              <th className="p-4">Date</th>
              <th className="p-4">Payer / vendor</th>
              <th className="p-4">Transaction reference</th>
              <th className="p-4">Subscription / order</th>
              <th className="p-4">Amount</th>
              <th className="p-4">Payment status</th>
              <th className="p-4">Payment purpose</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-slate-500">
                  Loading payment records...
                </td>
              </tr>
            ) : filteredPayments.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-slate-500">
                  {payments.length
                    ? "No payments match this status."
                    : "No payment records found."}
                </td>
              </tr>
            ) : (
              filteredPayments.map((payment) => {
                const order = payment.order;
                const car = order?.car;

                return (
                  <tr key={payment._id} className="border-t align-top">
                    <td className="whitespace-nowrap p-4 text-sm text-slate-600">
                      {payment.createdAt
                        ? dateFormatter.format(new Date(payment.createdAt))
                        : "Date unavailable"}
                    </td>
                    <td className="p-4">
                      <p className="font-medium text-slate-900">
                        {payment.user?.name || "Unknown payer"}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        {payment.user?.email || ""}
                      </p>
                      {payment.user?.role === "vendor" && (
                        <p className="mt-1 text-xs capitalize text-slate-500">
                          Vendor
                        </p>
                      )}
                    </td>
                    <td className="p-4">
                      <p className="max-w-56 break-all font-mono text-sm text-slate-700">
                        {payment.reference}
                      </p>
                      <p className="mt-1 text-xs capitalize text-slate-500">
                        {payment.paymentMethod || "payment"}
                      </p>
                    </td>
                    <td className="p-4">
                      {payment.purpose === "subscription" ? (
                        <>
                          <p className="font-medium capitalize text-slate-900">
                            {payment.subscriptionPlan || "Vendor"} plan
                          </p>
                          <p className="mt-1 text-sm text-slate-500">
                            {payment.user?.subscriptionExpiresAt
                              ? `Expires ${dateFormatter.format(new Date(payment.user.subscriptionExpiresAt))}`
                              : "Subscription payment"}
                          </p>
                        </>
                      ) : (
                        <>
                          <p className="font-medium text-slate-900">
                            {car?.title || "Order unavailable"}
                          </p>
                          <p className="mt-1 text-sm capitalize text-slate-500">
                            {order?.orderType || "Order"} ·{" "}
                            {order?._id ? order._id.slice(-8) : "No order ID"}
                          </p>
                        </>
                      )}
                    </td>
                    <td className="whitespace-nowrap p-4 font-semibold">
                      {currencyFormatter.format(Number(payment.amount) || 0)}
                    </td>
                    <td className="p-4">
                      <StatusBadge status={payment.status} />
                    </td>
                    <td className="p-4">
                      {payment.purpose === "subscription" ? (
                        <StatusBadge status={payment.status} />
                      ) : order ? (
                        <StatusBadge status={order.orderStatus} />
                      ) : (
                        <span className="text-sm text-slate-500">
                          Unavailable
                        </span>
                      )}
                      {order?._id && (
                        <Link
                          to="/admin/orders"
                          className="mt-2 block text-sm font-medium text-orange-600 hover:text-orange-700"
                        >
                          View orders
                        </Link>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default PaymentsPage;