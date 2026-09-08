
import { useEffect, useMemo, useState } from "react";
import api from "../api/axios";

function StaffCustomers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/staff/customers");

        setCustomers(response.data.customers || []);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load customers.");
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  const filteredCustomers = useMemo(() => {
    if (!search) return customers;

    return customers.filter(
      (customer) =>
        customer.name?.toLowerCase().includes(search.toLowerCase()) ||
        customer.email?.toLowerCase().includes(search.toLowerCase()),
    );
  }, [customers, search]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#05080d]">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-white/10 border-t-cyan-400" />
          <p className="text-sm text-slate-500">Loading customers...</p>
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

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.04),transparent_35%)]" />
      </div>

      <div className="relative mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/[0.06] px-3 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)]" />

            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-300">
              Customer Operations
            </span>
          </div>

          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                Customers
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
                View customer accounts, rental activity, and vehicle purchases
                from one central workspace.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4 backdrop-blur-sm">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                Showing
              </p>

              <p className="mt-1 text-lg font-bold text-white">
                {filteredCustomers.length}
                <span className="ml-1 text-sm font-medium text-slate-500">
                  customers
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
                  Unable to load customers
                </p>

                <p className="mt-1 text-sm text-red-300/70">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Search */}
        <div className="mb-6 rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-sm">
          <div className="relative max-w-xl">
            <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-slate-500">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" />
              </svg>
            </div>

            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black/20 py-3 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400/40 focus:bg-white/[0.04] focus:ring-2 focus:ring-cyan-400/10"
            />
          </div>
        </div>

        {/* Customer table */}
        {filteredCustomers.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-12 text-center shadow-2xl shadow-black/20">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04]">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                className="text-slate-500"
              >
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>

            <p className="mt-5 text-sm font-semibold text-white">
              No customers found
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Try adjusting your search.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] shadow-2xl shadow-black/20">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="border-b border-white/10 bg-white/[0.025]">
                  <tr>
                    <th className="px-5 py-4 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                      Customer
                    </th>

                    <th className="px-5 py-4 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                      Contact
                    </th>

                    <th className="px-5 py-4 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                      Bookings
                    </th>

                    <th className="px-5 py-4 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                      Purchases
                    </th>

                    <th className="px-5 py-4 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                      Joined
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-white/[0.06]">
                  {filteredCustomers.map((customer) => (
                    <tr
                      key={customer._id}
                      className="group transition hover:bg-white/[0.025]"
                    >
                      {/* Customer */}
                      <td className="px-5 py-5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-400/[0.06] text-sm font-bold text-cyan-300">
                            {customer.name?.charAt(0)?.toUpperCase() || "?"}
                          </div>

                          <div>
                            <p className="font-semibold text-white">
                              {customer.name || "Unknown"}
                            </p>

                            <p className="mt-0.5 text-xs text-slate-600">
                              Customer
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="px-5 py-5">
                        <p className="text-slate-300">
                          {customer.email || "—"}
                        </p>

                        <p className="mt-1 text-xs text-slate-600">
                          {customer.phone || "No phone number"}
                        </p>
                      </td>

                      {/* Bookings */}
                      <td className="px-5 py-5">
                        <span className="inline-flex min-w-10 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1.5 font-semibold text-slate-200">
                          {customer.bookingCount ?? 0}
                        </span>
                      </td>

                      {/* Purchases */}
                      <td className="px-5 py-5">
                        <span className="inline-flex min-w-10 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1.5 font-semibold text-slate-200">
                          {customer.saleCount ?? 0}
                        </span>
                      </td>

                      {/* Joined */}
                      <td className="px-5 py-5 text-slate-500">
                        {customer.createdAt
                          ? new Date(
                              customer.createdAt,
                            ).toLocaleDateString()
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Table footer */}
            <div className="border-t border-white/[0.06] bg-black/10 px-5 py-4">
              <p className="text-xs text-slate-600">
                Showing{" "}
                <span className="font-semibold text-slate-400">
                  {filteredCustomers.length}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-slate-400">
                  {customers.length}
                </span>{" "}
                customers
              </p>
            </div>
          </div>
        )}

        {/* Footer status */}
        <div className="mt-10 border-t border-white/10 pt-5">
          <div className="flex flex-col gap-2 text-xs text-slate-600 sm:flex-row sm:items-center sm:justify-between">
            <p>Ruvasgod Auto · Customer Operations</p>

            <p className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Customer workspace active
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StaffCustomers;
