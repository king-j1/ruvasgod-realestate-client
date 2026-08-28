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
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <p className="text-slate-600">Loading vehicles...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">
            Vehicle Management
          </h1>

          <p className="mt-2 text-slate-500">
            Manage vehicles available for rental and sale.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg bg-red-50 p-4 text-red-600">
            {error}
          </div>
        )}

        {vehicles.length === 0 ? (
          <div className="rounded-2xl bg-white p-8 shadow-sm">
            No vehicles found.
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {vehicles.map((vehicle) => (
              <div
                key={vehicle._id}
                className="overflow-hidden rounded-2xl bg-white shadow-sm"
              >
                {vehicle.images?.[0] && (
                  <img
                    src={vehicle.images[0]}
                    alt={`${vehicle.make} ${vehicle.model}`}
                    className="h-48 w-full object-cover"
                  />
                )}

                <div className="p-5">
                  <h2 className="text-xl font-bold">
                    {vehicle.make} {vehicle.model}
                  </h2>

                  <p className="mt-1 text-slate-500">
                    {vehicle.year} • {vehicle.type}
                  </p>

                  <p className="mt-3 text-lg font-bold">
                    {vehicle.rentalPricePerDay
                      ? `$${vehicle.rentalPricePerDay}/day`
                      : "Rental price not set"}
                  </p>

                  <div className="mt-2 flex flex-wrap gap-2">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        vehicle.availableForRent
                          ? "bg-blue-100 text-blue-700"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {vehicle.availableForRent
                        ? "Available for rent"
                        : "Not for rent"}
                    </span>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        vehicle.availableForSale
                          ? "bg-green-100 text-green-700"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {vehicle.availableForSale
                        ? "Available for sale"
                        : "Not for sale"}
                    </span>
                  </div>

                  <div className="mt-5 flex gap-3">
                    <button
                      onClick={() => startEditing(vehicle)}
                      className="flex-1 rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => deleteVehicle(vehicle._id)}
                      className="flex-1 rounded-lg bg-red-600 px-4 py-2 font-semibold text-white"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {editingVehicle && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="text-2xl font-bold text-slate-900">Edit Vehicle</h2>

            <p className="mt-2 text-slate-500">
              {editingVehicle.make} {editingVehicle.model}
            </p>

            <form onSubmit={updateVehicle} className="mt-6 space-y-4">
              <div>
                <label className="mb-1 block font-medium">
                  Rental Price Per Day
                </label>

                <input
                  type="number"
                  min="1"
                  value={rentalPrice}
                  onChange={(e) => setRentalPrice(e.target.value)}
                  placeholder="Enter rental price"
                  required
                  className="w-full rounded-lg border border-slate-300 px-4 py-3"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setEditingVehicle(null)}
                  className="flex-1 rounded-lg border border-slate-300 px-4 py-3 font-semibold"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 rounded-lg bg-slate-900 px-4 py-3 font-semibold text-white disabled:opacity-50"
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
