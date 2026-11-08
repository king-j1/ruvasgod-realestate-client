
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";

function StaffCustomers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const loadCustomers = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.get("/staff/customers");
      setCustomers(Array.isArray(response.data?.customers) ? response.data.customers : []);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Failed to load customers.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Load protected customer records after the screen mounts.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadCustomers();
  }, [loadCustomers]);

  const filteredCustomers = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return customers;

    return customers.filter(
      (customer) =>
        customer.name?.toLowerCase().includes(query) ||
        customer.email?.toLowerCase().includes(query),
    );
  }, [customers, search]);

  return (
    <main className="staff-page min-h-[calc(100vh-4rem)] bg-[#fffdf8] px-4 py-8 sm:px-7 lg:px-10 lg:py-10">
      <div className="mx-auto max-w-7xl">
        <header className="mb-7">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-900">Customer operations</p>
          <h1 className="mt-2 text-3xl font-semibold text-stone-900 sm:text-4xl">Customers</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-600">Search customer account details available through the protected staff API.</p>
        </header>

        <label className="mb-5 block max-w-xl text-sm font-semibold text-stone-700" htmlFor="customer-search">
          Search name or email
          <input className="mt-1.5 min-h-11 w-full rounded-xl border border-stone-300 bg-white px-3.5 text-sm" id="customer-search" type="search" value={search} onChange={(event) => setSearch(event.target.value)} />
        </label>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800" role="alert">
            <p>{error}</p>
            <button className="mt-2 font-semibold underline" onClick={loadCustomers} type="button">Try again</button>
          </div>
        )}
        {loading && <p className="py-8 text-sm text-stone-600" role="status">Loading customers…</p>}
        {!loading && !error && filteredCustomers.length === 0 && (
          <div className="rounded-2xl border border-stone-200 bg-white p-10 text-center">
            <h2 className="font-semibold text-stone-900">{customers.length ? "No customers match your search" : "No customer accounts returned"}</h2>
            <p className="mt-2 text-sm text-stone-600">Customer records shown here come from the backend staff API.</p>
          </div>
        )}
        {!loading && !error && filteredCustomers.length > 0 && (
          <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-start text-sm">
                <thead className="bg-stone-50 text-xs font-bold uppercase tracking-wide text-stone-500">
                  <tr>
                    <th className="px-5 py-4 text-start">Customer</th>
                    <th className="px-5 py-4 text-start">Contact</th>
                    <th className="px-5 py-4 text-start">Joined</th>
                    <th className="px-5 py-4 text-end">Account</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredCustomers.map((customer) => (
                    <tr className="hover:bg-stone-50" key={customer._id}>
                      <td className="px-5 py-4 font-semibold text-stone-900">{customer.name || "Name unavailable"}</td>
                      <td className="px-5 py-4"><p className="text-stone-800">{customer.email || "Email unavailable"}</p><p className="mt-1 text-xs text-stone-500">{customer.phone || "Phone not provided"}</p></td>
                      <td className="px-5 py-4 text-stone-600">{customer.createdAt ? new Date(customer.createdAt).toLocaleDateString() : "Not provided"}</td>
                      <td className="px-5 py-4 text-end"><Link className="inline-flex min-h-9 items-center rounded-lg border border-stone-300 px-3 py-2 text-xs font-semibold text-stone-800 hover:border-amber-800 hover:text-amber-900" to={`/staff/customers/${customer._id}`}>View account</Link></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="border-t border-stone-100 px-5 py-3 text-xs text-stone-500">Showing {filteredCustomers.length} of {customers.length} returned customer accounts.</p>
          </div>
        )}
      </div>
    </main>
  );
}

export default StaffCustomers;
