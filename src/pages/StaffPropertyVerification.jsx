import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";

function StaffPropertyVerification() {
  const [properties, setProperties] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadProperties = useCallback(async () => {
    try {
      const { data } = await api.get("/properties/staff/all");
      setProperties(Array.isArray(data?.properties) ? data.properties : []);
      setError("");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to load properties awaiting verification.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Load the authorized staff list after mounting.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadProperties();
  }, [loadProperties]);

  const retry = () => {
    setLoading(true);
    loadProperties();
  };

  const pendingProperties = useMemo(() => {
    const query = search.trim().toLowerCase();
    return properties.filter((property) => {
      const awaitingReview =
        property.verificationStatus === "UNDER_REVIEW" ||
        property.listingStatus === "PENDING_REVIEW";
      const searchableText = [
        property.title,
        property.address?.city,
        property.address?.area,
        property.address?.region,
      ].filter(Boolean).join(" ").toLowerCase();
      return awaitingReview && (!query || searchableText.includes(query));
    });
  }, [properties, search]);

  return (
    <main className="staff-page min-h-[calc(100vh-4rem)] bg-[#fffdf8] px-4 py-8 sm:px-7 lg:px-10 lg:py-10">
      <div className="mx-auto max-w-7xl">
        <header className="mb-7">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-900">Property management</p>
          <h1 className="mt-2 text-3xl font-semibold text-stone-900 sm:text-4xl">Property verification</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-stone-600">
            Review properties submitted for staff verification. The backend remains authoritative for owner and document requirements and every verification decision.
          </p>
        </header>

        <label className="mb-5 block max-w-xl text-sm font-semibold text-stone-700" htmlFor="verification-search">
          Search pending properties
          <input
            className="mt-1.5 min-h-11 w-full rounded-xl border border-stone-300 bg-white px-3.5 text-sm"
            id="verification-search"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Title, city, area or region"
          />
        </label>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800" role="alert">
            <p>{error}</p>
            <button className="mt-2 font-semibold underline" onClick={retry} type="button">Try again</button>
          </div>
        )}
        {loading && <p className="py-8 text-sm text-stone-600" role="status">Loading verification queue…</p>}
        {!loading && !error && pendingProperties.length === 0 && (
          <div className="rounded-2xl border border-stone-200 bg-white p-10 text-center">
            <h2 className="text-xl font-semibold text-stone-900">{search ? "No pending properties match your search" : "No properties awaiting verification"}</h2>
            <p className="mt-2 text-sm text-stone-600">The queue is based on property records returned by the protected staff API.</p>
          </div>
        )}
        {!loading && !error && pendingProperties.length > 0 && (
          <>
            <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-start text-sm">
                  <thead className="bg-stone-50 text-xs font-bold uppercase tracking-wide text-stone-500">
                    <tr>
                      <th className="px-5 py-4 text-start">Property</th>
                      <th className="px-5 py-4 text-start">Verification</th>
                      <th className="px-5 py-4 text-start">Listing</th>
                      <th className="px-5 py-4 text-start">Type</th>
                      <th className="px-5 py-4 text-end">Review</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {pendingProperties.map((property) => (
                      <tr className="hover:bg-stone-50" key={property._id}>
                        <td className="px-5 py-4">
                          <p className="font-semibold text-stone-900">{property.title}</p>
                          <p className="mt-1 text-xs text-stone-500">{[property.address?.city, property.address?.area, property.address?.region].filter(Boolean).join(" · ") || "Location unavailable"}</p>
                        </td>
                        <td className="px-5 py-4"><span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-950">{property.verificationStatus || "PENDING"}</span></td>
                        <td className="px-5 py-4 text-stone-700">{property.listingStatus || "DRAFT"}</td>
                        <td className="px-5 py-4 text-stone-700">{property.propertyType} · {property.listingType}</td>
                        <td className="px-5 py-4 text-end">
                          <Link className="inline-flex min-h-10 items-center rounded-lg border border-stone-300 px-3 text-xs font-bold text-stone-800 hover:border-amber-800 hover:text-amber-900" state={{ from: "/staff/property-verification" }} to={`/staff/properties/${property._id}`}>Review property</Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <p className="mt-4 text-xs text-stone-500">{pendingProperties.length} pending property record{pendingProperties.length === 1 ? "" : "s"} matching this search.</p>
          </>
        )}
      </div>
    </main>
  );
}

export default StaffPropertyVerification;
