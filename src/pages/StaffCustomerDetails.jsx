import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../api/axios";

function StaffCustomerDetails() {
  const { id } = useParams();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    api.get(`/staff/customers/${id}`)
      .then(({ data }) => {
        if (active) setCustomer(data.customer || null);
      })
      .catch((requestError) => {
        if (active) {
          setError(requestError.response?.data?.message || "Unable to load this customer account.");
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id]);

  return (
    <main className="staff-page min-h-[calc(100vh-4rem)] bg-[#fffdf8] px-4 py-8 sm:px-7 lg:px-10 lg:py-10">
      <div className="mx-auto max-w-5xl">
        <Link className="text-sm font-semibold text-amber-900 hover:underline" to="/staff/customers">← Back to customers</Link>
        {loading && <p className="mt-8 text-sm text-stone-600" role="status">Loading customer account…</p>}
        {error && <p className="mt-8 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800" role="alert">{error}</p>}
        {!loading && !error && customer && (
          <>
            <header className="mt-6">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-900">Customer account</p>
              <h1 className="mt-2 text-3xl font-semibold text-stone-900">{customer.name}</h1>
            </header>
            <section className="mt-6 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
              <dl className="grid gap-5 sm:grid-cols-2">
                {[
                  ["Email", customer.email],
                  ["Phone", customer.phone],
                  ["Joined", customer.createdAt ? new Date(customer.createdAt).toLocaleDateString() : "Not provided"],
                ].map(([label, value]) => (
                  <div key={label}>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-stone-500">{label}</dt>
                    <dd className="mt-1 break-words text-sm font-medium text-stone-900">{value || "Not provided"}</dd>
                  </div>
                ))}
              </dl>
            </section>
            <section className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-6" aria-labelledby="customer-activity-gap">
              <h2 className="font-semibold text-amber-950" id="customer-activity-gap">Property activity</h2>
              <p className="mt-2 text-sm leading-6 text-amber-950/85">
                The customer API currently exposes account details only. Real-estate enquiries, viewings, and property transactions are not available here.
              </p>
            </section>
          </>
        )}
      </div>
    </main>
  );
}

export default StaffCustomerDetails;
