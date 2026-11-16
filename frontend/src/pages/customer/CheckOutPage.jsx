import {useEffect, useMemo, useState} from "react";
import {Link, useParams} from "react-router-dom";
import API from "../../api/axios";

const DAY_IN_MS = 24 * 60 * 60 * 1000;

const formatDate = (value) => {
    if (!value) return "—";
    const date = new Date(value);
    return Number.isNaN(date.getTime())
        ? "—"
        : date.toLocaleDateString("en-GH", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
};

const formatAmount = (value) =>
    Number(value || 0).toLocaleString("en-GH", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });

const normalizeRouteId = (value) =>
    value && value !== "undefined" && value !== "null" ? value : null;

const addOnDescriptions = {
    inspection: "Pre-sale inspection and transfer support",
    insurance: "12-month roadside assistance package",
    delivery: "Vehicle handover to your preferred location",
};

const CheckoutPage = () => {
    const {
        carId: rawCarId,
        id: rawRouteId,
        orderId: rawNamedOrderId,
    } = useParams();
    const carId = normalizeRouteId(rawCarId);
    const orderId = normalizeRouteId(rawNamedOrderId || rawRouteId);
    const [car, setCar] = useState(null);
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(Boolean(carId || orderId));
    const [actionLoading, setActionLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [selectedAddOns, setSelectedAddOns] = useState([]);
    const [addOnOptions, setAddOnOptions] = useState([]);
    const [currency, setCurrency] = useState("GHS");
    const currencyLabel = currency === "GHS" ? "GH₵" : currency;

    const orderType = useMemo(() => {
        if (car) return car.type === "rent" ? "rent" : "buy";
        return order?.orderType || order?.type || "buy";
    }, [car, order]);
    const rentalDays =
        startDate && endDate
            ? (new Date(endDate) - new Date(startDate)) / DAY_IN_MS
            : 0;
    const estimatedAmount =
        orderType === "rent"
            ? rentalDays > 0
                ? rentalDays * Number(car?.rentalPrice || 0)
                : null
            : Number(car?.price || 0);
    const addOnTotal = selectedAddOns.reduce(
        (sum, addOnId) =>
            sum + (addOnOptions.find((option) => option.id === addOnId)?.price || 0),
        0,
    );
    const orderSubtotal = Number(order?.amount ?? estimatedAmount ?? 0);
    const totalAmount = orderSubtotal + addOnTotal;

    useEffect(() => {
        let isMounted = true;

        const fetchAddOns = async () => {
            try {
                const {data} = await API.get("/orders/add-ons");
                if (!Array.isArray(data.addOns) || typeof data.currency !== "string") {
                    throw new Error("The checkout add-on catalog is unavailable.");
                }

                if (isMounted) {
                    setCurrency(data.currency);
                    setAddOnOptions(
                        data.addOns.map((addOn) => ({
                            ...addOn,
                            label: addOn.name,
                            description: addOnDescriptions[addOn.id] || "",
                        })),
                    );
                }
            } catch (error) {
                if (isMounted) {
                    setErrorMessage(
                        error.response?.data?.message ||
                        error.message ||
                        "Unable to load checkout add-ons.",
                    );
                }
            }
        };

        fetchAddOns();
        return () => {
            isMounted = false;
        };
    }, []);

    useEffect(() => {
        let isMounted = true;

        if (!carId && !orderId) return undefined;

        const fetchCheckoutData = async () => {
            try {
                const {data} = carId
                    ? await API.get(`/cars/${carId}`)
                    : await API.get(`/orders/my-orders/${orderId}`);
                if (isMounted) {
                    if (carId) {
                        setCar(data);
                    } else {
                        const checkoutOrder = data.order || data;
                        setOrder(checkoutOrder);
                        setSelectedAddOns(
                            (checkoutOrder.addOns || []).map((addOn) => addOn.id),
                        );
                    }
                    setErrorMessage("");
                }
            } catch (error) {
                if (isMounted) {
                    setErrorMessage(
                        error.response?.data?.message ||
                        error.message ||
                        "Unable to load checkout details.",
                    );
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchCheckoutData();

        return () => {
            isMounted = false;
        };
    }, [carId, orderId]);

    const handleConfirmOrder = async (event) => {
        event.preventDefault();

        if (!car) return;
        if (orderType === "rent" && (!startDate || !endDate || rentalDays <= 0)) {
            setErrorMessage(
                "Choose a valid rental period. The end date must be later than the start date.",
            );
            return;
        }

        setErrorMessage("");
        setActionLoading(true);
        try {
            const {data} = await API.post("/orders/create", {
                carId: car._id,
                orderType,
                ...(orderType === "rent" && {startDate, endDate}),
                ...(selectedAddOns.length > 0 && {
                    addOns: selectedAddOns,
                    selectedAddOns,
                    services: selectedAddOns,
                }),
            });
            setOrder(data.order || data);
        } catch (error) {
            if (!error?.globalNotificationShown) {
                setErrorMessage(error?.message || "Unable to confirm this order.");
            }
        } finally {
            setActionLoading(false);
        }
    };

    const handlePayment = async () => {
        if (!order?._id) return;

        setErrorMessage("");
        setActionLoading(true);
        try {
            const {data} = await API.post("/payment/initialize", {
                orderId: order._id,
            });

            if (!data.authorization_url) {
                throw new Error("The payment service did not return a payment link.");
            }

            window.location.assign(data.authorization_url);
        } catch (error) {
            if (!error?.globalNotificationShown) {
                setErrorMessage(
                    error.response?.data?.message ||
                    error?.message ||
                    "Unable to initialize payment.",
                );
            }
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) {
        return (
            <p className="rounded-2xl bg-white p-8 text-slate-600">
                Loading checkout...
            </p>
        );
    }

    const checkoutCar = car || order?.car;
    if ((errorMessage || (!carId && !orderId)) && !checkoutCar) {
        return (
            <div className="rounded-2xl bg-white p-8 shadow">
                <p role="alert" className="text-red-700">
                    {errorMessage ||
                        "Checkout needs a car or order ID. Please select a car again."}
                </p>
                <Link
                    to="/cars"
                    className="mt-5 inline-block font-medium text-orange-600 hover:text-orange-700"
                >
                    Browse cars
                </Link>
            </div>
        );
    }

    const isRent = orderType === "rent";
    const amount = order?.amount ?? estimatedAmount;
    const isConfirmed = Boolean(order);
    const activeAddOns = isConfirmed
        ? (order.addOns || []).map((addOn) => ({
            ...addOn,
            label:
                addOnOptions.find((option) => option.id === addOn.id)?.label ||
                addOn.name,
        }))
        : addOnOptions.filter((option) => selectedAddOns.includes(option.id));

    return (
        <div className="mx-auto max-w-3xl rounded-3xl bg-white p-6 shadow sm:p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">
                    {isConfirmed ? "Order confirmed" : "Confirm your order"}
                </h1>
                <p className="mt-2 text-slate-600">
                    Review your order before continuing to payment.
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

            <div className="mb-8 flex flex-col gap-5 rounded-2xl bg-slate-50 p-4 sm:flex-row">
                {checkoutCar?.images?.[0] && (
                    <img
                        src={checkoutCar.images[0]}
                        alt={checkoutCar.title}
                        className="h-44 w-full rounded-xl object-cover sm:w-56"
                    />
                )}
                <div className="flex-1">
                    <h2 className="text-xl font-semibold text-slate-900">
                        {checkoutCar?.title || "Car details unavailable"}
                    </h2>
                    <p className="mt-1 text-slate-600">
                        {checkoutCar?.brand} {checkoutCar?.model}
                    </p>
                    <p className="mt-4 font-medium capitalize text-slate-800">
                        {isRent ? "Rental" : "Purchase"}
                    </p>
                    <p className="mt-1 text-sm text-slate-600">
                        {isRent
                            ? `${currencyLabel} ${formatAmount(checkoutCar?.rentalPrice)} per day`
                            : "One-time purchase"}
                    </p>
                </div>
            </div>

            {car && !isConfirmed && (
                <form onSubmit={handleConfirmOrder} className="space-y-5">
                    {isRent && (
                        <div className="grid gap-4 sm:grid-cols-2">
                            <label className="grid gap-2 text-sm font-medium text-slate-700">
                                Rental start date
                                <input
                                    type="date"
                                    required
                                    value={startDate}
                                    min={new Date().toISOString().slice(0, 10)}
                                    onChange={(event) => setStartDate(event.target.value)}
                                    className="rounded-xl border border-slate-300 p-3"
                                />
                            </label>
                            <label className="grid gap-2 text-sm font-medium text-slate-700">
                                Rental end date
                                <input
                                    type="date"
                                    required
                                    value={endDate}
                                    min={startDate || new Date().toISOString().slice(0, 10)}
                                    onChange={(event) => setEndDate(event.target.value)}
                                    className="rounded-xl border border-slate-300 p-3"
                                />
                            </label>
                        </div>
                    )}

                    {isRent && rentalDays > 0 && (
                        <p className="text-sm text-slate-600">
                            {rentalDays} rental day{rentalDays === 1 ? "" : "s"}
                        </p>
                    )}

                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <p className="text-sm font-medium text-slate-700">
                            Optional protection add-ons
                        </p>
                        <div className="mt-4 space-y-3">
                            {addOnOptions.map((option) => {
                                const checked = selectedAddOns.includes(option.id);

                                return (
                                    <label
                                        key={option.id}
                                        className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-white p-3"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={checked}
                                            onChange={() =>
                                                setSelectedAddOns((current) =>
                                                    current.includes(option.id)
                                                        ? current.filter((item) => item !== option.id)
                                                        : [...current, option.id],
                                                )
                                            }
                                            className="mt-1 h-4 w-4 accent-orange-500"
                                        />
                                        <span className="flex-1">
                      <span className="block font-medium text-slate-800">
                        {option.label}
                      </span>
                      <span className="block text-sm text-slate-500">
                        {option.description}
                      </span>
                    </span>
                                        <span className="font-semibold text-slate-800">
                      {currencyLabel} {formatAmount(option.price)}
                    </span>
                                    </label>
                                );
                            })}
                        </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 p-4">
                        <p className="text-sm font-medium text-slate-700">Order summary</p>
                        <div className="mt-4 flex items-center justify-between text-slate-600">
                            <span>{isRent ? "Rental amount" : "Price"}</span>
                            <span>{currencyLabel} {formatAmount(amount || 0)}</span>
                        </div>
                        {activeAddOns.length > 0 && (
                            <div className="mt-3 space-y-2">
                                {activeAddOns.map((addOn) => (
                                    <div
                                        key={addOn.id}
                                        className="flex items-center justify-between text-sm text-slate-600"
                                    >
                                        <span>{addOn.label}</span>
                                        <span>{currencyLabel} {formatAmount(addOn.price)}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                        <div
                            className="mt-3 flex items-center justify-between border-t border-slate-200 pt-3 text-lg font-bold text-slate-900">
                            <span>Total</span>
                            <span>{currencyLabel} {formatAmount(totalAmount)}</span>
                        </div>
                    </div>

                    <div className="flex flex-wrap justify-between gap-3">
                        <Link
                            to={`/cars/${car._id}`}
                            className="rounded-xl border border-slate-300 px-5 py-3 font-medium text-slate-700 hover:bg-slate-50"
                        >
                            Back to car
                        </Link>
                        <button
                            type="submit"
                            disabled={
                                actionLoading ||
                                (isRent && (!startDate || !endDate || rentalDays <= 0))
                            }
                            className="rounded-xl bg-orange-500 px-6 py-3 font-semibold text-white hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {actionLoading ? "Confirming..." : "Confirm order"}
                        </button>
                    </div>
                </form>
            )}

            {isConfirmed && (
                <>
                    <div className="space-y-4 border-t border-slate-200 pt-5">
                        <div className="flex justify-between gap-4">
                            <span className="text-slate-600">Order type</span>
                            <span className="font-medium capitalize">
                {isRent ? "Rental" : "Purchase"}
              </span>
                        </div>
                        {isRent && (
                            <>
                                <div className="flex justify-between gap-4">
                                    <span className="text-slate-600">Start date</span>
                                    <span className="font-medium">
                    {formatDate(order.startDate)}
                  </span>
                                </div>
                                <div className="flex justify-between gap-4">
                                    <span className="text-slate-600">End date</span>
                                    <span className="font-medium">
                    {formatDate(order.endDate)}
                  </span>
                                </div>
                            </>
                        )}
                        {activeAddOns.length > 0 && (
                            <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
                                <p className="text-sm font-medium text-slate-700">
                                    Selected add-ons
                                </p>
                                {activeAddOns.map((option) => (
                                    <div
                                        key={option.id}
                                        className="flex justify-between gap-4 text-sm text-slate-600"
                                    >
                                        <span>{option.label}</span>
                                        <span>{currencyLabel} {formatAmount(option.price)}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                        <div className="flex justify-between gap-4 text-lg">
                            <span className="font-medium text-slate-700">Order total</span>
                            <span className="font-bold text-orange-600">
                {currencyLabel} {formatAmount(order?.amount ?? totalAmount ?? amount ?? 0)}
              </span>
                        </div>
                    </div>

                    <div className="mt-8 flex flex-wrap justify-between gap-3">
                        <Link
                            to="/dashboard"
                            className="rounded-xl border border-slate-300 px-5 py-3 font-medium text-slate-700 hover:bg-slate-50"
                        >
                            Finish later
                        </Link>
                        {order.paymentStatus !== "paid" && (
                            <button
                                type="button"
                                disabled={actionLoading}
                                onClick={handlePayment}
                                className="rounded-xl bg-orange-500 px-6 py-3 font-semibold text-white hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {actionLoading ? "Preparing payment..." : "Continue to payment"}
                            </button>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default CheckoutPage;
