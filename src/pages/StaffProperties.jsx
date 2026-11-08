import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { useLanguage } from "../context/LanguageContext";

function StaffProperties() {
  const { t } = useLanguage();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadProperties = useCallback(async () => {
    try {
      const response = await api.get("/properties/staff/all");
      setError("");
      setProperties(Array.isArray(response.data?.properties) ? response.data.properties : []);
    } catch (requestError) {
      setError(requestError.response?.data?.message || (requestError.message?.includes("VITE_API_URL") ? requestError.message : "Unable to load properties. Check your access and connection."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Initial protected API fetch; state updates resolve asynchronously.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadProperties();
  }, [loadProperties]);

  const retry = () => {
    setLoading(true);
    loadProperties();
  };

  return (
    <main className="staff-page min-h-[calc(100vh-4rem)] bg-[#fffdf8] px-4 py-8 sm:px-7 lg:px-10 lg:py-10">
      <div className="mx-auto max-w-7xl">
        <header className="mb-7 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-900">{t("propertyManagement")}</p>
            <h1 className="mt-2 text-3xl font-semibold text-stone-900 sm:text-4xl">{t("properties")}</h1>
            <p className="mt-2 text-sm leading-6 text-stone-600">View and manage property review, verification, images, and publication.</p>
          </div>
          <Link className="button-primary rounded-xl px-5 py-3 text-sm font-bold" to="/staff/properties/new">{t("createProperty")}</Link>
        </header>

        {error && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800" role="alert"><p>{error}</p><button className="mt-2 font-bold underline" onClick={retry} type="button">Try again</button></div>}
        {loading && <div className="space-y-3" aria-label="Loading property records">{Array.from({ length: 5 }, (_, index) => <div className="h-16 animate-pulse rounded-xl bg-stone-200" key={index} />)}</div>}
        {!loading && !error && properties.length === 0 && (
          <div className="rounded-2xl border border-stone-200 bg-white p-10 text-center">
            <h2 className="text-xl font-semibold text-stone-900">{t("noProperties")}</h2>
            <p className="mt-2 text-sm text-stone-600">Create a property record for an owner you are authorized to manage.</p>
          </div>
        )}
        {!loading && !error && properties.length > 0 && (
          <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] border-collapse text-start">
                <thead className="bg-stone-50 text-xs font-bold uppercase tracking-wide text-stone-500">
                  <tr><th className="px-5 py-4 text-start">Property</th><th className="px-5 py-4 text-start">Type</th><th className="px-5 py-4 text-start">Price</th><th className="px-5 py-4 text-start">Verification</th><th className="px-5 py-4 text-start">Listing</th><th className="px-5 py-4 text-end">Manage</th></tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {properties.map((property) => (
                    <tr className="hover:bg-stone-50" key={property._id}>
                      <td className="px-5 py-4"><p className="font-semibold text-stone-900">{property.title}</p><p className="mt-1 text-xs text-stone-500">{[property.address?.city, property.address?.area, property.address?.region].filter(Boolean).join(" · ") || "Location unavailable"}</p></td>
                      <td className="px-5 py-4 text-sm text-stone-700">{property.propertyType}<p className="mt-1 text-xs text-stone-500">{property.listingType}</p></td>
                      <td className="px-5 py-4 text-sm font-semibold text-stone-900">{property.currency || "GHS"} {Number(property.price).toLocaleString("en-GH")}</td>
                      <td className="px-5 py-4"><span className="rounded-full bg-stone-100 px-2.5 py-1 text-xs font-semibold text-stone-700">{property.verificationStatus || "PENDING"}</span></td>
                      <td className="px-5 py-4"><span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-950">{property.listingStatus || "DRAFT"}</span></td>
                      <td className="px-5 py-4 text-end"><Link className="inline-flex min-h-10 items-center rounded-lg border border-stone-300 px-3 text-xs font-bold text-stone-800 hover:border-amber-800 hover:text-amber-900" to={`/staff/properties/${property._id}`}>Manage →</Link></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {!loading && !error && properties.length > 0 && <p className="mt-4 text-xs text-stone-500">{properties.length} property records returned by the staff API.</p>}
      </div>
    </main>
  );
}

export default StaffProperties;
