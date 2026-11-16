import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import API from "../../api/axios";

const plans = {
  starter: { name: "Starter", price: "GH₵ 199", listings: "Up to 10 cars" },
  growth: { name: "Growth", price: "GH₵ 499", listings: "Unlimited cars" },
  pro: { name: "Pro", price: "GH₵ 999", listings: "Unlimited cars" },
};

const VendorSubscriptionPage = () => {
  const [searchParams] = useSearchParams();
  const planId = searchParams.get("plan");
  const plan = plans[planId];
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const startPayment = async () => {
    setLoading(true);
    setErrorMessage("");
    try {
      const { data } = await API.post(
        "/payment/subscription/initialize",
        { plan: planId },
        { skipGlobalNotifications: true },
      );

      if (!data.authorization_url) {
        throw new Error("The payment service did not return a checkout link.");
      }

      window.location.assign(data.authorization_url);
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message ||
          error.message ||
          "Unable to start your subscription payment.",
      );
    } finally {
      setLoading(false);
    }
  };

  if (!plan) {
    return (
      <section className="rounded-2xl bg-white p-8 shadow">
        <h1 className="text-2xl font-bold text-slate-900">
          Select a valid vendor plan
        </h1>
        <Link
          to="/pricing"
          className="mt-5 inline-flex rounded-xl bg-orange-500 px-5 py-3 font-semibold text-white hover:bg-orange-600"
        >
          View plans
        </Link>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-2xl rounded-3xl bg-white p-8 shadow">
      <p className="text-sm font-bold uppercase tracking-[0.2em] text-orange-500">
        Vendor subscription
      </p>
      <h1 className="mt-3 text-3xl font-extrabold text-slate-900">
        Subscribe to {plan.name}
      </h1>
      <p className="mt-3 text-slate-600">
        {plan.price} per month · {plan.listings}
      </p>
      <p className="mt-4 leading-7 text-slate-600">
        You’ll be redirected to Paystack to complete payment. Your plan becomes
        active only after RoyalWheels verifies the successful transaction.
      </p>

      {errorMessage && (
        <p role="alert" className="mt-5 rounded-xl bg-red-50 p-4 text-red-700">
          {errorMessage}
        </p>
      )}

      <div className="mt-7 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={startPayment}
          disabled={loading}
          className="rounded-xl bg-orange-500 px-5 py-3 font-semibold text-white hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Preparing secure checkout..." : "Continue to payment"}
        </button>
        <Link
          to="/pricing"
          className="rounded-xl border border-slate-300 px-5 py-3 font-medium text-slate-700 hover:bg-slate-50"
        >
          Choose another plan
        </Link>
      </div>
    </section>
  );
};

export default VendorSubscriptionPage;
