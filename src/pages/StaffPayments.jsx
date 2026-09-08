
import { useEffect, useState } from "react";
import api from "../api/axios";

const paymentStatusStyles = {
  paid: "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
  pending: "border-amber-400/20 bg-amber-400/10 text-amber-300",
  unpaid: "border-amber-400/20 bg-amber-400/10 text-amber-300",
  failed: "border-red-400/20 bg-red-400/10 text-red-300",
  refunded: "border-slate-400/20 bg-slate-400/10 text-slate-300",
};

function PaymentBadge({ value }) {
  const className =
    paymentStatusStyles[value] ||
    "border-white/10 bg-white/[0.05] text-slate-400";

  return (
    <span
      className={`rounded-full border px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] ${className}`}
    >
      {value || "unknown"}
    </span>
  );
}

function StaffPayments() {
  const [bookings, setBookings] = useState([]);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setLoading(true);
        setError("");

        const [bookingsRes, salesRes] = await Promise.all([
          api.get("/bookings/admin"),
          api.get("/sales/admin"),
        ]);

        setBookings(bookingsRes.data.bookings || []);
        setSales(salesRes.data.sales || []);
      } catch (err) {
        setError(
          err.response?.data?.message || "Failed to load payment records.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, []);

  const totalRentalPayments = bookings.reduce(
    (total, booking) => total + Number(booking.totalPrice || 0),
    0,
  );

  const totalSalePayments = sales.reduce(
    (total, sale) => total + Number(sale.salePrice || 0),
    0,
  );

  const paidRentalPayments = bookings.filter(
    (booking) => booking.paymentStatus === "paid",
  ).length;

  const paidSalePayments = sales.filter(
    (sale) =>
      sale.paymentStatus === "paid" ||
      sale.paymentStatus === "successful",
  ).length;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#05080d]">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-white/10 border-t-cyan-400" />

          <p className="text-sm text-slate-500">
            Loading payment records...
          </p>
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
              Finance Operations
            </span>
          </div>

          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                Payments
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
                Read-only monitoring of rental and vehicle sale payment
                activity.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4 backdrop-blur-sm">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Rentals
                </p>

                <p className="mt-1 text-lg font-bold text-white">
                  {bookings.length}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4 backdrop-blur-sm">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Sales
                </p>

                <p className="mt-1 text-lg font-bold text-white">
                  {sales.length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Summary cards */}
        <div className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 shadow-2xl shadow-black/20">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-600">
              Rental Value
            </p>

            <p className="mt-3 text-2xl font-bold tracking-tight text-white">
              GHS {totalRentalPayments.toLocaleString()}
            </p>

            <p className="mt-1 text-xs text-slate-600">
              Across rental records
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 shadow-2xl shadow-black/20">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-600">
              Vehicle Sales
            </p>

            <p className="mt-3 text-2xl font-bold tracking-tight text-white">
              GHS {totalSalePayments.toLocaleString()}
            </p>

            <p className="mt-1 text-xs text-slate-600">
              Across sale records
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 shadow-2xl shadow-black/20">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-600">
              Paid Rentals
            </p>

            <p className="mt-3 text-2xl font-bold tracking-tight text-emerald-300">
              {paidRentalPayments}
            </p>

            <p className="mt-1 text-xs text-slate-600">
              Confirmed rental payments
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 shadow-2xl shadow-black/20">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-600">
              Paid Sales
            </p>

            <p className="mt-3 text-2xl font-bold tracking-tight text-emerald-300">
              {paidSalePayments}
            </p>

            <p className="mt-1 text-xs text-slate-600">
              Confirmed vehicle payments
            </p>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-8 rounded-2xl border border-red-400/20 bg-red-400/[0.06] p-4">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-red-400/10 text-sm text-red-300">
                !
              </div>

              <div>
                <p className="text-sm font-semibold text-red-200">
                  Unable to load payment records
                </p>

                <p className="mt-1 text-sm text-red-300/70">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Rental payments */}
        <section className="mb-10">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-400">
                Rental Transactions
              </p>

              <h2 className="mt-1 text-xl font-bold text-white">
                Rental Payments
              </h2>
            </div>

            <p className="text-xs text-slate-600">
              {bookings.length} record{bookings.length === 1 ? "" : "s"}
            </p>
          </div>

          {bookings.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-10 text-center">
              <p className="text-sm font-semibold text-white">
                No rental payments found
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Rental payment activity will appear here.
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] shadow-2xl shadow-black/20">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-left text-sm">
                  <thead className="border-b border-white/[0.06] bg-white/[0.02] text-[10px] uppercase tracking-[0.16em] text-slate-600">
                    <tr>
                      <th className="px-5 py-4 font-semibold">Customer</th>
                      <th className="px-5 py-4 font-semibold">Vehicle</th>
                      <th className="px-5 py-4 font-semibold">Amount</th>
                      <th className="px-5 py-4 font-semibold">Reference</th>
                      <th className="px-5 py-4 font-semibold">Payment</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-white/[0.05]">
                    {bookings.map((booking) => (
                      <tr
                        key={booking._id}
                        className="transition hover:bg-white/[0.025]"
                      >
                        <td className="px-5 py-5">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-400/[0.06] text-xs font-bold text-cyan-300">
                              {booking.user?.name
                                ?.charAt(0)
                                ?.toUpperCase() || "?"}
                            </div>

                            <div>
                              <p className="font-semibold text-slate-200">
                                {booking.user?.name || "Unknown customer"}
                              </p>

                              <p className="mt-0.5 text-xs text-slate-600">
                                {booking.user?.email || "No email"}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-5 text-slate-300">
                          <p className="font-medium">
                            {booking.vehicle?.make || "Unknown"}{" "}
                            {booking.vehicle?.model || ""}
                          </p>

                          {booking.vehicle?.year && (
                            <p className="mt-1 text-xs text-slate-600">
                              {booking.vehicle.year}
                            </p>
                          )}
                        </td>

                        <td className="px-5 py-5">
                          <p className="font-bold text-white">
                            GHS{" "}
                            {Number(
                              booking.totalPrice || 0,
                            ).toLocaleString()}
                          </p>
                        </td>

                        <td className="max-w-[220px] px-5 py-5">
                          <p
                            className="truncate font-mono text-xs text-slate-500"
                            title={booking.paymentReference || ""}
                          >
                            {booking.paymentReference || "—"}
                          </p>
                        </td>

                        <td className="px-5 py-5">
                          <PaymentBadge value={booking.paymentStatus} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>

        {/* Sale payments */}
        <section>
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-400">
                Vehicle Transactions
              </p>

              <h2 className="mt-1 text-xl font-bold text-white">
                Sale Payments
              </h2>
            </div>

            <p className="text-xs text-slate-600">
              {sales.length} record{sales.length === 1 ? "" : "s"}
            </p>
          </div>

          {sales.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-10 text-center">
              <p className="text-sm font-semibold text-white">
                No sale payments found
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Vehicle sale payment activity will appear here.
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] shadow-2xl shadow-black/20">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-left text-sm">
                  <thead className="border-b border-white/[0.06] bg-white/[0.02] text-[10px] uppercase tracking-[0.16em] text-slate-600">
                    <tr>
                      <th className="px-5 py-4 font-semibold">Customer</th>
                      <th className="px-5 py-4 font-semibold">Vehicle</th>
                      <th className="px-5 py-4 font-semibold">Amount</th>
                      <th className="px-5 py-4 font-semibold">Reference</th>
                      <th className="px-5 py-4 font-semibold">Payment</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-white/[0.05]">
                    {sales.map((sale) => (
                      <tr
                        key={sale._id}
                        className="transition hover:bg-white/[0.025]"
                      >
                        <td className="px-5 py-5">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-400/[0.06] text-xs font-bold text-cyan-300">
                              {sale.user?.name
                                ?.charAt(0)
                                ?.toUpperCase() || "?"}
                            </div>

                            <div>
                              <p className="font-semibold text-slate-200">
                                {sale.user?.name || "Unknown customer"}
                              </p>

                              <p className="mt-0.5 text-xs text-slate-600">
                                {sale.user?.email || "No email"}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-5 text-slate-300">
                          <p className="font-medium">
                            {sale.vehicle?.make || "Unknown"}{" "}
                            {sale.vehicle?.model || ""}
                          </p>

                          {sale.vehicle?.year && (
                            <p className="mt-1 text-xs text-slate-600">
                              {sale.vehicle.year}
                            </p>
                          )}
                        </td>

                        <td className="px-5 py-5">
                          <p className="font-bold text-white">
                            {sale.currency || "GHS"}{" "}
                            {Number(sale.salePrice || 0).toLocaleString()}
                          </p>
                        </td>

                        <td className="max-w-[220px] px-5 py-5">
                          <p
                            className="truncate font-mono text-xs text-slate-500"
                            title={sale.paymentReference || ""}
                          >
                            {sale.paymentReference || "—"}
                          </p>
                        </td>

                        <td className="px-5 py-5">
                          <PaymentBadge value={sale.paymentStatus} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>

        {/* Footer status */}
        <div className="mt-10 border-t border-white/10 pt-5">
          <div className="flex flex-col gap-2 text-xs text-slate-600 sm:flex-row sm:items-center sm:justify-between">
            <p>Ruvasgod Auto · Finance Operations</p>

            <p className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Payment workspace active · Read-only
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StaffPayments;
