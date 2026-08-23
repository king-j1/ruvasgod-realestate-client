import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function AdminVehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  const [editingVehicle, setEditingVehicle] = useState(null);
  const [rentalPrice, setRentalPrice] = useState("");
  const [saving, setSaving] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL;

  const fetchVehicles = async () => {
    try {
      const response = await fetch(`${API_URL}/api/vehicles`);
      const data = await response.json();

      if (data.success) {
        setVehicles(data.vehicles || []);
      }
    } catch (error) {
      console.error("Failed to fetch vehicles:", error);
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

  const cancelEditing = () => {
    setEditingVehicle(null);
    setRentalPrice("");
  };

  const updateVehicle = async (e) => {
    e.preventDefault();

    if (!rentalPrice || Number(rentalPrice) <= 0) {
      alert("Please enter a valid rental price.");
      return;
    }

    try {
      setSaving(true);

      const token = localStorage.getItem("token");

      const response = await fetch(
        `${API_URL}/api/vehicles/${editingVehicle._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            rentalPricePerDay: Number(rentalPrice),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Failed to update vehicle");
        return;
      }

      alert("Vehicle updated successfully!");

      setEditingVehicle(null);
      setRentalPrice("");

      fetchVehicles();
    } catch (error) {
      console.error("Update vehicle error:", error);
      alert("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const deleteVehicle = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this vehicle?"
    );

    if (!confirmed) return;

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${API_URL}/api/vehicles/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Failed to delete vehicle");
        return;
      }

      fetchVehicles();
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading vehicles...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-7xl">

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Manage Vehicles
            </h1>

            <p className="mt-2 text-slate-500">
              Manage vehicles available for rental.
            </p>
          </div>

          <Link
            to="/admin"
            className="rounded-lg bg-slate-900 px-4 py-2 text-white"
          >
            Dashboard
          </Link>
        </div>

        {vehicles.length === 0 ? (
          <div className="mt-8 rounded-2xl bg-white p-8">
            No vehicles found.
          </div>
        ) : (
          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">

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
                      : "Price not set"}
                  </p>

                  <p className="mt-2 text-sm">
                    {vehicle.availableForRent
                      ? "Available for rent"
                      : "Not available"}
                  </p>

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

        {editingVehicle && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/50 px-4">

            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">

              <h2 className="text-2xl font-bold text-slate-900">
                Edit Vehicle
              </h2>

              <p className="mt-2 text-slate-500">
                {editingVehicle.make} {editingVehicle.model}
              </p>

              <form
                onSubmit={updateVehicle}
                className="mt-6 space-y-4"
              >

                <div>
                  <label className="mb-1 block font-medium">
                    Rental Price Per Day
                  </label>

                  <input
                    type="number"
                    min="1"
                    value={rentalPrice}
                    onChange={(e) =>
                      setRentalPrice(e.target.value)
                    }
                    placeholder="Enter rental price"
                    required
                    className="w-full rounded-lg border border-slate-300 px-4 py-3"
                  />
                </div>

                <div className="flex gap-3">

                  <button
                    type="button"
                    onClick={cancelEditing}
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
    </div>
  );
}

export default AdminVehicles;