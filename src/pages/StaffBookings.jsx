
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

function StatusBadge({ status }) {
  const styles = {
    pending: "border-amber-400/20 bg-amber-400/10 text-amber-300",
    confirmed: "border-cyan-400/20 bg-cyan-400/10 text-cyan-300",
    active: "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
    completed: "border-white/10 bg-white/[0.05] text-slate-400",
    cancelled: "border-red-400/20 bg-red-400/10 text-red-300",
  };

  return (
    <span
      className={`rounded-full border px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] ${
        styles[status] || "border-white/10 bg-white/[0.05] text-slate-400"
      }`}
    >
      {status || "unknown"}
    </span>
  );
}

function PaymentBadge({ status }) {
  const isPaid = status === "paid";
  const isFailed = status === "failed";
  const isPending = status === "pending" || status === "unpaid";

  return (
    <span
      className={`rounded-full border px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] ${
        isPaid
          ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
          : isFailed
            ? "border-red-400/20 bg-red-400/10 text-red-300"
            : isPending
              ? "border-amber-400/20 bg-amber-400/10 text-amber-300"
              : "border-white/10 bg-white/[0.05] text-slate-400"
      }`}
    >
      {status || "unknown"}
    </span>
  );
}

function StaffBookings() {
  const { user } = useAuth();
  const canManage = ["admin", "manager", "rental"].includes(user?.role);

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/bookings/admin");

      setBookings(response.data.bookings || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch bookings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // Format rental dates without timezone shifting.
  // A date such as "2026-09-05" should remain September 5.
  const formatRentalDate = (dateValue) => {
    if (!dateValue) return "";

    const dateOnly = String(dateValue).slice(0, 10);
    const [year, month, day] = dateOnly.split("-").map(Number);

    if (!year || !month || !day) {
      return "";
    }

    return new Date(year, month - 1, day).toLocaleDateString();
  };

  const updateStatus = async (id, status) => {
    try {
      setUpdatingId(id);

      await api.put(`/bookings/admin/${id}/status`, { status });

      await fetchBookings();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update booking.");
    } finally {
      setUpdatingId(null);
    }
  };

  const renderActions = (booking) => {
    if (!canManage) {
      return (
        <span className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-semibold text-slate-500">
          Read-only
        </span>
      );
    }

    const isUpdating = updatingId === booking._id;

    if (booking.status === "pending") {
      return (
        <>
          <button
            onClick={() => updateStatus(booking._id, "confirmed")}
            disabled={isUpdating}
            className="rounded-xl border border-cyan-400/20 bg-cyan-400/[0.08] px-4 py-2 text-xs font-semibold text-cyan-300 transition hover:border-cyan-400/40 hover:bg-cyan-400/[0.12] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isUpdating ? "Updating..." : "Confirm"}
          </button>

          <button
            onClick={() => updateStatus(booking._id, "cancelled")}
            disabled={isUpdating}
            className="rounded-xl border border-red-400/15 bg-red-400/[0.05] px-4 py-2 text-xs font-semibold text-red-300 transition hover:border-red-400/30 hover:bg-red-400/[0.1] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isUpdating ? "Updating..." : "Cancel"}
          </button>
        </>
      );
    }

    if (booking.status === "confirmed") {
      return (
        <>
          <button
            onClick={() => updateStatus(booking._id, "active")}
            disabled={isUpdating}
            className="rounded-xl border border-emerald-400/20 bg-emerald-400/[0.08] px-4 py-2 text-xs font-semibold text-emerald-300 transition hover:border-emerald-400/40 hover:bg-emerald-400/[0.12] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isUpdating ? "Updating..." : "Start Rental"}
          </button>

          <button
            onClick={() => updateStatus(booking._id, "cancelled")}
            disabled={isUpdating}
            className="rounded-xl border border-red-400/15 bg-red-400/[0.05] px-4 py-2 text-xs font-semibold text-red-300 transition hover:border-red-400/30 hover:bg-red-400/[0.1] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isUpdating ? "Updating..." : "Cancel"}
          </button>
        </>
      );
    }

    if (booking.status === "active") {
      return (
        <button
          onClick={() => updateStatus(booking._id, "completed")}
          disabled={isUpdating}
          className="rounded-xl bg-white px-4 py-2 text-xs font-bold text-slate-950 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isUpdating ? "Updating..." : "Complete"}
        </button>
      );
    }

    return (
      <span className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-semibold text-slate-600">
        No further actions
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#05080d]">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-white/10 border-t-cyan-400" />
          <p className="text-sm text-slate-500">Loading bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#05080d] px-4 py-8 text-white sm:px-6 lg:px-8">
      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-cyan-500/10 blur-[120px]" />
        <div className="absolute -right-40 top-20 h-96 w-96 rounded-full bg-blue-500/10 blur-[120px]" />
        <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-indigo-500/5 blur-[120px]" />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.04),transparent_35%)]" />
      </div>

      <div className="relative mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/[0.06] px-3 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)]" />

            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-300">
              Rental Operations
            </span>
          </div>

          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                Booking Management
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
                {canManage
                  ? "Manage customer rentals, booking status, and vehicle handovers."
                  : "Monitor customer rentals and payment status."}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4 backdrop-blur-sm">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                Total Bookings
              </p>

              <p className="mt-1 text-lg font-bold text-white">
                {bookings.length}
                <span className="ml-1 text-sm font-medium text-slate-500">
                  records
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-2xl border border-red-400/20 bg-red-400/[0.06] p-4">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-red-400/10 text-sm text-red-300">
                !
              </div>

              <div>
                <p className="text-sm font-semibold text-red-200">
                  Unable to load bookings
                </p>

                <p className="mt-1 text-sm text-red-300/70">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Bookings */}
        {bookings.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-12 text-center shadow-2xl shadow-black/20">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04]">
              <svg
                width="26"
                height="26"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                className="text-slate-500"
              >
                <rect x="3" y="4" width="18" height="17" rx="2" />
                <path d="M8 2v4M16 2v4M3 9h18" />
                <path d="M8 13h2M14 13h2M8 17h2" />
              </svg>
            </div>

            <p className="mt-5 text-sm font-semibold text-white">
              No bookings yet
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Customer rental bookings will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => {
              const isUpdating = updatingId === booking._id;

              return (
                <div
                  key={booking._id}
                  className={`group overflow-hidden rounded-2xl border bg-white/[0.03] shadow-2xl shadow-black/20 transition duration-300 ${
                    isUpdating
                      ? "border-cyan-400/20"
                      : "border-white/10 hover:border-white/20"
                  }`}
                >
                  <div className="p-5 sm:p-6">
                    {/* Top row */}
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="flex items-start gap-4">
                        {/* Customer avatar */}
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-400/[0.06] text-sm font-bold text-cyan-300">
                          {booking.user?.name?.charAt(0)?.toUpperCase() || "?"}
                        </div>

                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-600">
                            Customer
                          </p>

                          <p className="mt-1 font-semibold text-white">
                            {booking.user?.name || "Unknown customer"}
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            {booking.user?.email || "No email available"}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <StatusBadge status={booking.status} />
                        <PaymentBadge status={booking.paymentStatus} />
                      </div>
                    </div>

                    {/* Booking details */}
                    <div className="mt-6 grid gap-4 border-t border-white/[0.06] pt-5 sm:grid-cols-2 lg:grid-cols-4">
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-600">
                          Vehicle
                        </p>

                        <p className="mt-2 font-semibold text-slate-200">
                          {booking.vehicle?.make || "Unknown"}{" "}
                          {booking.vehicle?.model || ""}
                        </p>

                        {booking.vehicle?.year && (
                          <p className="mt-1 text-xs text-slate-600">
                            {booking.vehicle.year}
                          </p>
                        )}
                      </div>

                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-600">
                          Rental Period
                        </p>

                        <p className="mt-2 font-semibold text-slate-200">
                          {formatRentalDate(booking.startDate)}
                        </p>

                        <p className="mt-1 text-xs text-slate-600">
                          to {formatRentalDate(booking.endDate)}
                        </p>
                      </div>

                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-600">
                          Booking Total
                        </p>

                        <p className="mt-2 text-lg font-bold text-white">
                          GHS{" "}
                          {Number(booking.totalPrice || 0).toLocaleString()}
                        </p>

                        <p className="mt-1 text-xs text-slate-600">
                          Rental value
                        </p>
                      </div>

                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-600">
                          Payment
                        </p>

                        <p className="mt-2 font-semibold capitalize text-slate-300">
                          {booking.paymentStatus || "Unknown"}
                        </p>

                        <p className="mt-1 text-xs text-slate-600">
                          Payment status
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-white/[0.06] pt-5">
                      <div className="mr-auto flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-slate-600" />

                        <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-600">
                          Booking Actions
                        </span>
                      </div>

                      {renderActions(booking)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer status */}
        <div className="mt-10 border-t border-white/10 pt-5">
          <div className="flex flex-col gap-2 text-xs text-slate-600 sm:flex-row sm:items-center sm:justify-between">
            <p>Ruvasgod Auto · Rental Operations</p>

            <p className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Booking workspace active
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StaffBookings;
