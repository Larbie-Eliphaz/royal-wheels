import { useCallback, useEffect, useState } from "react";
import { FaEnvelope, FaSyncAlt } from "react-icons/fa";
import API from "../../api/axios";

const dateFormatter = new Intl.DateTimeFormat("en-GH", {
  dateStyle: "medium",
  timeStyle: "short",
});

const AdminComplaintsPage = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const fetchComplaints = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await API.get("/complaints/admin");
      if (!Array.isArray(data?.complaints)) {
        throw new Error("The complaints endpoint did not return a complaint list.");
      }
      setComplaints(data.complaints);
      setErrorMessage("");
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message ||
          error.message ||
          "Unable to load complaints.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Load the latest complaint data after the page mounts.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchComplaints();
  }, [fetchComplaints]);

  return (
    <section>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-slate-900">Complaints</h1>
          <p className="mt-2 text-slate-600">
            Review customer concerns and follow up using the email they provided.
          </p>
        </div>
        <button
          type="button"
          onClick={fetchComplaints}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 font-semibold text-slate-700 transition hover:border-orange-400 hover:text-orange-600 disabled:opacity-60"
        >
          <FaSyncAlt aria-hidden="true" />
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {errorMessage && (
        <p
          role="alert"
          className="mb-6 rounded-xl bg-red-50 px-4 py-3 text-red-700"
        >
          {errorMessage}
        </p>
      )}

      {loading && complaints.length === 0 ? (
        <div className="rounded-2xl bg-white p-8 text-center text-slate-500 shadow">
          Loading complaints...
        </div>
      ) : complaints.length === 0 ? (
        <div className="rounded-2xl bg-white p-10 text-center shadow">
          <FaEnvelope className="mx-auto text-3xl text-slate-300" aria-hidden="true" />
          <p className="mt-4 font-semibold text-slate-800">No complaints yet</p>
          <p className="mt-1 text-slate-500">
            New submissions will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {complaints.map((complaint) => (
            <article
              key={complaint._id}
              className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-8"
            >
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                <div>
                  <span className="inline-flex rounded-full bg-orange-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-orange-700">
                    {complaint.status || "new"}
                  </span>
                  <h2 className="mt-3 text-xl font-bold text-slate-900">
                    {complaint.subject}
                  </h2>
                </div>
                <time
                  className="text-sm text-slate-500"
                  dateTime={complaint.createdAt}
                >
                  {complaint.createdAt &&
                  !Number.isNaN(Date.parse(complaint.createdAt))
                    ? dateFormatter.format(new Date(complaint.createdAt))
                    : "Date unavailable"}
                </time>
              </div>

              <p className="mt-5 whitespace-pre-wrap leading-7 text-slate-700">
                {complaint.message}
              </p>

              <div className="mt-6 flex flex-col justify-between gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center">
                <div>
                  <p className="font-semibold text-slate-900">
                    {complaint.name || "Name not provided"}
                  </p>
                  <a
                    href={`mailto:${complaint.email}`}
                    className="mt-1 inline-block text-sm font-medium text-orange-600 hover:text-orange-700"
                  >
                    {complaint.email}
                  </a>
                </div>
                <a
                  href={`mailto:${complaint.email}?subject=${encodeURIComponent(
                    `Re: ${complaint.subject}`,
                  )}`}
                  className="inline-flex w-fit items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 font-semibold text-white transition hover:bg-slate-700"
                >
                  <FaEnvelope aria-hidden="true" />
                  Reply by email
                </a>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
};

export default AdminComplaintsPage;
