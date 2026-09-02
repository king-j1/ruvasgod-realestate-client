import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

function MyBookings() {
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [payingId, setPayingId] = useState(null);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/bookings/my-bookings");

      setBookings(response.data.bookings || []);
    } catch (error) {
      setError(
        error.response?.data?.message || "Failed to load your bookings.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const cancelBooking = async (bookingId) => {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this booking?",
    );

    if (!confirmed) return;

    try {
      await api.put(`/bookings/${bookingId}/cancel`);

      await fetchBookings();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to cancel booking.");
    }
  };

  const payForBooking = async (bookingId) => {
    try {
      setPayingId(bookingId);
      setError("");

      const response = await api.post("/payments/initialize", {
        bookingId,
        callback_url: `${window.location.origin}/payment/callback`,
      });
      const authorizationUrl = response.data?.payment?.authorizationUrl;

      if (!authorizationUrl) {
        throw new Error("Payment could not be initialized.");
      }

      window.location.href = authorizationUrl;
    } catch (error) {
      console.error("Payment initialization error:", error);

      setError(
        error.response?.data?.message ||
          error.message ||
          "Failed to initialize payment.",
      );

      setPayingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-slate-600">Loading your bookings...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,_rgba(148,163,184,0.16),_transparent_32%),linear-gradient(135deg,_#f8fafc_0%,_#e2e8f0_100%)] px-4 py-8 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight text-slate-950">My Bookings</h1>

          <p className="mt-2 text-slate-500">
            View and manage your vehicle rentals.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg bg-red-50 p-4 text-red-600">
            {error}
          </div>
        )}

        {bookings.length === 0 ? (
          <div className="rounded-2xl bg-white p-10 text-center shadow">
            <h2 className="text-2xl font-semibold text-slate-900">
              No bookings yet
            </h2>

            <p className="mt-2 text-slate-500">
              You haven't booked a vehicle yet.
            </p>

            <button
              onClick={() => navigate("/vehicles")}
              className="mt-6 rounded-lg bg-slate-900 px-6 py-3 font-semibold text-white hover:bg-slate-800"
            >
              Browse Vehicles
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {bookings.map((booking) => {
              const vehicle = booking.vehicle;

              const image =
                vehicle?.images?.length > 0
                  ? vehicle.images[0]
                  : "https://via.placeholder.com/600x400?text=Ruvasgod+Auto";

              const isPayable =
                booking.paymentStatus === "unpaid" &&
                booking.status === "pending";

              return (
                <div
                  key={booking._id}
                  className="group overflow-hidden rounded-2xl border border-slate-200/80 bg-white/90 shadow-lg shadow-slate-900/5 transition duration-300 ease-out hover:-translate-y-1 hover:border-slate-300 hover:shadow-xl hover:shadow-slate-900/10"
                >
                  <div className="grid md:grid-cols-[280px_1fr]">
                    <div className="flex min-h-[220px] items-center justify-center overflow-hidden border-b border-slate-200/70 bg-slate-100/80 p-3 md:border-b-0 md:border-r">
                      <img
                        src={image}
                        alt={`${vehicle?.make} ${vehicle?.model}`}
                        className="max-h-[260px] w-full object-contain transition duration-500 ease-out group-hover:scale-[1.03]"
                      />
                    </div>

                    <div className="p-6">
                      <div className="flex flex-col justify-between gap-4 sm:flex-row">
                        <div>
                            <h2 className="text-2xl font-bold tracking-tight text-slate-950">
                            {vehicle?.make} {vehicle?.model}
                          </h2>

                          <p className="mt-1 text-sm font-medium text-slate-500">
                            {vehicle?.year} • {vehicle?.type}
                          </p>
                        </div>

                        <span
                          className={`h-fit rounded-full px-4 py-2 text-sm font-semibold ${
                            booking.status === "completed"
                              ? "bg-green-100 text-green-700"
                              : booking.status === "cancelled"
                                ? "bg-red-100 text-red-700"
                                : booking.status === "overdue"
                                  ? "bg-orange-100 text-orange-700"
                                  : booking.status === "active"
                                    ? "bg-blue-100 text-blue-700"
                                    : booking.status === "confirmed"
                                      ? "bg-green-100 text-green-700"
                                      : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {booking.status}
                        </span>
                      </div>

                      <div className="mt-6 grid gap-4 sm:grid-cols-3">
                        <div>
                          <p className="text-sm text-slate-500">Start Date</p>

                          <p className="font-semibold">
                            {new Date(booking.startDate).toLocaleDateString()}
                          </p>
                        </div>

                        <div>
                          <p className="text-sm text-slate-500">End Date</p>

                          <p className="font-semibold">
                            {new Date(booking.endDate).toLocaleDateString()}
                          </p>
                        </div>

                        <div>
                          <p className="text-sm text-slate-500">Total</p>

                          <p className="font-semibold">${booking.totalPrice}</p>
                        </div>
                      </div>

                      <div className="mt-6 flex flex-wrap items-center gap-3">
                        <span className="rounded-lg bg-slate-100 px-4 py-2 text-sm">
                          Payment: <strong>{booking.paymentStatus}</strong>
                        </span>

                        {isPayable && (
                          <button
                            onClick={() => payForBooking(booking._id)}
                            disabled={payingId === booking._id}
                            className="rounded-lg bg-green-600 px-5 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {payingId === booking._id
                              ? "Connecting to Paystack..."
                              : "Pay Now"}
                          </button>
                        )}

                        {booking.status === "pending" &&
                          booking.paymentStatus !== "paid" && (
                            <button
                              onClick={() => cancelBooking(booking._id)}
                              className="rounded-lg border border-red-300 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
                            >
                              Cancel Booking
                            </button>
                          )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyBookings;
