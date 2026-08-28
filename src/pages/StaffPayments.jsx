import { useEffect, useState } from "react";
import api from "../api/axios";

const paymentStatusStyles = {
  paid: "bg-green-100 text-green-700",
  pending: "bg-amber-100 text-amber-700",
  unpaid: "bg-amber-100 text-amber-700",
  failed: "bg-red-100 text-red-700",
  refunded: "bg-slate-200 text-slate-700",
};

function PaymentBadge({ value }) {
  const className = paymentStatusStyles[value] || "bg-slate-100 text-slate-700";

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${className}`}>
      {value}
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

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <p className="text-slate-600">Loading payment records...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">
            Payments
          </h1>

          <p className="mt-2 text-slate-500">
            Read-only view of rental and sale payment status.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg bg-red-50 p-4 text-red-600">
            {error}
          </div>
        )}

        <div className="mb-10">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">
            Rental Payments
          </h2>

          {bookings.length === 0 ? (
            <div className="rounded-2xl bg-white p-8 shadow-sm text-slate-500">
              No rental payments found.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl bg-white shadow">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-5 py-3">Customer</th>
                    <th className="px-5 py-3">Vehicle</th>
                    <th className="px-5 py-3">Amount</th>
                    <th className="px-5 py-3">Reference</th>
                    <th className="px-5 py-3">Payment</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {bookings.map((booking) => (
                    <tr key={booking._id}>
                      <td className="px-5 py-4 font-medium text-slate-900">
                        {booking.user?.name}
                      </td>
                      <td className="px-5 py-4 text-slate-600">
                        {booking.vehicle?.make} {booking.vehicle?.model}
                      </td>
                      <td className="px-5 py-4 text-slate-600">
                        ${booking.totalPrice}
                      </td>
                      <td className="px-5 py-4 text-slate-500 text-xs">
                        {booking.paymentReference || "—"}
                      </td>
                      <td className="px-5 py-4">
                        <PaymentBadge value={booking.paymentStatus} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div>
          <h2 className="mb-4 text-lg font-semibold text-slate-900">
            Sale Payments
          </h2>

          {sales.length === 0 ? (
            <div className="rounded-2xl bg-white p-8 shadow-sm text-slate-500">
              No sale payments found.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl bg-white shadow">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-5 py-3">Customer</th>
                    <th className="px-5 py-3">Vehicle</th>
                    <th className="px-5 py-3">Amount</th>
                    <th className="px-5 py-3">Reference</th>
                    <th className="px-5 py-3">Payment</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {sales.map((sale) => (
                    <tr key={sale._id}>
                      <td className="px-5 py-4 font-medium text-slate-900">
                        {sale.user?.name}
                      </td>
                      <td className="px-5 py-4 text-slate-600">
                        {sale.vehicle?.make} {sale.vehicle?.model}
                      </td>
                      <td className="px-5 py-4 text-slate-600">
                        {sale.currency} {sale.salePrice?.toLocaleString()}
                      </td>
                      <td className="px-5 py-4 text-slate-500 text-xs">
                        {sale.paymentReference || "—"}
                      </td>
                      <td className="px-5 py-4">
                        <PaymentBadge value={sale.paymentStatus} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default StaffPayments;
