import { useState } from "react";
import { FaEnvelope, FaPaperPlane } from "react-icons/fa";
import toast from "react-hot-toast";
import API from "../../api/axios";

const initialForm = { name: "", email: "", subject: "", message: "" };

const ContactPage = () => {
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((currentForm) => ({ ...currentForm, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      await API.post(
        "/complaints",
        {
          name: form.name.trim(),
          email: form.email.trim(),
          subject: form.subject.trim(),
          message: form.message.trim(),
        },
        { skipGlobalSuccessNotification: true },
      );
      toast.success("Your complaint has been sent to our administrators.");
      setForm(initialForm);
    } catch (error) {
      if (!error?.globalNotificationShown) {
        toast.error(
          error.response?.data?.message ||
            error.message ||
            "Unable to submit your complaint. Please try again.",
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
            We’re here to listen
          </p>
          <h1 className="mt-3 text-4xl font-extrabold tracking-tight sm:text-5xl">
            Contact our team
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-300">
            Have an issue or concern? Send a complaint directly to the
            RoyalWheels administrators and include your email so we can follow
            up with you.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
        <aside className="rounded-3xl bg-orange-500 p-8 text-white shadow-lg shadow-orange-900/10 sm:p-10">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 text-xl">
            <FaEnvelope aria-hidden="true" />
          </span>
          <h2 className="mt-6 text-2xl font-bold">Tell us what happened</h2>
          <p className="mt-3 leading-7 text-orange-50">
            Share the details of your concern using the form. Our
            administrators will be able to review your message and contact you
            at the email address you provide.
          </p>
          <div className="mt-8 rounded-2xl bg-white/10 p-5">
            <p className="font-semibold">What to include</p>
            <ul className="mt-3 list-inside list-disc space-y-2 text-sm leading-6 text-orange-50">
              <li>A working email address</li>
              <li>A short subject describing the issue</li>
              <li>Enough detail for us to understand your concern</li>
            </ul>
          </div>
        </aside>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-9">
          <h2 className="text-2xl font-bold text-slate-900">
            Submit a complaint
          </h2>
          <p className="mt-2 text-slate-600">
            Fields marked with <span className="text-orange-600">*</span> are
            required.
          </p>

          <form onSubmit={handleSubmit} className="mt-7 space-y-5">
            <div>
              <label
                htmlFor="complaint-name"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Your name <span className="font-normal text-slate-400">(optional)</span>
              </label>
              <input
                id="complaint-name"
                name="name"
                type="text"
                autoComplete="name"
                minLength={2}
                maxLength={100}
                pattern=".*\\S.*"
                title="Enter at least 2 non-space characters, or leave this field empty."
                value={form.name}
                onChange={handleChange}
                disabled={submitting}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100 disabled:bg-slate-100"
                placeholder="How should we address you?"
              />
            </div>

            <div>
              <label
                htmlFor="complaint-email"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Email address <span className="text-orange-600">*</span>
              </label>
              <input
                id="complaint-email"
                name="email"
                type="email"
                autoComplete="email"
                maxLength={254}
                pattern="[^\\s@]+@[^\\s@]+\\.[^\\s@]+"
                title="Enter an email address in the format name@example.com."
                required
                value={form.email}
                onChange={handleChange}
                disabled={submitting}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100 disabled:bg-slate-100"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label
                htmlFor="complaint-subject"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Subject <span className="text-orange-600">*</span>
              </label>
              <input
                id="complaint-subject"
                name="subject"
                type="text"
                minLength={3}
                maxLength={120}
                pattern=".*\\S.*"
                title="Enter a subject with at least 3 non-space characters."
                required
                value={form.subject}
                onChange={handleChange}
                disabled={submitting}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100 disabled:bg-slate-100"
                placeholder="What is your complaint about?"
              />
            </div>

            <div>
              <label
                htmlFor="complaint-message"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Complaint details <span className="text-orange-600">*</span>
              </label>
              <textarea
                id="complaint-message"
                name="message"
                minLength={10}
                maxLength={5000}
                pattern=".*\\S.*"
                rows={6}
                required
                title="Enter complaint details with at least 10 non-space characters."
                value={form.message}
                onChange={handleChange}
                disabled={submitting}
                className="w-full resize-y rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100 disabled:bg-slate-100"
                placeholder="Please describe what happened and how we can help."
              />
              <p className="mt-2 text-right text-xs text-slate-500">
                {form.message.length}/5000
              </p>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-6 py-3.5 font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              <FaPaperPlane aria-hidden="true" />
              {submitting ? "Sending complaint..." : "Send complaint"}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;