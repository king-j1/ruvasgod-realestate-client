import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

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
      return <span className="text-sm text-slate-400">Read-only</span>;
    }

    const isUpdating = updatingId === booking._id;

    if (booking.status === "pending") {
      return (
        <>
          <button
            onClick={() => updateStatus(booking._id, "confirmed")}
            disabled={isUpdating}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isUpdating ? "Updating..." : "Confirm"}
          </button>

          <button
            onClick={() => updateStatus(booking._id, "cancelled")}
            disabled={isUpdating}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
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
            className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isUpdating ? "Updating..." : "Start Rental"}
          </button>

          <button
            onClick={() => updateStatus(booking._id, "cancelled")}
            disabled={isUpdating}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
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
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isUpdating ? "Updating..." : "Complete"}
        </button>
      );
    }

    return (
      <span className="text-sm text-slate-400">
        No further actions available
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <p className="text-slate-600">Loading bookings...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-3xl font-bold text-slate-900">
          Booking Management
        </h1>

        <p className="mt-2 text-slate-500">
          {canManage
            ? "View and manage customer vehicle rentals."
            : "View customer vehicle rentals and payment status."}
        </p>

        {error && (
          <div className="mt-6 rounded-lg bg-red-50 p-4 text-red-600">
            {error}
          </div>
        )}

        {bookings.length === 0 ? (
          <div className="mt-8 rounded-2xl bg-white p-8 shadow-sm">
            <p className="text-slate-500">No bookings yet.</p>
          </div>
        ) : (
          <div className="mt-8 space-y-4">
            {bookings.map((booking) => (
              <div
                key={booking._id}
                className="rounded-2xl bg-white p-6 shadow-sm"
              >
                <div className="grid gap-4 md:grid-cols-4">
                  <div>
                    <p className="text-sm text-slate-500">Customer</p>
                    <p className="font-semibold">{booking.user?.name}</p>
                    <p className="text-sm text-slate-500">
                      {booking.user?.email}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-slate-500">Vehicle</p>
                    <p className="font-semibold">
                      {booking.vehicle?.make} {booking.vehicle?.model}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-slate-500">Rental</p>
                    <p className="font-semibold">
                      {new Date(booking.startDate).toLocaleDateString()} →{" "}
                      {new Date(booking.endDate).toLocaleDateString()}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-slate-500">Total</p>
                    <p className="font-semibold">${booking.totalPrice}</p>
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap items-center gap-3 border-t pt-4">
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium">
                    {booking.status}
                  </span>

                  <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium">
                    Payment: {booking.paymentStatus}
                  </span>

                  {renderActions(booking)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default StaffBookings;
