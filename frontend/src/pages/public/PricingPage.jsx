import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const plans = [
  {
    id: "starter",
    name: "Starter",
    price: "GH₵ 199",
    period: "/month",
    badge: "Best for new vendors",
    description: "Get your inventory in front of serious buyers and renters.",
    features: [
      "Up to 10 active listings",
      "Basic verification badge",
      "Standard customer support",
      "Access to public marketplace",
    ],
    highlight: false,
    cta: "Start listing",
  },
  {
    id: "growth",
    name: "Growth",
    price: "GH₵ 499",
    period: "/month",
    badge: "Most popular",
    description:
      "Get more exposure and convert more buyers with premium placement.",
    features: [
      "Unlimited listings",
      "Featured placement in search",
      "Priority support and faster approvals",
      "Vendor analytics snapshot",
    ],
    highlight: true,
    cta: "Go premium",
  },
  {
    id: "pro",
    name: "Pro",
    price: "GH₵ 999",
    period: "/month",
    badge: "For high-volume sellers",
    description:
      "Built for dealers and agencies that need the strongest visibility.",
    features: [
      "Everything in Growth",
      "Top search ranking placement",
      "Dedicated account support",
      "Marketplace campaign tools",
    ],
    highlight: false,
    cta: "Choose Pro",
  },
];

const extras = [
  {
    title: "Verified vendor badge",
    text: "Build buyer trust with a premium verification status on your profile and listings.",
  },
  {
    title: "Reservation deposit",
    text: "Reduce no-shows and serious buyer drop-offs with non-refundable reservation fees.",
  },
  {
    title: "Inspection add-ons",
    text: "Bundle inspections, road test support, and vehicle paperwork into your sale flow.",
  },
];

const PricingPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const choosePlan = (planId) => {
    if (user?.role === "vendor") {
      navigate(`/vendor/subscribe?plan=${planId}`);
      return;
    }

    navigate(`/register?role=vendor&plan=${planId}`);
  };

  return (
    <div className="bg-slate-50 text-slate-900">
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-orange-500">
          Vendor pricing
        </p>
        <h1 className="mt-3 text-4xl font-extrabold tracking-tight sm:text-5xl">
          Sell smarter with RoyalWheels premium plans
        </h1>
        <p className="mt-5 text-lg leading-8 text-slate-600">
          Turn your inventory into a revenue engine with better visibility,
          trust, and conversion.
        </p>
      </div>

      <div className="mt-12 grid gap-6 lg:grid-cols-3">
        {plans.map((plan) => (
          <article
            key={plan.name}
            className={`rounded-3xl border p-7 shadow-sm transition ${
              plan.highlight
                ? "border-orange-500 bg-orange-500 text-white shadow-lg shadow-orange-900/10"
                : "border-slate-200 bg-white"
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-2xl font-bold">{plan.name}</h2>
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                  plan.highlight
                    ? "bg-white/15 text-orange-50"
                    : "bg-orange-100 text-orange-700"
                }`}
              >
                {plan.badge}
              </span>
            </div>

            <div className="mt-6 flex items-end gap-2">
              <span className="text-4xl font-extrabold">{plan.price}</span>
              <span
                className={plan.highlight ? "text-orange-50" : "text-slate-500"}
              >
                {plan.period}
              </span>
            </div>

            <p
              className={`mt-4 text-sm leading-6 ${plan.highlight ? "text-orange-50" : "text-slate-600"}`}
            >
              {plan.description}
            </p>

            <ul className="mt-6 space-y-3">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-3">
                  <span
                    className={`mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold ${
                      plan.highlight
                        ? "bg-white text-orange-500"
                        : "bg-orange-100 text-orange-600"
                    }`}
                  >
                    ✓
                  </span>
                  <span
                    className={
                      plan.highlight ? "text-orange-50" : "text-slate-700"
                    }
                  >
                    {feature}
                  </span>
                </li>
              ))}
            </ul>

            <button
              type="button"
              onClick={() => choosePlan(plan.id)}
              className={`mt-8 inline-flex w-full items-center justify-center rounded-xl px-5 py-3 font-semibold transition ${
                plan.highlight
                  ? "bg-white text-orange-600 hover:bg-orange-50"
                  : "bg-orange-500 text-white hover:bg-orange-600"
              }`}
            >
              {plan.cta}
            </button>
          </article>
        ))}
      </div>
    </section>

    <section className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-orange-500">
            Why vendors choose us
          </p>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
            More visibility. More trust. More sales.
          </h2>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {extras.map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-slate-200 bg-slate-50 p-6"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 text-xl font-bold text-orange-600">
                ✦
              </div>
              <h3 className="text-xl font-bold text-slate-900">{item.title}</h3>
              <p className="mt-3 leading-7 text-slate-600">{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    <section className="bg-slate-950 px-4 py-20 text-center text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
          Ready to grow your inventory on RoyalWheels?
        </h2>
        <p className="mt-4 text-slate-300">
          Launch your premium vendor profile today and start converting more
          leads into booked vehicles.
        </p>
        <Link
          to="/register?role=vendor"
          className="mt-8 inline-flex items-center justify-center rounded-xl bg-orange-500 px-6 py-3.5 font-semibold text-white transition hover:bg-orange-600"
        >
          Create vendor account
        </Link>
      </div>
    </section>
    </div>
  );
};

export default PricingPage;
