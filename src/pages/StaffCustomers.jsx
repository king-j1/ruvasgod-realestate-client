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
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <p className="text-slate-600">Loading customers...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">
            Customers
          </h1>

          <p className="mt-2 text-slate-500">
            View customer accounts, bookings, and purchases.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg bg-red-50 p-4 text-red-600">
            {error}
          </div>
        )}

        <div className="mb-6">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-4 py-2.5 sm:w-72"
          />
        </div>

        {filteredCustomers.length === 0 ? (
          <div className="rounded-2xl bg-white p-10 text-center shadow">
            <p className="text-slate-500">No customers found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl bg-white shadow">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3">Name</th>
                  <th className="px-5 py-3">Email</th>
                  <th className="px-5 py-3">Phone</th>
                  <th className="px-5 py-3">Bookings</th>
                  <th className="px-5 py-3">Purchases</th>
                  <th className="px-5 py-3">Joined</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredCustomers.map((customer) => (
                  <tr key={customer._id}>
                    <td className="px-5 py-4 font-medium text-slate-900">
                      {customer.name}
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {customer.email}
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {customer.phone}
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {customer.bookingCount}
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {customer.saleCount}
                    </td>
                    <td className="px-5 py-4 text-slate-500">
                      {customer.createdAt
                        ? new Date(customer.createdAt).toLocaleDateString()
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default StaffCustomers;
