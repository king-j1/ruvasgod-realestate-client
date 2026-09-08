
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

const PLACEHOLDER_IMAGE =
  "https://via.placeholder.com/900x600?text=Ruvasgod+Auto";

const paymentStatusStyles = {
  paid: "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
  pending: "border-amber-400/20 bg-amber-400/10 text-amber-300",
  unpaid: "border-amber-400/20 bg-amber-400/10 text-amber-300",
  failed: "border-red-400/20 bg-red-400/10 text-red-300",
  refunded: "border-white/10 bg-white/[0.05] text-white/50",
};

const saleStatusStyles = {
  completed: "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
  reserved: "border-cyan-400/20 bg-cyan-400/10 text-cyan-300",
  pending: "border-amber-400/20 bg-amber-400/10 text-amber-300",
  cancelled: "border-red-400/20 bg-red-400/10 text-red-300",
  failed: "border-red-400/20 bg-red-400/10 text-red-300",
  refunded: "border-white/10 bg-white/[0.05] text-white/50",
};

const ownershipStatusStyles = {
  transferred:
    "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
  pending_transfer:
    "border-cyan-400/20 bg-cyan-400/10 text-cyan-300",
  cancelled: "border-red-400/20 bg-red-400/10 text-red-300",
};

function StatusBadge({ label, styleMap, value }) {
  const className =
    styleMap[value] ||
    "border-white/10 bg-white/[0.04] text-white/50";

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3.5 py-2 text-[10px] font-semibold uppercase tracking-[0.14em] ${className}`}
    >
      {label}:{" "}
      <span className="ml-1.5">
        {value?.replace(/_/g, " ") || "—"}
      </span>
    </span>
  );
}

function MyPurchases() {
  const navigate = useNavigate();

  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSales = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/sales/my-sales");

        setSales(response.data.sales || []);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Failed to load your purchases.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchSales();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#07090c] text-white">
        <div className="mx-auto flex min-h-screen max-w-6xl items-center justify-center px-6">
          <div className="text-center">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-white/10 border-t-cyan-300" />

            <p className="mt-5 text-sm font-medium text-white/45">
              Loading your purchases...
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#07090c] text-white">
      {/* Background atmosphere */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -right-40 -top-40 h-96 w-96 rounded-full bg-cyan-400/[0.05] blur-3xl" />

        <div className="absolute -left-40 top-1/2 h-96 w-96 rounded-full bg-blue-500/[0.04] blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
        {/* Header */}
        <section className="mb-10">
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-cyan-300/70">
            Ruvasgod Auto
          </p>

          <div className="mt-3 flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <h1 className="text-4xl font-semibold tracking-[-0.04em] text-white sm:text-5xl">
                My Purchases
              </h1>

              <p className="mt-3 max-w-xl text-sm leading-6 text-white/45 sm:text-base">
                Your vehicle purchases, payment status, and ownership
                information — all in one place.
              </p>
            </div>

            <button
              onClick={() => navigate("/vehicles")}
              className="inline-flex w-fit items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-white transition hover:border-white/20 hover:bg-white/[0.08]"
            >
              Explore Vehicles
              <span className="text-cyan-300">→</span>
            </button>
          </div>
        </section>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-2xl border border-red-400/20 bg-red-400/[0.07] p-4 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* Empty state */}
        {sales.length === 0 ? (
          <section className="overflow-hidden rounded-[2rem] border border-white/[0.08] bg-[#0b0e12]">
            <div className="px-6 py-16 text-center sm:px-10 sm:py-24">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-2xl">
                🚘
              </div>

              <p className="mt-6 text-[10px] font-semibold uppercase tracking-[0.25em] text-cyan-300/60">
                Your garage
              </p>

              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                No purchases yet
              </h2>

              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-white/40">
                You haven't purchased a vehicle yet. Explore the Ruvasgod Auto
                collection and find your next vehicle.
              </p>

              <button
                onClick={() => navigate("/vehicles")}
                className="mt-7 rounded-xl bg-white px-6 py-3.5 text-sm font-semibold text-black transition hover:bg-cyan-300 active:scale-[0.98]"
              >
                Browse Vehicles
              </button>
            </div>
          </section>
        ) : (
          <div className="space-y-6">
            {sales.map((sale) => {
              const vehicle = sale.vehicle;

              const image =
                vehicle?.images?.length > 0
                  ? vehicle.images[0]
                  : PLACEHOLDER_IMAGE;

              return (
                <article
                  key={sale._id}
                  className="group overflow-hidden rounded-[1.75rem] border border-white/[0.08] bg-[#0b0e12] shadow-2xl shadow-black/20 transition duration-500 hover:border-white/[0.14] hover:shadow-black/40"
                >
                  <div className="grid lg:grid-cols-[360px_1fr]">
                    {/* Vehicle image */}
                    <div className="relative min-h-[260px] overflow-hidden bg-[#11151a] lg:min-h-full">
                      <img
                        src={image}
                        alt={`${vehicle?.make || "Vehicle"} ${
                          vehicle?.model || ""
                        }`}
                        className="h-full min-h-[260px] w-full object-cover transition duration-700 ease-out group-hover:scale-[1.035]"
                        onError={(event) => {
                          event.currentTarget.onerror = null;
                          event.currentTarget.src = PLACEHOLDER_IMAGE;
                        }}
                      />

                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

                      <div className="absolute left-5 top-5">
                        <span className="rounded-full border border-white/10 bg-black/45 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/80 backdrop-blur-md">
                          Vehicle Purchase
                        </span>
                      </div>

                      <div className="absolute bottom-5 left-5 right-5">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-300/70">
                          Ruvasgod Auto
                        </p>

                        <p className="mt-1 text-sm font-medium text-white/60">
                          {vehicle?.year}{" "}
                          <span className="mx-1.5 text-white/20">•</span>{" "}
                          {vehicle?.type}
                        </p>
                      </div>
                    </div>

                    {/* Purchase information */}
                    <div className="p-6 sm:p-7 lg:p-8">
                      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/25">
                            Purchased Vehicle
                          </p>

                          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                            {vehicle?.make} {vehicle?.model}
                          </h2>

                          <p className="mt-1 text-sm text-white/35">
                            {vehicle?.year}{" "}
                            <span className="mx-1.5 text-white/15">•</span>{" "}
                            {vehicle?.type}
                          </p>
                        </div>

                        <div className="sm:text-right">
                          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/25">
                            Purchase Price
                          </p>

                          <p className="mt-1 text-2xl font-semibold tracking-tight text-white">
                            {sale.currency || "GHS"}{" "}
                            {Number(sale.salePrice || 0).toLocaleString(
                              "en-GH",
                            )}
                          </p>
                        </div>
                      </div>

                      {/* Status */}
                      <div className="mt-7 flex flex-wrap gap-2">
                        <StatusBadge
                          label="Payment"
                          styleMap={paymentStatusStyles}
                          value={sale.paymentStatus}
                        />

                        <StatusBadge
                          label="Sale"
                          styleMap={saleStatusStyles}
                          value={sale.saleStatus}
                        />

                        <StatusBadge
                          label="Ownership"
                          styleMap={ownershipStatusStyles}
                          value={sale.ownershipStatus}
                        />
                      </div>

                      {/* Purchase date */}
                      <div className="mt-6 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/25">
                          Purchase Date
                        </p>

                        <p className="mt-2 text-sm font-semibold text-white/80">
                          {sale.createdAt
                            ? new Date(sale.createdAt).toLocaleDateString(
                                "en-GH",
                                {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                },
                              )
                            : "—"}
                        </p>
                      </div>

                      {/* Ownership indicator */}
                      {sale.ownershipStatus === "transferred" && (
                        <div className="mt-4 flex items-center gap-3 rounded-2xl border border-emerald-400/15 bg-emerald-400/[0.05] px-4 py-3.5">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-400/10 text-emerald-300">
                            ✓
                          </div>

                          <div>
                            <p className="text-sm font-semibold text-emerald-200">
                              Ownership transferred
                            </p>

                            <p className="mt-0.5 text-xs text-emerald-200/45">
                              This vehicle is registered as transferred to
                              your ownership.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}

export default MyPurchases;
