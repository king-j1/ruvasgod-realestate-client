import { useCallback, useEffect, useMemo, useState } from "react";
import api from "../api/axios";

const STATUSES = [
  "PENDING",
  "CONFIRMED",
  "RESCHEDULED",
  "COMPLETED",
  "CANCELLED",
];

function StaffPropertyViewings() {
  const [viewings, setViewings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [busyId, setBusyId] = useState("");

  const loadViewings = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/property-viewings");

      setViewings(
        Array.isArray(response.data?.viewings)
          ? response.data.viewings
          : []
      );
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to load property viewings."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadViewings();
  }, [loadViewings]);

  const filteredViewings = useMemo(() => {
    const query = search.trim().toLowerCase();

    return viewings.filter((item) => {
      const matchesStatus =
        statusFilter === "ALL" || item.status === statusFilter;

      const matchesSearch =
        !query ||
        item.customerName?.toLowerCase().includes(query) ||
        item.customerEmail?.toLowerCase().includes(query) ||
        item.customerPhone?.toLowerCase().includes(query) ||
        item.property?.title?.toLowerCase().includes(query);

      return matchesStatus && matchesSearch;
    });
  }, [viewings, search, statusFilter]);

  const updateViewing = async (id, form) => {
    try {
      setBusyId(id);
      setError("");
      setNotice("");

      const response = await api.patch(`/property-viewings/${id}`, {
        status: form.status,
        confirmedDate: form.confirmedDate || null,
        confirmedTime: form.confirmedTime || "",
        staffNotes: form.staffNotes,
      });

      setViewings((current) =>
        current.map((item) =>
          item._id === id
            ? { ...item, ...response.data.viewing }
            : item
        )
      );

      setNotice("Property viewing updated successfully.");
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to update property viewing."
      );

      await loadViewings();
    } finally {
      setBusyId("");
    }
  };

  return (
    <main className="staff-page min-h-[calc(100vh-4rem)] bg-[#fffdf8] px-4 py-8 sm:px-7 lg:px-10 lg:py-10">
      <div className="mx-auto max-w-7xl">
        <header className="mb-7">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-900">
            Customer operations
          </p>

          <h1 className="mt-2 text-3xl font-semibold text-stone-900 sm:text-4xl">
            Property viewings
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-600">
            Manage customer viewing appointments, confirmations and follow-ups.
          </p>
        </header>

        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          {STATUSES.slice(0, 3).map((status) => (
            <div
              key={status}
              className="rounded-2xl border border-stone-200 bg-white p-5"
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">
                {status.replaceAll("_", " ")}
              </p>

              <p className="mt-2 text-2xl font-semibold text-stone-900">
                {viewings.filter((item) => item.status === status).length}
              </p>
            </div>
          ))}
        </div>

        <div className="mb-6 grid gap-3 sm:grid-cols-[1fr_240px]">
          <label className="text-sm font-semibold text-stone-700">
            Search viewings
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Customer, email, phone or property"
              className="mt-1.5 min-h-11 w-full rounded-xl border border-stone-300 bg-white px-3.5"
            />
          </label>

          <label className="text-sm font-semibold text-stone-700">
            Filter by status
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="mt-1.5 min-h-11 w-full rounded-xl border border-stone-300 bg-white px-3.5"
            >
              <option value="ALL">All statuses</option>
              {STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status.replaceAll("_", " ")}
                </option>
              ))}
            </select>
          </label>
        </div>

        {notice && (
          <p
            role="status"
            className="mb-4 rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-800"
          >
            {notice}
          </p>
        )}

        {error && (
          <div
            role="alert"
            className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
          >
            <p>{error}</p>
            <button
              type="button"
              onClick={loadViewings}
              className="mt-2 font-semibold underline"
            >
              Try again
            </button>
          </div>
        )}

        {loading && (
          <p role="status" className="py-8 text-sm text-stone-600">
            Loading property viewings…
          </p>
        )}

        {!loading && !error && filteredViewings.length === 0 && (
          <div className="rounded-2xl border border-stone-200 bg-white p-10 text-center">
            <h2 className="font-semibold text-stone-900">
              {viewings.length
                ? "No viewings match your search"
                : "No property viewing requests yet"}
            </h2>

            <p className="mt-2 text-sm text-stone-600">
              New customer viewing requests will appear here.
            </p>
          </div>
        )}

        {!loading && filteredViewings.length > 0 && (
          <div className="space-y-4">
            {filteredViewings.map((item) => (
              <ViewingCard
                key={item._id}
                item={item}
                busy={busyId === item._id}
                onSave={updateViewing}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

function ViewingCard({ item, busy, onSave }) {
  const [status, setStatus] = useState(item.status);
  const [confirmedDate, setConfirmedDate] = useState(
    item.confirmedDate
      ? new Date(item.confirmedDate).toISOString().slice(0, 10)
      : ""
  );
  const [confirmedTime, setConfirmedTime] = useState(
    item.confirmedTime || ""
  );
  const [staffNotes, setStaffNotes] = useState(item.staffNotes || "");

  const formatDate = (date) =>
    date
      ? new Date(date).toLocaleDateString("en-GH", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      : "Not specified";

  return (
    <article className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-900">
            Viewing request
          </p>

          <h2 className="mt-1 text-lg font-semibold text-stone-900">
            {item.property?.title || "Property record unavailable"}
          </h2>

          <p className="mt-1 text-xs text-stone-500">
            Requested {formatDate(item.createdAt)}
          </p>
        </div>

        <span className="h-fit rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-900">
          {item.status}
        </span>
      </div>

      <div className="mt-5 grid gap-5 border-t border-stone-100 pt-5 sm:grid-cols-2">
        <div>
          <h3 className="mb-2 text-sm font-semibold text-stone-800">
            Customer details
          </h3>

          <p className="text-sm text-stone-700">
            {item.customerName}
          </p>
          <p className="mt-1 text-sm text-stone-600">
            {item.customerEmail}
          </p>
          <p className="mt-1 text-sm text-stone-600">
            {item.customerPhone}
          </p>
        </div>

        <div>
          <h3 className="mb-2 text-sm font-semibold text-stone-800">
            Requested appointment
          </h3>

          <p className="text-sm text-stone-700">
            {formatDate(item.preferredDate)}
          </p>
          <p className="mt-1 text-sm text-stone-600">
            Preferred time: {item.preferredTime}
          </p>
        </div>
      </div>

      {item.message && (
        <div className="mt-5 rounded-xl bg-stone-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">
            Customer message
          </p>
          <p className="mt-2 whitespace-pre-wrap text-sm text-stone-700">
            {item.message}
          </p>
        </div>
      )}

      <div className="mt-5 grid gap-4 border-t border-stone-100 pt-5 sm:grid-cols-2">
        <label className="text-sm font-semibold text-stone-700">
          Appointment status
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="mt-1.5 min-h-11 w-full rounded-xl border border-stone-300 bg-white px-3"
          >
            {STATUSES.map((value) => (
              <option key={value} value={value}>
                {value.replaceAll("_", " ")}
              </option>
            ))}
          </select>
        </label>

        <label className="text-sm font-semibold text-stone-700">
          Confirmed viewing date
          <input
            type="date"
            value={confirmedDate}
            onChange={(event) => setConfirmedDate(event.target.value)}
            className="mt-1.5 min-h-11 w-full rounded-xl border border-stone-300 bg-white px-3"
          />
        </label>

        <label className="text-sm font-semibold text-stone-700">
          Confirmed viewing time
          <input
            type="time"
            value={confirmedTime}
            onChange={(event) => setConfirmedTime(event.target.value)}
            className="mt-1.5 min-h-11 w-full rounded-xl border border-stone-300 bg-white px-3"
          />
        </label>

        <label className="text-sm font-semibold text-stone-700 sm:col-span-2">
          Internal staff notes
          <textarea
            value={staffNotes}
            onChange={(event) => setStaffNotes(event.target.value)}
            rows={3}
            maxLength={1000}
            placeholder="Add internal appointment notes..."
            className="mt-1.5 w-full rounded-xl border border-stone-300 bg-white p-3"
          />
        </label>
      </div>

      <div className="mt-5 flex justify-end">
        <button
          type="button"
          disabled={busy}
          onClick={() =>
            onSave(item._id, {
              status,
              confirmedDate,
              confirmedTime,
              staffNotes,
            })
          }
          className="min-h-11 rounded-xl bg-amber-700 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {busy ? "Saving..." : "Save appointment"}
        </button>
      </div>
    </article>
  );
}

export default StaffPropertyViewings;
