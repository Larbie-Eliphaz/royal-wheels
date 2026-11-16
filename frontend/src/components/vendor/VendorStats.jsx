import { useEffect, useState } from "react";
import API from "../../api/axios";

const currencyFormatter = new Intl.NumberFormat("en-GH", {
  style: "currency",
  currency: "GHS",
  maximumFractionDigits: 0,
});

const VendorStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isMounted = true;
    let timeoutId;

    const fetchStats = async () => {
      try {
        const [carsResponse, ordersResponse] = await Promise.all([
          API.get("/cars/vendor/my-cars"),
          API.get("/orders/vendor"),
        ]);

        const cars = Array.isArray(carsResponse.data)
          ? carsResponse.data
          : carsResponse.data?.cars;
        const orders = Array.isArray(ordersResponse.data)
          ? ordersResponse.data
          : ordersResponse.data?.orders;

        if (!Array.isArray(cars) || !Array.isArray(orders)) {
          throw new Error("The server returned unexpected vendor statistics.");
        }

        if (isMounted) {
          setStats({
            totalCars: cars.length,
            totalOrders: orders.length,
            revenue: orders.reduce(
              (total, order) =>
                order.paymentStatus === "paid"
                  ? total + (Number(order.amount) || 0)
                  : total,
              0
            ),
          });
          setErrorMessage("");
        }
      } catch (error) {
        if (isMounted) {
          setErrorMessage(
            error.response?.data?.message ||
              error.message ||
              "Unable to load vendor statistics."
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
          timeoutId = window.setTimeout(fetchStats, 30000);
        }
      }
    };

    fetchStats();

    return () => {
      isMounted = false;
      window.clearTimeout(timeoutId);
    };
  }, []);

  const cards = [
    { title: "Total Cars", value: stats?.totalCars.toLocaleString("en-GH") },
    { title: "Orders", value: stats?.totalOrders.toLocaleString("en-GH") },
    {
      title: "Revenue",
      value: currencyFormatter.format(stats?.revenue ?? 0),
      description: "From paid orders",
    },
  ];

  return (
    <section aria-label="Vendor statistics">
      {errorMessage && (
        <p
          role="alert"
          className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-red-700"
        >
          {errorMessage}
        </p>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        {cards.map(({ title, value, description }) => (
          <div key={title} className="rounded-2xl bg-white p-6 shadow">
            <h2 className="text-gray-500">{title}</h2>
            <p className="mt-2 text-4xl font-bold">
              {loading || !stats ? "—" : value}
            </p>
            {description && (
              <p className="mt-1 text-sm text-gray-500">{description}</p>
            )}
          </div>
        ))}
      </div>

      <p className="mt-4 text-sm text-gray-500">
        Statistics refresh automatically every 30 seconds.
      </p>
    </section>
  );
};

export default VendorStats;
