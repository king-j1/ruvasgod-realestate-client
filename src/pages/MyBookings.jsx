
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

  // Keep date-only rental dates from shifting because of timezone conversion.
  const formatRentalDate = (dateValue) => {
    if (!dateValue) return "";

    const dateOnly = String(dateValue).slice(0, 10);
    const [year, month, day] = dateOnly.split("-").map(Number);

    if (!year || !month || !day) {
      return "";
    }

    return new Date(year, month - 1, day).toLocaleDateString("en-GH", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

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

  const getStatusClasses = (status) => {
    switch (status) {
      case "completed":
        return "border-emerald-400/20 bg-emerald-400/10 text-emerald-300";

      case "cancelled":
        return "border-red-400/20 bg-red-400/10 text-red-300";

      case "overdue":
        return "border-orange-400/20 bg-orange-400/10 text-orange-300";

      case "active":
        return "border-cyan-400/20 bg-cyan-400/10 text-cyan-300";

      case "confirmed":
        return "border-emerald-400/20 bg-emerald-400/10 text-emerald-300";

      default:
        return "border-amber-400/20 bg-amber-400/10 text-amber-300";
    }
  };

  const getPaymentClasses = (paymentStatus) => {
    if (paymentStatus === "paid") {
      return "border-emerald-400/20 bg-emerald-400/10 text-emerald-300";
    }

    if (paymentStatus === "failed") {
      return "border-red-400/20 bg-red-400/10 text-red-300";
    }

    return "border-amber-400/20 bg-amber-400/10 text-amber-300";
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#07090c] text-white">
        <div className="mx-auto flex min-h-screen max-w-6xl items-center justify-center px-6">
          <div className="text-center">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-white/10 border-t-cyan-300" />

            <p className="mt-5 text-sm font-medium text-white/45">
              Loading your bookings...
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#07090c] text-white">
      {/* Background atmosphere */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -right-40 -top-40 h-96 w-96 rounded-full bg-cyan-400/[0.05] blur-3xl" />
        <div className="absolute -left-40 top-1/2 h-96 w-96 rounded-full bg-blue-500/[0.04] blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
        {/* Header */}
        <section className="mb-10">
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-cyan-300/70">
            Ruvasgod Auto
          </p>

          <div className="mt-3 flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <h1 className="text-4xl font-semibold tracking-[-0.04em] text-white sm:text-5xl">
                My Bookings
              </h1>

              <p className="mt-3 max-w-xl text-sm leading-6 text-white/45 sm:text-base">
                Manage your vehicle rentals, payment status, and upcoming
                journeys from one place.
              </p>
            </div>

            <button
              onClick={() => navigate("/vehicles")}
              className="inline-flex w-fit items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-white transition hover:border-white/20 hover:bg-white/[0.08]"
            >
              Browse Vehicles
              <span className="text-cyan-300">→</span>
            </button>
          </div>
        </section>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-2xl border border-red-400/20 bg-red-400/[0.07] p-4 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* Empty state */}
        {bookings.length === 0 ? (
          <section className="overflow-hidden rounded-[2rem] border border-white/[0.08] bg-[#0b0e12]">
            <div className="px-6 py-16 text-center sm:px-10 sm:py-24">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-2xl">
                🚘
              </div>

              <p className="mt-6 text-[10px] font-semibold uppercase tracking-[0.25em] text-cyan-300/60">
                Your garage
              </p>

              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                No bookings yet
              </h2>

              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-white/40">
                You haven't booked a vehicle yet. Explore the Ruvasgod Auto
                fleet and find the right vehicle for your next journey.
              </p>

              <button
                onClick={() => navigate("/vehicles")}
                className="mt-7 rounded-xl bg-white px-6 py-3.5 text-sm font-semibold text-black transition hover:bg-cyan-300 active:scale-[0.98]"
              >
                Explore Fleet
              </button>
            </div>
          </section>
        ) : (
          <div className="space-y-6">
            {bookings.map((booking) => {
              const vehicle = booking.vehicle;

              const image =
                vehicle?.images?.length > 0
                  ? vehicle.images[0]
                  : "https://via.placeholder.com/900x600?text=Ruvasgod+Auto";

              const isPayable =
                booking.paymentStatus === "unpaid" &&
                booking.status === "pending";

              const isPaying = payingId === booking._id;

              return (
                <article
                  key={booking._id}
                  className="group overflow-hidden rounded-[1.75rem] border border-white/[0.08] bg-[#0b0e12] shadow-2xl shadow-black/20 transition duration-500 hover:border-white/[0.14] hover:shadow-black/40"
                >
                  <div className="grid lg:grid-cols-[360px_1fr]">
                    {/* Vehicle image */}
                    <div className="relative min-h-[250px] overflow-hidden bg-[#11151a] lg:min-h-full">
                      <img
                        src={image}
                        alt={`${vehicle?.make || "Vehicle"} ${
                          vehicle?.model || ""
                        }`}
                        className="h-full min-h-[250px] w-full object-cover transition duration-700 ease-out group-hover:scale-[1.035]"
                      />

                      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />

                      <div className="absolute left-5 top-5">
                        <span className="rounded-full border border-white/10 bg-black/45 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/80 backdrop-blur-md">
                          Rental
                        </span>
                      </div>

                      <div className="absolute bottom-5 left-5 right-5">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-300/70">
                          Ruvasgod Auto
                        </p>

                        <p className="mt-1 text-sm font-medium text-white/65">
                          {vehicle?.year} • {vehicle?.type}
                        </p>
                      </div>
                    </div>

                    {/* Booking information */}
                    <div className="p-6 sm:p-7 lg:p-8">
                      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/25">
                            Vehicle
                          </p>

                          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                            {vehicle?.make} {vehicle?.model}
                          </h2>

                          <p className="mt-1 text-sm text-white/35">
                            {vehicle?.year}{" "}
                            <span className="mx-1.5 text-white/15">•</span>{" "}
                            {vehicle?.type}
                          </p>
                        </div>

                        <span
                          className={`inline-flex h-fit w-fit rounded-full border px-3.5 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] ${getStatusClasses(
                            booking.status,
                          )}`}
                        >
                          {booking.status}
                        </span>
                      </div>

                      {/* Booking details */}
                      <div className="mt-7 grid gap-3 sm:grid-cols-3">
                        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4">
                          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/25">
                            Start Date
                          </p>

                          <p className="mt-2 text-sm font-semibold text-white/85">
                            {formatRentalDate(booking.startDate)}
                          </p>
                        </div>

                        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4">
                          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/25">
                            End Date
                          </p>

                          <p className="mt-2 text-sm font-semibold text-white/85">
                            {formatRentalDate(booking.endDate)}
                          </p>
                        </div>

                        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4">
                          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/25">
                            Total
                          </p>

                          <p className="mt-2 text-sm font-semibold text-white/85">
                            GHS{" "}
                            {Number(booking.totalPrice || 0).toLocaleString(
                              "en-GH",
                            )}
                          </p>
                        </div>
                      </div>

                      {/* Payment + actions */}
                      <div className="mt-4 flex flex-col gap-3 border-t border-white/[0.07] pt-5 sm:flex-row sm:flex-wrap sm:items-center">
                        <span
                          className={`inline-flex w-fit rounded-xl border px-4 py-2.5 text-xs font-medium capitalize ${getPaymentClasses(
                            booking.paymentStatus,
                          )}`}
                        >
                          Payment:{" "}
                          <strong className="ml-1 font-semibold">
                            {booking.paymentStatus}
                          </strong>
                        </span>

                        {isPayable && (
                          <button
                            onClick={() => payForBooking(booking._id)}
                            disabled={isPaying}
                            className="rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {isPaying
                              ? "Connecting to Paystack..."
                              : "Pay Now"}
                          </button>
                        )}

                        {booking.status === "pending" &&
                          booking.paymentStatus !== "paid" && (
                            <button
                              onClick={() => cancelBooking(booking._id)}
                              className="rounded-xl border border-red-400/20 bg-red-400/[0.04] px-5 py-2.5 text-sm font-semibold text-red-300 transition hover:bg-red-400/10"
                            >
                              Cancel Booking
                            </button>
                          )}
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}

export default MyBookings;
