import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../api/axios";
import PropertyCard from "../components/PropertyCard";
import PropertySearch from "../components/PropertySearch";
import { useLanguage } from "../context/LanguageContext";
import {
  filterAndSortProperties,
  readPropertyFilters,
} from "../utils/properties";

const PAGE_SIZE = 9;

function Properties() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [searchParams, setSearchParams] = useSearchParams();
  const { t } = useLanguage();
  const paramsKey = searchParams.toString();
  const filters = useMemo(
    () => readPropertyFilters(new URLSearchParams(paramsKey)),
    [paramsKey],
  );
  const filteredProperties = useMemo(
    () => filterAndSortProperties(properties, filters),
    [properties, filters],
  );
  const pageCount = Math.max(1, Math.ceil(filteredProperties.length / PAGE_SIZE));
  const visibleProperties = filteredProperties.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE,
  );
  const activeFilters = Object.entries(filters).filter(
    ([key, value]) => value && !(key === "sortBy" && value === "newest"),
  );

  const loadProperties = useCallback(async () => {
    try {
      const response = await api.get("/properties");
      setError("");
      setProperties(Array.isArray(response.data?.properties) ? response.data.properties : []);
    } catch (requestError) {
      setError(requestError.message?.includes("VITE_API_URL")
        ? requestError.message
        : t("loadError"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    // Initial public API fetch; state updates resolve asynchronously.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadProperties();
  }, [loadProperties]);

  useEffect(() => {
    // Keep browser back/forward navigation on the first page of new filters.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPage(1);
  }, [paramsKey]);

  const applyFilters = (nextFilters) => {
    setPage(1);
    const params = new URLSearchParams();
    Object.entries(nextFilters).forEach(([key, value]) => {
      if (value && !(key === "sortBy" && value === "newest")) params.set(key, value);
    });
    setSearchParams(params);
  };

  const resetFilters = () => {
    setSearchParams({});
    setPage(1);
  };

  return (
    <main className="min-h-screen bg-[#fffdf8] px-5 py-12 sm:px-8 lg:px-10 lg:py-16">
      <div className="mx-auto max-w-7xl">
        <header className="max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-900">Ruvasgod Real Estate</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-stone-900 sm:text-5xl">{t("properties")}</h1>
          <p className="mt-4 leading-7 text-stone-600">{t("heroDescription")}</p>
        </header>

        <section className="mt-8 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm sm:p-6" aria-label={t("searchTitle")}>
          <PropertySearch key={paramsKey} initialValues={filters} onSearch={applyFilters} />
        </section>

        <section className="mt-8" aria-live="polite">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <p className="font-semibold text-stone-800">
              {loading ? t("loading") : `${filteredProperties.length} ${t("results")}`}
            </p>
            {activeFilters.length > 0 && (
              <button className="text-sm font-bold text-amber-900 underline underline-offset-4" onClick={resetFilters} type="button">
                {t("reset")}
              </button>
            )}
          </div>

          {activeFilters.length > 0 && (
            <ul className="mb-6 flex flex-wrap gap-2" aria-label="Active filters">
              {activeFilters.map(([key, value]) => (
                <li className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-medium text-stone-700" key={key}>
                  {t(key)}: {key === "propertyType" ? t(value === "LAND" ? "land" : "house") : key === "listingType" ? t(value === "RENT" ? "rent" : "sale") : value}
                </li>
              ))}
            </ul>
          )}

          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6" role="alert">
              <p className="font-semibold text-red-900">{error || t("loadError")}</p>
              <button className="mt-3 text-sm font-bold text-red-800 underline" onClick={() => { setLoading(true); loadProperties(); }} type="button">{t("tryAgain")}</button>
            </div>
          )}

          {loading && (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }, (_, index) => (
                <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white" key={index} aria-hidden="true">
                  <div className="aspect-[4/3] animate-pulse bg-stone-200" />
                  <div className="space-y-3 p-5">
                    <div className="h-5 w-2/5 animate-pulse rounded bg-stone-200" />
                    <div className="h-4 w-4/5 animate-pulse rounded bg-stone-100" />
                    <div className="h-4 w-3/5 animate-pulse rounded bg-stone-100" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && !error && filteredProperties.length === 0 && (
            <div className="rounded-2xl border border-stone-200 bg-white px-6 py-14 text-center">
              <h2 className="text-xl font-semibold text-stone-900">{t("noResults")}</h2>
              <p className="mt-2 text-sm text-stone-600">{t("noResultsHint")}</p>
              {activeFilters.length > 0 && <button className="button-primary mt-5 rounded-xl px-5 py-3 text-sm font-bold" onClick={resetFilters} type="button">{t("reset")}</button>}
            </div>
          )}

          {!loading && !error && filteredProperties.length > 0 && (
            <>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {visibleProperties.map((property) => <PropertyCard key={property._id} property={property} />)}
              </div>
              {pageCount > 1 && (
                <nav aria-label="Property result pages" className="mt-9 flex items-center justify-center gap-4">
                  <button className="rounded-lg border border-stone-300 bg-white px-4 py-2 text-sm font-semibold disabled:opacity-40" disabled={page === 1} onClick={() => setPage((current) => current - 1)} type="button">{t("previous")}</button>
                  <span className="text-sm text-stone-600">{t("page")} {page} / {pageCount}</span>
                  <button className="rounded-lg border border-stone-300 bg-white px-4 py-2 text-sm font-semibold disabled:opacity-40" disabled={page === pageCount} onClick={() => setPage((current) => current + 1)} type="button">{t("next")}</button>
                </nav>
              )}
            </>
          )}
        </section>

        <p className="mt-8 text-xs leading-5 text-stone-500">
          Search filters and pages are applied to the properties returned by the public API on this device. The result set may not include every property.
        </p>
      </div>
    </main>
  );
}

export default Properties;
