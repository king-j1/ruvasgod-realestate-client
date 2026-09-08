
import { useEffect, useState } from "react";
import api from "../api/axios";

function StaffVehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [editingVehicle, setEditingVehicle] = useState(null);
  const [rentalPrice, setRentalPrice] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/vehicles");

      setVehicles(response.data.vehicles || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load vehicles.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const startEditing = (vehicle) => {
    setEditingVehicle(vehicle);
    setRentalPrice(vehicle.rentalPricePerDay || "");
  };

  const updateVehicle = async (e) => {
    e.preventDefault();

    if (!rentalPrice || Number(rentalPrice) <= 0) {
      alert("Please enter a valid rental price.");
      return;
    }

    try {
      setSaving(true);

      await api.put(`/vehicles/${editingVehicle._id}`, {
        rentalPricePerDay: Number(rentalPrice),
      });

      setEditingVehicle(null);
      setRentalPrice("");

      await fetchVehicles();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update vehicle.");
    } finally {
      setSaving(false);
    }
  };

  const deleteVehicle = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this vehicle?",
    );

    if (!confirmed) return;

    try {
      await api.delete(`/vehicles/${id}`);

      await fetchVehicles();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete vehicle.");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#05080d]">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-white/10 border-t-cyan-400" />
          <p className="text-sm text-slate-500">Loading vehicles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#05080d] px-4 py-8 text-white sm:px-6 lg:px-8">
      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-cyan-500/10 blur-[120px]" />
        <div className="absolute -right-40 top-20 h-96 w-96 rounded-full bg-blue-500/10 blur-[120px]" />
        <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-indigo-500/5 blur-[120px]" />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.04),transparent_35%)]" />
      </div>

      <div className="relative mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/[0.06] px-3 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)]" />

            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-300">
              Fleet Operations
            </span>
          </div>

          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                Vehicle Management
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
                Manage the Ruvasgod Auto fleet, rental pricing, and vehicle
                availability.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4 backdrop-blur-sm">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                Fleet Size
              </p>

              <p className="mt-1 text-lg font-bold text-white">
                {vehicles.length}
                <span className="ml-1 text-sm font-medium text-slate-500">
                  vehicles
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-2xl border border-red-400/20 bg-red-400/[0.06] p-4">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-red-400/10 text-sm text-red-300">
                !
              </div>

              <div>
                <p className="text-sm font-semibold text-red-200">
                  Unable to load vehicles
                </p>

                <p className="mt-1 text-sm text-red-300/70">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Fleet */}
        {vehicles.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-12 text-center shadow-2xl shadow-black/20">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04]">
              <svg
                width="26"
                height="26"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                className="text-slate-500"
              >
                <path d="M5 17h14" />
                <path d="M6 17l1.5-6h9L18 17" />
                <circle cx="8" cy="17" r="1.5" />
                <circle cx="16" cy="17" r="1.5" />
              </svg>
            </div>

            <p className="mt-5 text-sm font-semibold text-white">
              No vehicles found
            </p>

            <p className="mt-1 text-sm text-slate-500">
              The fleet is currently empty.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {vehicles.map((vehicle) => {
              const isAvailableForRent = vehicle.availableForRent;
              const isAvailableForSale = vehicle.availableForSale;

              return (
                <div
                  key={vehicle._id}
                  className="group overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] shadow-2xl shadow-black/20 transition duration-300 hover:-translate-y-1 hover:border-white/20"
                >
                  {/* Image */}
                  <div className="relative h-56 overflow-hidden bg-black/30">
                    {vehicle.images?.[0] ? (
                      <img
                        src={vehicle.images[0]}
                        alt={`${vehicle.make} ${vehicle.model}`}
                        className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-gradient-to-br from-slate-900 to-slate-950">
                        <svg
                          width="42"
                          height="42"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.3"
                          className="text-slate-700"
                        >
                          <path d="M5 17h14" />
                          <path d="M6 17l1.5-6h9L18 17" />
                          <circle cx="8" cy="17" r="1.5" />
                          <circle cx="16" cy="17" r="1.5" />
                        </svg>
                      </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

                    <div className="absolute left-4 top-4">
                      <span
                        className={`rounded-full border px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] backdrop-blur-md ${
                          isAvailableForRent || isAvailableForSale
                            ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
                            : "border-red-400/20 bg-red-400/10 text-red-300"
                        }`}
                      >
                        {isAvailableForRent || isAvailableForSale
                          ? "Active"
                          : "Unavailable"}
                      </span>
                    </div>

                    {vehicle.isFeatured && (
                      <div className="absolute right-4 top-4">
                        <span className="rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-amber-300 backdrop-blur-md">
                          Featured
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-600">
                          {vehicle.type || "Vehicle"}
                        </p>

                        <h2 className="mt-1 text-xl font-bold tracking-tight text-white">
                          {vehicle.make} {vehicle.model}
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                          {vehicle.year}
                        </p>
                      </div>
                    </div>

                    {/* Rental Price */}
                    <div className="mt-5 rounded-xl border border-white/[0.06] bg-black/20 p-4">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-600">
                        Rental Rate
                      </p>

                      <p className="mt-1 text-lg font-bold text-white">
                        {vehicle.rentalPricePerDay
                          ? `GHS ${Number(
                              vehicle.rentalPricePerDay,
                            ).toLocaleString()}/day`
                          : "Rental price not set"}
                      </p>
                    </div>

                    {/* Availability */}
                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <div
                        className={`rounded-xl border px-3 py-3 ${
                          isAvailableForRent
                            ? "border-cyan-400/15 bg-cyan-400/[0.05]"
                            : "border-white/[0.06] bg-white/[0.02]"
                        }`}
                      >
                        <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-600">
                          Rental
                        </p>

                        <p
                          className={`mt-1 text-xs font-semibold ${
                            isAvailableForRent
                              ? "text-cyan-300"
                              : "text-slate-600"
                          }`}
                        >
                          {isAvailableForRent ? "Available" : "Unavailable"}
                        </p>
                      </div>

                      <div
                        className={`rounded-xl border px-3 py-3 ${
                          isAvailableForSale
                            ? "border-emerald-400/15 bg-emerald-400/[0.05]"
                            : "border-white/[0.06] bg-white/[0.02]"
                        }`}
                      >
                        <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-600">
                          Sale
                        </p>

                        <p
                          className={`mt-1 text-xs font-semibold ${
                            isAvailableForSale
                              ? "text-emerald-300"
                              : "text-slate-600"
                          }`}
                        >
                          {isAvailableForSale ? "Available" : "Unavailable"}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-5 flex gap-3">
                      <button
                        onClick={() => startEditing(vehicle)}
                        className="flex-1 rounded-xl border border-cyan-400/20 bg-cyan-400/[0.08] px-4 py-2.5 text-sm font-semibold text-cyan-300 transition hover:border-cyan-400/40 hover:bg-cyan-400/[0.12] hover:text-cyan-200"
                      >
                        Edit Pricing
                      </button>

                      <button
                        onClick={() => deleteVehicle(vehicle._id)}
                        className="flex-1 rounded-xl border border-red-400/15 bg-red-400/[0.05] px-4 py-2.5 text-sm font-semibold text-red-300 transition hover:border-red-400/30 hover:bg-red-400/[0.1]"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer status */}
        <div className="mt-10 border-t border-white/10 pt-5">
          <div className="flex flex-col gap-2 text-xs text-slate-600 sm:flex-row sm:items-center sm:justify-between">
            <p>Ruvasgod Auto · Fleet Operations</p>

            <p className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Fleet workspace active
            </p>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {editingVehicle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-[#0a0f16] shadow-2xl shadow-black/50">
            {/* Modal Header */}
            <div className="border-b border-white/10 px-6 py-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-400">
                    Fleet Pricing
                  </p>

                  <h2 className="mt-1 text-2xl font-bold tracking-tight text-white">
                    Edit Vehicle
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    {editingVehicle.make} {editingVehicle.model}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setEditingVehicle(null)}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-slate-500 transition hover:border-white/20 hover:text-white"
                  aria-label="Close"
                >
                  ×
                </button>
              </div>
            </div>

            {/* Modal Form */}
            <form onSubmit={updateVehicle} className="space-y-5 p-6">
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                  Rental Price Per Day
                </label>

                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-sm font-semibold text-slate-600">
                    GHS
                  </span>

                  <input
                    type="number"
                    min="1"
                    value={rentalPrice}
                    onChange={(e) => setRentalPrice(e.target.value)}
                    placeholder="Enter rental price"
                    required
                    className="w-full rounded-xl border border-white/10 bg-black/20 py-3.5 pl-14 pr-4 text-white outline-none transition placeholder:text-slate-700 focus:border-cyan-400/40 focus:bg-white/[0.04] focus:ring-2 focus:ring-cyan-400/10"
                  />
                </div>
              </div>

              <div className="flex gap-3 border-t border-white/[0.06] pt-5">
                <button
                  type="button"
                  onClick={() => setEditingVehicle(null)}
                  className="flex-1 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-semibold text-slate-400 transition hover:border-white/20 hover:text-white"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 rounded-xl bg-cyan-400 px-4 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default StaffVehicles;
