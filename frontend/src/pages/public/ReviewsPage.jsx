import { useState } from "react";
import { FaRegStar, FaStar } from "react-icons/fa";
import toast from "react-hot-toast";
import API from "../../api/axios";

const initialForm = { name: "", location: "", rating: 0, message: "" };

const ReviewsPage = () => {
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((currentForm) => ({ ...currentForm, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.rating) {
      toast.error("Please select a star rating.");
      return;
    }

    setSubmitting(true);
    try {
      await API.post(
        "/reviews",
        {
          name: form.name.trim(),
          location: form.location.trim(),
          rating: form.rating,
          message: form.message.trim(),
        },
        { skipGlobalSuccessNotification: true },
      );
      toast.success("Thank you! Your review is now on RoyalWheels.");
      setForm(initialForm);
    } catch (error) {
      if (!error?.globalNotificationShown) {
        toast.error(
          error.response?.data?.message ||
            error.message ||
            "Unable to submit your review. Please try again.",
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-slate-50">
      <section className="bg-slate-950 px-4 py-16 text-white sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-orange-400">
            Your experience matters
          </p>
          <h1 className="mt-3 text-4xl font-extrabold tracking-tight sm:text-5xl">
            Share your RoyalWheels story
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-300">
            Tell other drivers about your experience. Your review will appear
            on the homepage as soon as it’s submitted.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-9">
          <h2 className="text-2xl font-bold text-slate-900">
            Write a review
          </h2>
          <p className="mt-2 text-slate-600">
            Your name, rating, and review are required. Location is optional.
          </p>

          <form onSubmit={handleSubmit} className="mt-7 space-y-5">
            <div>
              <label
                htmlFor="review-name"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Your name
              </label>
              <input
                id="review-name"
                name="name"
                type="text"
                autoComplete="name"
                minLength={2}
                maxLength={80}
                pattern=".*\\S.*"
                required
                title="Enter a name with at least 2 non-space characters."
                value={form.name}
                onChange={handleChange}
                disabled={submitting}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100 disabled:bg-slate-100"
                placeholder="How should we display your name?"
              />
            </div>

            <div>
              <label
                htmlFor="review-location"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Location <span className="font-normal text-slate-400">(optional)</span>
              </label>
              <input
                id="review-location"
                name="location"
                type="text"
                autoComplete="address-level2"
                maxLength={80}
                pattern=".*\\S.*"
                title="Enter a location or leave this field empty."
                value={form.location}
                onChange={handleChange}
                disabled={submitting}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100 disabled:bg-slate-100"
                placeholder="e.g. Accra"
              />
            </div>

            <fieldset>
              <legend className="mb-2 block text-sm font-semibold text-slate-700">
                Your rating
              </legend>
              <div
                className="flex gap-2"
                role="radiogroup"
                aria-label="Select a rating from 1 to 5 stars"
              >
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    type="button"
                    role="radio"
                    aria-checked={form.rating === rating}
                    aria-label={`${rating} ${rating === 1 ? "star" : "stars"}`}
                    onClick={() =>
                      setForm((currentForm) => ({ ...currentForm, rating }))
                    }
                    disabled={submitting}
                    className="rounded-md p-1 text-2xl text-amber-400 transition hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 disabled:opacity-60"
                  >
                    {form.rating >= rating ? (
                      <FaStar aria-hidden="true" />
                    ) : (
                      <FaRegStar aria-hidden="true" />
                    )}
                  </button>
                ))}
              </div>
            </fieldset>

            <div>
              <label
                htmlFor="review-message"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Your review
              </label>
              <textarea
                id="review-message"
                name="message"
                minLength={10}
                maxLength={1000}
                pattern=".*\\S.*"
                rows={6}
                required
                title="Enter a review with at least 10 non-space characters."
                value={form.message}
                onChange={handleChange}
                disabled={submitting}
                className="w-full resize-y rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100 disabled:bg-slate-100"
                placeholder="What was your experience like?"
              />
              <p className="mt-2 text-right text-xs text-slate-500">
                {form.message.length}/1000
              </p>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-6 py-3.5 font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              {submitting ? "Submitting review..." : "Submit review"}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
};

export default ReviewsPage;
