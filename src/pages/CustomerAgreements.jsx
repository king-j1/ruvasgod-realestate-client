import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";

const STATUSES = [
  "ALL",
  "DRAFT",
  "PENDING_APPROVAL",
  "APPROVED",
  "PENDING_SIGNATURE",
  "ACTIVE",
  "COMPLETED",
  "CANCELLED",
  "TERMINATED",
  "EXPIRED",
];

const STATUS_STYLES = {
  DRAFT: "bg-stone-100 text-stone-700",
  PENDING_APPROVAL: "bg-amber-100 text-amber-800",
  APPROVED: "bg-blue-100 text-blue-800",
  PENDING_SIGNATURE: "bg-purple-100 text-purple-800",
  ACTIVE: "bg-green-100 text-green-800",
  COMPLETED: "bg-emerald-100 text-emerald-800",
  CANCELLED: "bg-red-100 text-red-800",
  TERMINATED: "bg-red-100 text-red-800",
  EXPIRED: "bg-stone-200 text-stone-700",
};

function formatStatus(status) {
  return (status || "UNKNOWN")
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function formatMoney(amount, currency = "GHS") {
  if (amount === null || amount === undefined) return "Not specified";

  return new Intl.NumberFormat("en-GH", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatDate(date) {
  if (!date) return "Not specified";

  return new Intl.DateTimeFormat("en-GH", {
    dateStyle: "medium",
  }).format(new Date(date));
}

function CustomerAgreements() {
  const [agreements, setAgreements] = useState([]);
  const [filter, setFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadAgreements() {
      setLoading(true);
      setError("");

      try {
        const { data } = await api.get("/paims/agreements");

        if (active) {
          setAgreements(Array.isArray(data.agreements) ? data.agreements : []);
        }
      } catch (requestError) {
        if (active) {
          setError(
            requestError.response?.data?.message ||
              "Unable to retrieve your agreements.",
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadAgreements();

    return () => {
      active = false;
    };
  }, []);

  const filteredAgreements =
    filter === "ALL"
      ? agreements
      : agreements.filter((agreement) => agreement.status === filter);

  return (
    <main className="min-h-[70vh] bg-[#fffdf8] px-5 py-12 sm:px-8 lg:px-10 lg:py-16">
      <div className="mx-auto max-w-6xl">
        <header>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-900">
            Ruvasgod Real Estate
          </p>

          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-stone-900 sm:text-4xl">
            My agreements
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-600">
            View your property purchase and rental agreements, review their
            terms and follow their progress.
          </p>
        </header>

        {error && (
          <div
            role="alert"
            className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
          >
            {error}
          </div>
        )}

        <section className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-stone-200 bg-white p-5">
            <p className="text-sm text-stone-500">Total agreements</p>
            <p className="mt-2 text-3xl font-semibold text-stone-900">
              {agreements.length}
            </p>
          </div>

          <div className="rounded-2xl border border-stone-200 bg-white p-5">
            <p className="text-sm text-stone-500">Active agreements</p>
            <p className="mt-2 text-3xl font-semibold text-green-700">
              {agreements.filter((item) => item.status === "ACTIVE").length}
            </p>
          </div>

          <div className="rounded-2xl border border-stone-200 bg-white p-5">
            <p className="text-sm text-stone-500">Awaiting your signature</p>
            <p className="mt-2 text-3xl font-semibold text-purple-700">
              {
                agreements.filter((item) => item.status === "PENDING_SIGNATURE")
                  .length
              }
            </p>
          </div>
        </section>

        <section className="mt-8 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-stone-900">
                Agreement records
              </h2>
              <p className="mt-1 text-sm text-stone-500">
                Your property transaction agreements.
              </p>
            </div>

            <select
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
              aria-label="Filter agreements by status"
              className="min-h-11 rounded-xl border border-stone-300 bg-white px-4 text-sm text-stone-800"
            >
              {STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status === "ALL" ? "All statuses" : formatStatus(status)}
                </option>
              ))}
            </select>
          </div>

          {loading ? (
            <p className="mt-8 text-sm text-stone-500">
              Loading your agreements...
            </p>
          ) : filteredAgreements.length === 0 ? (
            <div className="mt-8 rounded-xl bg-stone-50 px-6 py-12 text-center">
              <h3 className="font-semibold text-stone-800">
                No agreements found
              </h3>
              <p className="mt-2 text-sm text-stone-500">
                {filter === "ALL"
                  ? "Your property agreements will appear here when they are created."
                  : "There are no agreements with this status."}
              </p>

              <Link
                to="/properties"
                className="mt-5 inline-flex min-h-11 items-center rounded-xl bg-amber-700 px-5 py-2 text-sm font-semibold text-white hover:bg-amber-800"
              >
                Browse properties
              </Link>
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              {filteredAgreements.map((agreement) => {
                const property =
                  agreement.property && typeof agreement.property === "object"
                    ? agreement.property
                    : null;

                return (
                  <article
                    key={agreement._id}
                    className="rounded-xl border border-stone-200 p-5 transition hover:border-amber-300 sm:p-6"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wide text-amber-900">
                          {agreement.agreementType === "PURCHASE"
                            ? "Property purchase"
                            : agreement.agreementType === "LEASE"
                              ? "Property lease"
                              : "Rental agreement"}
                        </p>

                        <h3 className="mt-2 text-lg font-semibold text-stone-900">
                          {property?.title || "Property agreement"}
                        </h3>

                        <p className="mt-1 text-sm text-stone-500">
                          Agreement: {agreement.agreementNumber}
                        </p>

                        {property?.address && (
                          <p className="mt-1 text-sm text-stone-500">
                            {[
                              property.address?.street,
                              property.address?.city,
                              property.address?.region,
                            ]
                              .filter(Boolean)
                              .join(", ") ||
                              (typeof property.address === "string"
                                ? property.address
                                : "")}
                          </p>
                        )}
                      </div>

                      <span
                        className={`inline-flex w-fit rounded-full px-3 py-2 text-xs font-semibold ${
                          STATUS_STYLES[agreement.status] ||
                          "bg-stone-100 text-stone-700"
                        }`}
                      >
                        {formatStatus(agreement.status)}
                      </span>
                    </div>

                    <div className="mt-5 grid gap-4 border-t border-stone-100 pt-5 sm:grid-cols-3">
                      <div>
                        <p className="text-xs text-stone-500">Agreed amount</p>
                        <p className="mt-1 font-semibold text-stone-900">
                          {formatMoney(
                            agreement.financialTerms?.agreedAmount,
                            agreement.currency,
                          )}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-stone-500">Start date</p>
                        <p className="mt-1 text-sm font-medium text-stone-800">
                          {formatDate(agreement.startDate)}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-stone-500">Created</p>
                        <p className="mt-1 text-sm font-medium text-stone-800">
                          {formatDate(agreement.createdAt)}
                        </p>
                      </div>
                    </div>

                    <div className="mt-5">
                      <Link
                        to={`/account/agreements/${agreement._id}`}
                        className="inline-flex min-h-11 items-center rounded-xl bg-amber-700 px-5 py-2 text-sm font-semibold text-white hover:bg-amber-800"
                      >
                        View agreement
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          {!loading && (
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-6 text-sm font-semibold text-amber-900 underline underline-offset-4"
            >
              Refresh agreements
            </button>
          )}
        </section>
      </div>
    </main>
  );
}

export default CustomerAgreements;
