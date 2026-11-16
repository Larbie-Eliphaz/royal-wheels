import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import API from "../../api/axios";

const createFormData = (car) => ({
  title: car.title || "",
  brand: car.brand || "",
  model: car.model || "",
  year: car.year ?? "",
  type: car.type === "rent" ? "rent" : "sale",
  price: car.type === "rent" ? "" : car.price ?? "",
  rentalPrice: car.type === "rent" ? car.rentalPrice ?? "" : "",
  fuelType: car.fuelType || "",
  transmission: car.transmission || "",
  description: car.description || "",
  location: car.location || "",
});

const MyCarsPage = () => {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingCar, setEditingCar] = useState(null);
  const [formData, setFormData] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deletingCarId, setDeletingCarId] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchCars = async () => {
      try {
        const { data } = await API.get("/cars/vendor/my-cars");
        const responseCars = data.cars || data;

        if (!Array.isArray(responseCars)) {
          throw new Error("The cars endpoint did not return a cars list.");
        }

        if (isMounted) {
          setCars(responseCars);
        }
      } catch (error) {
        if (isMounted && !error?.globalNotificationShown) {
          toast.error(error?.message || "Unable to load cars.");
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

  const openEditForm = (car) => {
    setEditingCar(car);
    setFormData(createFormData(car));
  };

  const closeEditForm = () => {
    if (!saving) {
      setEditingCar(null);
      setFormData(null);
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((currentData) => {
      const updatedData = { ...currentData, [name]: value };

      if (name === "type") {
        updatedData.price = value === "sale" ? currentData.price : "";
        updatedData.rentalPrice = value === "rent" ? currentData.rentalPrice : "";
      }

      return updatedData;
    });
  };

  const handleUpdate = async (event) => {
    event.preventDefault();
    setSaving(true);

    const payload = {
      ...formData,
      price: formData.type === "sale" ? formData.price : null,
      rentalPrice: formData.type === "rent" ? formData.rentalPrice : null,
    };

    try {
      const { data } = await API.put(`/cars/${editingCar._id}`, payload);
      setCars((currentCars) =>
        currentCars.map((car) =>
          car._id === editingCar._id ? { ...car, ...payload, ...data } : car,
        ),
      );
      setEditingCar(null);
      setFormData(null);
    } catch (error) {
      if (!error?.globalNotificationShown) {
        toast.error(error?.message || "Car update failed.");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (car) => {
    if (!window.confirm(`Delete "${car.title}"? This cannot be undone.`)) {
      return;
    }

    setDeletingCarId(car._id);
    try {
      await API.delete(`/cars/${car._id}`);
      setCars((currentCars) => currentCars.filter((item) => item._id !== car._id));
    } catch (error) {
      if (!error?.globalNotificationShown) {
        toast.error(error?.message || "Car deletion failed.");
      }
    } finally {
      setDeletingCarId(null);
    }
  };

  return (
    <div>
      <h1 className="mb-8 text-4xl font-bold">My Cars</h1>

      {editingCar && formData && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeEditForm();
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-car-heading"
            className="vendor-edit-dialog my-auto w-full max-w-2xl rounded-2xl bg-white p-4 shadow-xl sm:p-6"
          >
            <div className="mb-6 flex items-center justify-between gap-4">
              <h2 id="edit-car-heading" className="text-2xl font-bold">
                Edit car
              </h2>
              <button
                type="button"
                onClick={closeEditForm}
                disabled={saving}
                className="rounded-lg px-3 py-2 text-slate-600 hover:bg-slate-100 disabled:opacity-50"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleUpdate} className="vendor-edit-form grid gap-4 sm:grid-cols-2">
              <input
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Car title"
                required
                className="rounded-xl border p-3"
              />
              <input
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                placeholder="Brand"
                required
                className="rounded-xl border p-3"
              />
              <input
                name="model"
                value={formData.model}
                onChange={handleChange}
                placeholder="Model"
                required
                className="rounded-xl border p-3"
              />
              <input
                name="year"
                type="number"
                value={formData.year}
                onChange={handleChange}
                placeholder="Year"
                required
                className="rounded-xl border p-3"
              />
              <input
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Location"
                required
                className="rounded-xl border p-3"
              />
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                required
                className="rounded-xl border p-3"
              >
                <option value="sale">Sale</option>
                <option value="rent">Rent</option>
              </select>

              {formData.type === "sale" ? (
                <input
                  name="price"
                  type="number"
                  min="0"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="Sale price"
                  required
                  className="rounded-xl border p-3"
                />
              ) : (
                <input
                  name="rentalPrice"
                  type="number"
                  min="0"
                  value={formData.rentalPrice}
                  onChange={handleChange}
                  placeholder="Rental price"
                  required
                  className="rounded-xl border p-3"
                />
              )}

              <select
                name="fuelType"
                value={formData.fuelType}
                onChange={handleChange}
                className="rounded-xl border p-3"
              >
                <option value="">Fuel type</option>
                <option value="Petrol">Petrol</option>
                <option value="Diesel">Diesel</option>
                <option value="Electric">Electric</option>
              </select>
              <select
                name="transmission"
                value={formData.transmission}
                onChange={handleChange}
                className="rounded-xl border p-3"
              >
                <option value="">Transmission</option>
                <option value="Automatic">Automatic</option>
                <option value="Manual">Manual</option>
              </select>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Description"
                className="h-28 rounded-xl border p-3 sm:col-span-2"
              />
              <p className="text-sm text-slate-500 sm:col-span-2">
                Existing photos are kept when you edit a car.
              </p>
              <div className="vendor-edit-actions flex justify-end gap-3 sm:col-span-2">
                <button
                  type="button"
                  onClick={closeEditForm}
                  disabled={saving}
                  className="rounded-xl border px-4 py-3 text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-blue-600 px-4 py-3 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save changes"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      <div className="vendor-table-scroll overflow-x-auto rounded-2xl bg-white shadow">
        <table className="w-full min-w-[700px]">
          <thead className="bg-slate-100">
            <tr>
              <th className="p-4 text-left">Car</th>
              <th className="p-4 text-left">Price</th>
              <th className="p-4 text-left">Status</th>
              <th className="p-4 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="p-8 text-center text-slate-500">
                  Loading cars...
                </td>
              </tr>
            ) : cars.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-8 text-center text-slate-500">
                  You have not uploaded any cars yet.
                </td>
              </tr>
            ) : (
              cars.map((car) => {
                const isDeleting = deletingCarId === car._id;

                return (
                  <tr key={car._id} className="border-t">
                    <td className="p-4">
                      <div className="flex min-w-0 items-center gap-3">
                        {car.images?.[0] ? (
                          <img
                            src={car.images[0]}
                            alt={car.title}
                            className="h-16 w-20 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="h-16 w-20 rounded-lg bg-slate-100" />
                        )}
                        <div className="min-w-0">
                          <h3 className="break-words font-bold">{car.title}</h3>
                          <p className="text-sm text-slate-500">{car.brand}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      GH₵ {Number(
                        car.type === "rent"
                          ? car.rentalPrice || 0
                          : car.price || 0,
                      ).toLocaleString("en-GH")}
                      {car.type === "rent" ? " / day" : ""}
                    </td>
                    <td className="p-4">
                      <span
                        className={`whitespace-nowrap rounded-full px-3 py-1 text-sm ${
                          car.isApproved
                            ? "bg-green-100 text-green-600"
                            : "bg-yellow-100 text-yellow-600"
                        }`}
                      >
                        {car.isApproved ? "Approved" : "Pending"}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          disabled={isDeleting || Boolean(saving)}
                          onClick={() => openEditForm(car)}
                          className="rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          disabled={isDeleting || Boolean(saving)}
                          onClick={() => handleDelete(car)}
                          className="rounded-lg bg-red-500 px-4 py-2 text-white hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {isDeleting ? "Deleting..." : "Delete"}
                        </button>
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

export default MyCarsPage;
