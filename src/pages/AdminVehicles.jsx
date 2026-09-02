import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const defaultVehicleForm = () => ({
  make: "",
  model: "",
  year: "",
  type: "SUV",
  fuelType: "Petrol",
  transmission: "Automatic",
  mileage: "",
  color: "",
  condition: "New",
  location: "",
  description: "",
  price: "",
  rentalPricePerDay: "",
  availableForSale: true,
  availableForRent: false,
  isFeatured: false,
});

function AdminVehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  const [editingVehicle, setEditingVehicle] = useState(null);
  const [rentalPrice, setRentalPrice] = useState("");
  const [saving, setSaving] = useState(false);

  const [isAddVehicleOpen, setIsAddVehicleOpen] = useState(false);
  const [newVehicle, setNewVehicle] = useState(defaultVehicleForm());
  const [selectedImages, setSelectedImages] = useState([]);
  const [creatingVehicle, setCreatingVehicle] = useState(false);

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

      const response = await fetch(`${API_URL}/api/vehicles/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

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

  const handleCreateFieldChange = (e) => {
    const { name, value, type, checked } = e.target;

    setNewVehicle((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const resetAddVehicleForm = () => {
    setNewVehicle(defaultVehicleForm());
    setSelectedImages([]);
    setIsAddVehicleOpen(false);
  };

  const submitNewVehicle = async (e) => {
    e.preventDefault();

    if (!newVehicle.availableForSale && !newVehicle.availableForRent) {
      alert("Vehicle must be available for at least sale or rental.");
      return;
    }

    if (newVehicle.availableForSale) {
      const salePrice = Number(newVehicle.price);

      if (!newVehicle.price || Number.isNaN(salePrice) || salePrice <= 0) {
        alert("Please enter a valid sale price.");
        return;
      }
    }

    if (newVehicle.availableForRent) {
      const rentalPriceValue = Number(newVehicle.rentalPricePerDay);

      if (
        !newVehicle.rentalPricePerDay ||
        Number.isNaN(rentalPriceValue) ||
        rentalPriceValue <= 0
      ) {
        alert("Please enter a valid rental price per day.");
        return;
      }
    }

    try {
      setCreatingVehicle(true);

      const token = localStorage.getItem("token");

      if (!token) {
        alert("Your session has expired. Please log in again.");
        return;
      }

      const formData = new FormData();

      Object.entries(newVehicle).forEach(([key, value]) => {
        if (value === "" || value === null || value === undefined) {
          return;
        }

        if (typeof value === "boolean") {
          formData.append(key, value ? "true" : "false");
          return;
        }

        if (
          ["year", "mileage", "price", "rentalPricePerDay"].includes(key)
        ) {
          const numericValue = Number(value);

          if (!Number.isNaN(numericValue)) {
            formData.append(key, String(numericValue));
          }
          return;
        }

        formData.append(key, String(value));
      });

      selectedImages.forEach((file) => {
        formData.append("images", file);
      });

      const response = await fetch(`${API_URL}/api/vehicles`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMessage = Array.isArray(data.errors)
          ? data.errors.join(". ")
          : data.message || "Failed to create vehicle";

        alert(errorMessage);
        return;
      }

      alert("Vehicle created successfully!");
      resetAddVehicleForm();
      fetchVehicles();
    } catch (error) {
      console.error("Create vehicle error:", error);
      alert("Something went wrong while creating the vehicle.");
    } finally {
      setCreatingVehicle(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading vehicles...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,_rgba(148,163,184,0.18),_transparent_34%),linear-gradient(135deg,_#f8fafc_0%,_#e2e8f0_100%)] p-4 sm:p-6">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-5 border-b border-slate-200/80 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              Manage Vehicles
            </h1>

            <p className="mt-2 text-sm text-slate-500 sm:text-base">
              Manage vehicles available for sale and rental.
            </p>
          </div>

          <div className="flex w-full items-center gap-3 sm:w-auto">
            <button
              type="button"
              onClick={() => setIsAddVehicleOpen(true)}
              className="flex-1 rounded-lg bg-slate-950 px-4 py-2.5 font-semibold text-white shadow-lg shadow-slate-900/10 transition duration-300 ease-out hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-xl sm:flex-none"
            >
              + Add Vehicle
            </button>

            <Link
              to="/admin"
              className="flex-1 rounded-lg border border-slate-300/80 bg-white/80 px-4 py-2.5 text-center font-semibold text-slate-700 shadow-sm backdrop-blur transition duration-300 ease-out hover:-translate-y-0.5 hover:border-slate-400 hover:bg-white sm:flex-none"
            >
              Dashboard
            </Link>
          </div>
        </div>

        {vehicles.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-slate-200/80 bg-white/80 p-8 shadow-lg shadow-slate-900/5 backdrop-blur">
            No vehicles found.
          </div>
        ) : (
          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {vehicles.map((vehicle) => (
              <div
                key={vehicle._id}
                className="group overflow-hidden rounded-2xl border border-slate-200/80 bg-white/90 shadow-lg shadow-slate-900/5 transition duration-300 ease-out hover:-translate-y-1 hover:border-slate-300 hover:shadow-xl hover:shadow-slate-900/10"
              >
                <div className="flex aspect-[16/10] items-center justify-center overflow-hidden border-b border-slate-200/70 bg-slate-100/80 p-3">
                  {vehicle.images?.[0] ? (
                    <img
                      src={vehicle.images[0]}
                      alt={`${vehicle.make} ${vehicle.model}`}
                      className="h-full w-full object-contain transition duration-500 ease-out group-hover:scale-[1.03]"
                    />
                  ) : (
                    <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                      No image
                    </span>
                  )}
                </div>

                <div className="p-5 sm:p-6">
                  <h2 className="text-xl font-bold tracking-tight text-slate-950">
                    {vehicle.make} {vehicle.model}
                  </h2>

                  <p className="mt-1 text-sm font-medium text-slate-500">
                    {vehicle.year} • {vehicle.type}
                  </p>

                  <div className="mt-5 space-y-2 rounded-xl border border-slate-200/80 bg-slate-50/80 p-4 text-sm">
                    <p className="font-semibold text-slate-800">
                      {vehicle.availableForSale
                        ? `Sale: $${vehicle.price}`
                        : "Sale: Not available"}
                    </p>

                    <p className="font-semibold text-slate-800">
                      {vehicle.availableForRent
                        ? `Rental: $${vehicle.rentalPricePerDay}/day`
                        : "Rental: Not available"}
                    </p>

                    <p className="text-slate-500">
                      {vehicle.availableForRent
                        ? "Available for rent"
                        : "Not available for rent"}
                    </p>

                    <p className="text-slate-500">
                      {vehicle.availableForSale
                        ? "Available for sale"
                        : "Not available for sale"}
                    </p>
                  </div>

                  <div className="mt-5 flex gap-3 border-t border-slate-200/80 pt-5">
                    <button
                      onClick={() => startEditing(vehicle)}
                      className="flex-1 rounded-lg bg-slate-800 px-4 py-2.5 font-semibold text-white transition duration-300 ease-out hover:bg-slate-950 active:scale-[0.98]"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => deleteVehicle(vehicle._id)}
                      className="flex-1 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 font-semibold text-red-700 transition duration-300 ease-out hover:border-red-300 hover:bg-red-100 active:scale-[0.98]"
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

        {isAddVehicleOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
              <div className="mb-6 flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">
                    Add Vehicle
                  </h2>
                  <p className="mt-1 text-slate-500">
                    Create a new vehicle listing.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={resetAddVehicleForm}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700"
                >
                  Close
                </button>
              </div>

              <form onSubmit={submitNewVehicle} className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">
                      Make
                    </label>
                    <input
                      type="text"
                      name="make"
                      value={newVehicle.make}
                      onChange={handleCreateFieldChange}
                      className="w-full rounded-lg border border-slate-300 px-4 py-3"
                      required
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">
                      Model
                    </label>
                    <input
                      type="text"
                      name="model"
                      value={newVehicle.model}
                      onChange={handleCreateFieldChange}
                      className="w-full rounded-lg border border-slate-300 px-4 py-3"
                      required
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">
                      Year
                    </label>
                    <input
                      type="number"
                      name="year"
                      value={newVehicle.year}
                      onChange={handleCreateFieldChange}
                      min="1900"
                      max="2100"
                      className="w-full rounded-lg border border-slate-300 px-4 py-3"
                      required
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">
                      Type
                    </label>
                    <select
                      name="type"
                      value={newVehicle.type}
                      onChange={handleCreateFieldChange}
                      className="w-full rounded-lg border border-slate-300 px-4 py-3"
                    >
                      <option value="SUV">SUV</option>
                      <option value="Sedan">Sedan</option>
                      <option value="Pickup">Pickup</option>
                      <option value="Sports">Sports</option>
                      <option value="Electric">Electric</option>
                      <option value="Luxury">Luxury</option>
                      <option value="Van">Van</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">
                      Fuel Type
                    </label>
                    <select
                      name="fuelType"
                      value={newVehicle.fuelType}
                      onChange={handleCreateFieldChange}
                      className="w-full rounded-lg border border-slate-300 px-4 py-3"
                    >
                      <option value="Petrol">Petrol</option>
                      <option value="Diesel">Diesel</option>
                      <option value="Electric">Electric</option>
                      <option value="Hybrid">Hybrid</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">
                      Transmission
                    </label>
                    <select
                      name="transmission"
                      value={newVehicle.transmission}
                      onChange={handleCreateFieldChange}
                      className="w-full rounded-lg border border-slate-300 px-4 py-3"
                    >
                      <option value="Automatic">Automatic</option>
                      <option value="Manual">Manual</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">
                      Mileage
                    </label>
                    <input
                      type="number"
                      name="mileage"
                      value={newVehicle.mileage}
                      onChange={handleCreateFieldChange}
                      min="0"
                      className="w-full rounded-lg border border-slate-300 px-4 py-3"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">
                      Color
                    </label>
                    <input
                      type="text"
                      name="color"
                      value={newVehicle.color}
                      onChange={handleCreateFieldChange}
                      className="w-full rounded-lg border border-slate-300 px-4 py-3"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">
                      Condition
                    </label>
                    <select
                      name="condition"
                      value={newVehicle.condition}
                      onChange={handleCreateFieldChange}
                      className="w-full rounded-lg border border-slate-300 px-4 py-3"
                    >
                      <option value="New">New</option>
                      <option value="Used">Used</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">
                      Location
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={newVehicle.location}
                      onChange={handleCreateFieldChange}
                      className="w-full rounded-lg border border-slate-300 px-4 py-3"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={newVehicle.description}
                    onChange={handleCreateFieldChange}
                    rows="4"
                    className="w-full rounded-lg border border-slate-300 px-4 py-3"
                  />
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <h3 className="mb-3 text-lg font-semibold text-slate-900">
                    Business Options
                  </h3>

                  <div className="grid gap-4 md:grid-cols-3">
                    <label className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-3">
                      <input
                        type="checkbox"
                        name="availableForSale"
                        checked={newVehicle.availableForSale}
                        onChange={handleCreateFieldChange}
                      />
                      <span className="font-medium text-slate-700">
                        Available for Sale
                      </span>
                    </label>

                    <label className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-3">
                      <input
                        type="checkbox"
                        name="availableForRent"
                        checked={newVehicle.availableForRent}
                        onChange={handleCreateFieldChange}
                      />
                      <span className="font-medium text-slate-700">
                        Available for Rent
                      </span>
                    </label>

                    <label className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-3">
                      <input
                        type="checkbox"
                        name="isFeatured"
                        checked={newVehicle.isFeatured}
                        onChange={handleCreateFieldChange}
                      />
                      <span className="font-medium text-slate-700">
                        Featured Vehicle
                      </span>
                    </label>
                  </div>
                </div>

                {(newVehicle.availableForSale || newVehicle.availableForRent) && (
                  <div className="grid gap-4 md:grid-cols-2">
                    {newVehicle.availableForSale && (
                      <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">
                          Sale Price
                        </label>
                        <input
                          type="number"
                          name="price"
                          value={newVehicle.price}
                          onChange={handleCreateFieldChange}
                          min="1"
                          className="w-full rounded-lg border border-slate-300 px-4 py-3"
                          placeholder="Enter sale price"
                        />
                      </div>
                    )}

                    {newVehicle.availableForRent && (
                      <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">
                          Rental Price Per Day
                        </label>
                        <input
                          type="number"
                          name="rentalPricePerDay"
                          value={newVehicle.rentalPricePerDay}
                          onChange={handleCreateFieldChange}
                          min="1"
                          className="w-full rounded-lg border border-slate-300 px-4 py-3"
                          placeholder="Enter rental price"
                        />
                      </div>
                    )}
                  </div>
                )}

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Vehicle Images
                  </label>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => setSelectedImages(Array.from(e.target.files || []))}
                    className="w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-3"
                  />

                  {selectedImages.length > 0 && (
                    <p className="mt-2 text-sm text-slate-600">
                      {selectedImages.length} image(s) selected.
                    </p>
                  )}
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={resetAddVehicleForm}
                    className="rounded-lg border border-slate-300 px-5 py-3 font-semibold text-slate-700"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={creatingVehicle}
                    className="rounded-lg bg-slate-900 px-5 py-3 font-semibold text-white disabled:opacity-50"
                  >
                    {creatingVehicle ? "Creating..." : "Create Vehicle"}
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