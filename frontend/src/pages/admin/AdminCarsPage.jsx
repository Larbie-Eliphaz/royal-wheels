import { useEffect, useState } from "react";
import API from "../../api/axios";
import toast from "react-hot-toast";

const AdminCarsPage = () => {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [updatingCarIds, setUpdatingCarIds] = useState([]);
  const [selectedCarIds, setSelectedCarIds] = useState([]);
  const [isBulkApproving, setIsBulkApproving] = useState(false);

  const unapprovedCars = cars.filter((car) => !car.isApproved);
  const allUnapprovedSelected =
    unapprovedCars.length > 0 &&
    unapprovedCars.every((car) => selectedCarIds.includes(car._id));

  useEffect(() => {
    let isMounted = true;

    const fetchCars = async () => {
      try {
        const { data } = await API.get("/cars/admin/all-cars");
        const responseCars = Array.isArray(data)
          ? data
          : (data?.cars ?? data?.data?.cars ?? data?.data);

        if (!Array.isArray(responseCars)) {
          throw new Error("The cars endpoint did not return a cars list.");
        }

        if (isMounted) {
          setCars(responseCars);
          setErrorMessage("");
        }
      } catch (error) {
        if (isMounted) {
          setErrorMessage(
            error.response?.data?.message ||
              error.message ||
              "Unable to load cars.",
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchCars();

    return () => {
      isMounted = false;
    };
  }, []);

  const runCarAction = async (car, request, update) => {
    setUpdatingCarIds((currentIds) => [...currentIds, car._id]);

    try {
      await request();
      setCars((currentCars) =>
        currentCars.map((currentCar) =>
          currentCar._id === car._id
            ? { ...currentCar, ...update }
            : currentCar,
        ),
      );
      if (update.isApproved) {
        setSelectedCarIds((currentIds) =>
          currentIds.filter((id) => id !== car._id),
        );
      }
    } catch (error) {
      if (!error?.globalNotificationShown) {
        toast.error(error?.message || "Car update failed.");
      }
    } finally {
      setUpdatingCarIds((currentIds) =>
        currentIds.filter((id) => id !== car._id),
      );
    }
  };

  const approveCar = (car) =>
    runCarAction(
      car,
      () => API.put(`/cars/admin/approve/${car._id}`),
      { isApproved: true },
    );

  const toggleCarSelection = (carId) => {
    setSelectedCarIds((currentIds) =>
      currentIds.includes(carId)
        ? currentIds.filter((id) => id !== carId)
        : [...currentIds, carId],
    );
  };

  const toggleAllUnapprovedCars = () => {
    setSelectedCarIds((currentIds) =>
      allUnapprovedSelected
        ? currentIds.filter(
            (id) => !unapprovedCars.some((car) => car._id === id),
          )
        : [
            ...new Set([
              ...currentIds,
              ...unapprovedCars.map((car) => car._id),
            ]),
          ],
    );
  };

  const approveSelectedCars = async () => {
    const carsToApprove = unapprovedCars.filter((car) =>
      selectedCarIds.includes(car._id),
    );

    if (carsToApprove.length === 0) {
      toast.error("Select at least one unapproved car.");
      return;
    }

    const carIds = carsToApprove.map((car) => car._id);
    setIsBulkApproving(true);
    setUpdatingCarIds((currentIds) => [...new Set([...currentIds, ...carIds])]);

    try {
      const results = await Promise.allSettled(
        carsToApprove.map((car) =>
          API.put(`/cars/admin/approve/${car._id}`, undefined, {
            skipGlobalNotifications: true,
          }),
        ),
      );
      const approvedCarIds = carIds.filter(
        (_, index) => results[index].status === "fulfilled",
      );
      const failedCount = carsToApprove.length - approvedCarIds.length;

      setCars((currentCars) =>
        currentCars.map((car) =>
          approvedCarIds.includes(car._id)
            ? { ...car, isApproved: true }
            : car,
        ),
      );
      setSelectedCarIds((currentIds) =>
        currentIds.filter((id) => !approvedCarIds.includes(id)),
      );

      if (approvedCarIds.length > 0) {
        toast.success(
          `${approvedCarIds.length} car${approvedCarIds.length === 1 ? "" : "s"} approved`,
        );
      }
      if (failedCount > 0) {
        toast.error(
          `${failedCount} car${failedCount === 1 ? "" : "s"} could not be approved. Failed selections remain selected.`,
        );
      }
    } finally {
      setUpdatingCarIds((currentIds) =>
        currentIds.filter((id) => !carIds.includes(id)),
      );
      setIsBulkApproving(false);
    }
  };

  const markCarAvailable = (car) => runCarAction(
      car,
      () => API.put(`/cars/admin/mark-is-available/${car._id}`),
      { availability: true, isSold: false },
    );

  const markCarSold = (car) => runCarAction( 
    car, () => API.put(`/cars/admin/mark-is-sold/${car._id}`),
      { isSold: true, availability: false },
    );

  return (
    <div>
      <h1 className="mb-8 text-4xl font-bold">Car Management</h1>

      {errorMessage && (
        <p
          role="alert"
          className="mb-6 rounded-xl bg-red-50 px-4 py-3 text-red-700"
        >
          {errorMessage}
        </p>
      )}

      {!loading && unapprovedCars.length > 0 && (
        <section
          aria-labelledby="bulk-approval-heading"
          className="mb-8 rounded-xl bg-white p-6 shadow"
        >
          <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2
                id="bulk-approval-heading"
                className="text-xl font-semibold text-slate-900"
              >
                Approve cars
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Select one or more unapproved cars, or select all.
              </p>
            </div>
            <button
              type="button"
              disabled={selectedCarIds.length === 0 || isBulkApproving}
              onClick={approveSelectedCars}
              className="rounded-md bg-green-700 px-4 py-2 text-sm font-medium text-white hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isBulkApproving ? "Approving..." : "Approve selected"}
            </button>
          </div>

          <label className="mb-3 flex w-fit items-center gap-2 font-medium text-slate-800">
            <input
              type="checkbox"
              checked={allUnapprovedSelected}
              disabled={isBulkApproving}
              onChange={toggleAllUnapprovedCars}
              className="h-4 w-4 accent-green-700"
            />
            Select all unapproved ({unapprovedCars.length})
          </label>

          <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {unapprovedCars.map((car) => (
              <li key={car._id}>
                <label className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-slate-700">
                  <input
                    type="checkbox"
                    checked={selectedCarIds.includes(car._id)}
                    disabled={isBulkApproving}
                    onChange={() => toggleCarSelection(car._id)}
                    className="h-4 w-4 accent-green-700"
                  />
                  <span className="truncate">{car.title}</span>
                </label>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="overflow-x-auto rounded-xl bg-white shadow">
        <table className="w-full min-w-[1100px] text-left">
          <thead className="bg-slate-100 text-sm text-slate-600">
            <tr>
              <th className="px-5 py-4 font-semibold">Car</th>
              <th className="px-5 py-4 font-semibold">Owner</th>
              <th className="px-5 py-4 font-semibold">Price</th>
              <th className="px-5 py-4 font-semibold">Approval</th>
              <th className="px-5 py-4 font-semibold">Availability</th>
              <th className="px-5 py-4 font-semibold">Sale status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td className="px-5 py-8 text-center text-gray-500" colSpan={6}>
                  Loading cars...
                </td>
              </tr>
            ) : cars.length === 0 ? (
              <tr>
                <td className="px-5 py-8 text-center text-gray-500" colSpan={6}>
                  No cars found.
                </td>
              </tr>
            ) : (
              cars.map((car) => {
                const isUpdating = updatingCarIds.includes(car._id);

                return (
                  <tr key={car._id} className="align-middle">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {car.images?.[0] ? (
                          <img
                            src={car.images[0]}
                            alt={car.title}
                            className="h-14 w-20 shrink-0 rounded-md object-cover"
                          />
                        ) : (
                          <div className="h-14 w-20 shrink-0 rounded-md bg-slate-100" />
                        )}
                        <span className="font-medium text-slate-900">
                          {car.title}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {car.owner?.name || "Owner unavailable"}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-slate-900">
                      GH₵ {Number(car.price || 0).toLocaleString("en-GH")}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <span
                          className={`whitespace-nowrap rounded-full px-3 py-1 text-sm ${
                            car.isApproved
                              ? "bg-green-100 text-green-700"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {car.isApproved ? "Approved" : "Pending"}
                        </span>
                        {!car.isApproved && (
                          <button
                            type="button"
                            disabled={isUpdating}
                            onClick={() => approveCar(car)}
                            className="rounded-md bg-green-700 px-3 py-2 text-sm font-medium text-white hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            Approve
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <span
                          className={`whitespace-nowrap rounded-full px-3 py-1 text-sm ${
                            car.availability
                              ? "bg-blue-100 text-blue-700"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {car.availability ? "Available" : "Unavailable"}
                        </span>
                        {!car.availability && (
                          <button
                            type="button"
                            disabled={isUpdating}
                            onClick={() => markCarAvailable(car)}
                            className="whitespace-nowrap rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            Mark available
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <span
                          className={`whitespace-nowrap rounded-full px-3 py-1 text-sm ${
                            car.isSold
                              ? "bg-slate-200 text-slate-700"
                              : "bg-emerald-50 text-emerald-700"
                          }`}
                        >
                          {car.isSold ? "Sold out" : car.type}
                        </span>
                        {!car.isSold && (
                          <button
                            type="button"
                            disabled={isUpdating}
                            onClick={() => markCarSold(car)}
                            className="whitespace-nowrap rounded-md border border-red-200 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            Mark sold
                          </button>
                        )}
                      </div>
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

export default AdminCarsPage;
