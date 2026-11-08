import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import api from "../api/axios";

function Metric({ label, value }) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-stone-600">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-stone-900">{value}</p>
    </div>
  );
}

function StaffDashboard() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const canViewOverview = ["admin", "manager"].includes(user?.role);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(canViewOverview);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    if (!canViewOverview) return () => { active = false; };

    Promise.all([
      api.get("/properties/staff/all"),
      api.get("/staff"),
      api.get("/staff/customers"),
    ]).then(([propertyResponse, staffResponse, customerResponse]) => {
      if (!active) return;
      setData({
        properties: propertyResponse.data?.properties || [],
        staff: staffResponse.data?.staff || [],
        customers: customerResponse.data?.customers || [],
      });
    }).catch((requestError) => {
      if (active) setError(requestError.response?.data?.message || (requestError.message?.includes("VITE_API_URL") ? requestError.message : "Dashboard data is currently unavailable."));
    }).finally(() => {
      if (active) setLoading(false);
    });

    return () => { active = false; };
  }, [canViewOverview]);

  const properties = data?.properties || [];
  const published = properties.filter((property) => property.listingStatus === "PUBLISHED").length;
  const drafts = properties.filter((property) => property.listingStatus === "DRAFT").length;
  const pending = properties.filter((property) =>
    property.listingStatus === "PENDING_REVIEW" ||
    (property.listingStatus !== "DRAFT" &&
      ["PENDING", "UNDER_REVIEW"].includes(property.verificationStatus)),
  ).length;
  const verified = properties.filter((property) => property.verificationStatus === "VERIFIED").length;
  const rejected = properties.filter((property) => property.verificationStatus === "REJECTED").length;
  const suspended = properties.filter((property) => property.verificationStatus === "SUSPENDED").length;

  return (
    <div className="staff-page min-h-[calc(100vh-4rem)] bg-[#fffdf8] px-4 py-8 sm:px-7 lg:px-10 lg:py-10">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-900">Real Estate Operations</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-stone-900 sm:text-4xl">Welcome, {user?.name?.split(" ")[0] || "team"}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-600">
            Manage property listings and supported customer operations from your authorized workspace.
          </p>
        </header>

        {loading && <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Loading dashboard">{Array.from({ length: 4 }, (_, index) => <div className="h-28 animate-pulse rounded-2xl bg-stone-200" key={index} />)}</div>}
        {error && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800" role="alert">{error}</div>}

        {canViewOverview && !loading && !error && data && (
          <section aria-label="Property operations overview">
            <h2 className="mb-4 text-lg font-semibold text-stone-900">{t("propertyOverview")}</h2>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <Metric label={t("staffPropertyRecords")} value={properties.length} />
                <Metric label={t("publishedProperties")} value={published} />
                <Metric label={t("draftProperties")} value={drafts} />
                <Metric label={t("pendingReview")} value={pending} />
                <Metric label={t("verifiedProperties")} value={verified} />
                <Metric label={t("rejectedProperties")} value={rejected} />
                <Metric label={t("suspendedProperties")} value={suspended} />
                <Metric label={t("staffAccounts")} value={data.staff.length} />
                <Metric label={t("customerAccounts")} value={data.customers.length} />
            </div>
          </section>
        )}

        {!canViewOverview && (
          <section className="rounded-2xl border border-stone-200 bg-white p-6 text-sm leading-6 text-stone-700">
            Dashboard property metrics are available to administrators and managers. Use the navigation to access features permitted for your staff role.
          </section>
        )}

        <section className="mt-10">
          <h2 className="mb-4 text-lg font-semibold text-stone-900">{t("workspace")}</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {["admin", "manager"].includes(user?.role) && (
              <Link className="rounded-2xl border border-stone-200 bg-white p-5 font-semibold text-stone-900 shadow-sm hover:border-amber-700" to="/staff/properties">
                {t("manageProperties")} <span aria-hidden="true">→</span>
              </Link>
            )}
            {["admin", "manager"].includes(user?.role) && (
              <Link className="rounded-2xl border border-stone-200 bg-white p-5 font-semibold text-stone-900 shadow-sm hover:border-amber-700" to="/staff/property-verification">
                {t("propertyVerification")} <span aria-hidden="true">→</span>
              </Link>
            )}
            {["admin", "manager", "sales", "rental"].includes(user?.role) && (
              <Link className="rounded-2xl border border-stone-200 bg-white p-5 font-semibold text-stone-900 shadow-sm hover:border-amber-700" to="/staff/customers">
                {t("customers")} <span aria-hidden="true">→</span>
              </Link>
            )}
            {["admin", "manager"].includes(user?.role) && (
              <Link className="rounded-2xl border border-stone-200 bg-white p-5 font-semibold text-stone-900 shadow-sm hover:border-amber-700" to="/staff/staff">
                {t("staffAccounts")} <span aria-hidden="true">→</span>
              </Link>
            )}
          </div>
        </section>
        <p className="mt-10 border-t border-stone-200 pt-5 text-xs leading-5 text-stone-500">
          Property verification requires a verified owner and at least one active verified owner document. Property edits or image changes return the listing to draft and require review and verification again.
        </p>
      </div>
    </div>
  );
}

export default StaffDashboard;
