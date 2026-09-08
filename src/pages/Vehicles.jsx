
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import VehicleCard from "../components/VehicleCard";

function Vehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/vehicles");

        setVehicles(response.data?.vehicles || []);
      } catch (error) {
        setError(
          error.response?.data?.message ||
            "We couldn't load the fleet right now."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchVehicles();
  }, []);

  const filteredVehicles = useMemo(() => {
    if (filter === "rent") {
      return vehicles.filter((vehicle) => vehicle.availableForRent);
    }

    if (filter === "buy") {
      return vehicles.filter((vehicle) => vehicle.availableForSale);
    }

    return vehicles;
  }, [vehicles, filter]);

  const rentalCount = vehicles.filter(
    (vehicle) => vehicle.availableForRent
  ).length;

  const saleCount = vehicles.filter(
    (vehicle) => vehicle.availableForSale
  ).length;

  if (loading) {
    return (
      <main className="min-h-screen bg-[#07090c] text-white">
        <section className="mx-auto flex min-h-[75vh] max-w-7xl items-center justify-center px-6">
          <div className="text-center">
            <div className="mx-auto mb-6 h-12 w-12 animate-spin rounded-full border-2 border-white/10 border-t-cyan-400" />

            <p className="text-sm font-medium uppercase tracking-[0.3em] text-white/40">
              Ruvasgod Auto
            </p>

            <p className="mt-3 text-white/70">
              Preparing the fleet...
            </p>
          </div>
        </section>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-[#07090c] text-white">
        <section className="mx-auto flex min-h-[75vh] max-w-3xl items-center justify-center px-6">
          <div className="w-full rounded-3xl border border-red-400/10 bg-white/[0.03] p-8 text-center shadow-2xl backdrop-blur-xl sm:p-12">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-red-400/20 bg-red-400/10 text-red-300">
              !
            </div>

            <h1 className="mt-6 text-2xl font-semibold">
              Fleet unavailable
            </h1>

            <p className="mt-3 text-sm leading-7 text-white/50">
              {error}
            </p>

            <button
              onClick={() => window.location.reload()}
              className="mt-8 rounded-full bg-white px-6 py-3 text-sm font-semibold text-black transition hover:bg-cyan-300"
            >
              Try Again
            </button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#07090c] text-white">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-white/[0.06]">
        <div className="absolute -left-32 top-0 h-96 w-96 rounded-full bg-cyan-400/10 blur-[120px]" />
        <div className="absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-blue-500/10 blur-[120px]" />

        <div className="relative mx-auto max-w-7xl px-6 pb-14 pt-16 sm:px-8 sm:pb-20 sm:pt-20 lg:px-10 lg:pt-24">
          <div className="grid items-end gap-12 lg:grid-cols-[1fr_auto]">
            <div className="max-w-3xl">
              <div className="mb-6 flex items-center gap-3">
                <span className="h-px w-10 bg-cyan-400" />

                <span className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">
                  Ruvasgod Auto
                </span>
              </div>

              <h1 className="text-5xl font-semibold leading-[0.95] tracking-[-0.04em] sm:text-6xl lg:text-8xl">
                The right vehicle.
                <span className="block bg-gradient-to-r from-white via-white to-cyan-300 bg-clip-text text-transparent">
                  The right journey.
                </span>
              </h1>

              <p className="mt-7 max-w-2xl text-base leading-8 text-white/50 sm:text-lg">
                Explore the Ruvasgod fleet for premium rentals and
                vehicles available for purchase. Built around your
                journey, your business, and your next destination.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div className="min-w-[120px] rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5 backdrop-blur-xl">
                <p className="text-3xl font-semibold tracking-tight">
                  {rentalCount}
                </p>

                <p className="mt-1 text-xs uppercase tracking-[0.18em] text-white/35">
                  For Rent
                </p>
              </div>

              <div className="min-w-[120px] rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5 backdrop-blur-xl">
                <p className="text-3xl font-semibold tracking-tight">
                  {saleCount}
                </p>

                <p className="mt-1 text-xs uppercase tracking-[0.18em] text-white/35">
                  For Sale
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Fleet controls */}
      <section className="mx-auto max-w-7xl px-6 pt-8 sm:px-8 lg:px-10">
        <div className="flex flex-col gap-5 border-b border-white/[0.06] pb-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-white/70">
              Our Collection
            </p>

            <p className="mt-1 text-sm text-white/35">
              {filteredVehicles.length}{" "}
              {filteredVehicles.length === 1
                ? "vehicle"
                : "vehicles"}{" "}
              displayed
            </p>
          </div>

          <div className="flex w-full rounded-full border border-white/[0.08] bg-white/[0.03] p-1 sm:w-auto">
            {[
              { id: "all", label: "All Vehicles" },
              { id: "rent", label: "Rent" },
              { id: "buy", label: "Buy" },
            ].map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setFilter(option.id)}
                className={`flex-1 rounded-full px-5 py-2.5 text-xs font-semibold transition sm:flex-none ${
                  filter === option.id
                    ? "bg-white text-black shadow-lg"
                    : "text-white/45 hover:text-white"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Fleet */}
      <section className="mx-auto max-w-7xl px-6 py-10 sm:px-8 sm:py-14 lg:px-10 lg:py-16">
        {filteredVehicles.length === 0 ? (
          <div className="rounded-[2rem] border border-white/[0.07] bg-white/[0.025] px-6 py-20 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.04] text-white/40">
              —
            </div>

            <h2 className="mt-6 text-2xl font-semibold">
              No vehicles in this collection
            </h2>

            <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-white/40">
              There are currently no vehicles matching this
              category. Check another collection or return to the
              complete fleet.
            </p>

            {filter !== "all" && (
              <button
                type="button"
                onClick={() => setFilter("all")}
                className="mt-7 rounded-full bg-white px-6 py-3 text-sm font-semibold text-black transition hover:bg-cyan-300"
              >
                View Entire Fleet
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {filteredVehicles.map((vehicle) => (
              <VehicleCard
                key={vehicle._id}
                vehicle={vehicle}
              />
            ))}
          </div>
        )}
      </section>

      {/* Business CTA */}
      <section className="mx-auto max-w-7xl px-6 pb-20 sm:px-8 lg:px-10">
        <div className="relative overflow-hidden rounded-[2rem] border border-white/[0.08] bg-gradient-to-br from-white/[0.07] to-white/[0.02] p-8 sm:p-12 lg:p-16">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-cyan-400/10 blur-[90px]" />

          <div className="relative grid gap-10 lg:grid-cols-[1fr_auto] lg:items-center">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">
                Built for movement
              </p>

              <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
                Moving for business?
                <span className="block text-white/45">
                  Ruvasgod moves with you.
                </span>
              </h2>

              <p className="mt-5 text-sm leading-7 text-white/45 sm:text-base">
                Whether you're travelling across Ghana, managing a
                business trip, or looking for your next vehicle,
                discover a smarter way to move.
              </p>
            </div>

            <Link
              to="/register"
              className="inline-flex items-center justify-center rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-black transition hover:bg-cyan-300"
            >
              Create Your Account
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

export default Vehicles;
