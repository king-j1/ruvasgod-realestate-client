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

function StatusBadge({ active, label, tone = "cyan" }) {
  const tones = {
    cyan: "border-cyan-400/20 bg-cyan-400/10 text-cyan-300",
    emerald: "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
    amber: "border-amber-400/20 bg-amber-400/10 text-amber-300",
    red: "border-red-400/20 bg-red-400/10 text-red-300",
    slate: "border-white/10 bg-white/[0.04] text-slate-500",
  };

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] ${
        active ? tones[tone] : tones.slate
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          active
            ? tone === "emerald"
              ? "bg-emerald-400"
              : tone === "amber"
                ? "bg-amber-400"
                : tone === "red"
                  ? "bg-red-400"
                  : "bg-cyan-400"
            : "bg-slate-600"
        }`}
      />
      {label}
    </span>
  );
}

function AdminVehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  const [editingVehicle, setEditingVehicle] = useState(null);
  const [editType, setEditType] = useState(null);
  const [salePrice, setSalePrice] = useState("");
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

  const startEditing = (vehicle, type) => {
    setEditingVehicle(vehicle);
    setEditType(type);
    setSalePrice(vehicle.price || "");
    setRentalPrice(vehicle.rentalPricePerDay || "");
  };

  const cancelEditing = () => {
    setEditingVehicle(null);
    setEditType(null);
    setSalePrice("");
    setRentalPrice("");
  };

  const updateVehicle = async (e) => {
    e.preventDefault();

    const priceValue = editType === "sale" ? salePrice : rentalPrice;

    if (!priceValue || Number(priceValue) <= 0) {
      alert(
        editType === "sale"
          ? "Please enter a valid sale price."
          : "Please enter a valid rental price."
      );
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
          body: JSON.stringify(
            editType === "sale"
              ? { price: Number(salePrice) }
              : { rentalPricePerDay: Number(rentalPrice) }
          ),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Failed to update vehicle");
        return;
      }

      alert("Vehicle updated successfully!");

      setEditingVehicle(null);
      setEditType(null);
      setSalePrice("");
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
      <div className="flex min-h-screen items-center justify-center bg-[#05080d]">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-white/10 border-t-cyan-400" />
          <p className="text-sm text-slate-500">Loading vehicles...</p>
        </div>
      </div>
    );
  }

  const saleCount = vehicles.filter(
    (vehicle) => vehicle.availableForSale
  ).length;

  const rentalCount = vehicles.filter(
    (vehicle) => vehicle.availableForRent
  ).length;

  const featuredCount = vehicles.filter(
    (vehicle) => vehicle.isFeatured
  ).length;

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#05080d] px-4 py-8 text-white sm:px-6 lg:px-8">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-cyan-500/10 blur-[120px]" />
        <div className="absolute -right-40 top-20 h-96 w-96 rounded-full bg-blue-500/10 blur-[120px]" />
        <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-indigo-500/5 blur-[120px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.04),transparent_35%)]" />
      </div>

      <div className="relative mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 border-b border-white/10 pb-7">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/[0.06] px-3 py-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)]" />
                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-300">
                  Fleet Administration
                </span>
              </div>

              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                Manage Vehicles
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
                Manage the Ruvasgod Auto fleet across sales, rentals and
                featured inventory.
              </p>
            </div>

            <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
              <button
                type="button"
                onClick={() => setIsAddVehicleOpen(true)}
                className="rounded-xl border border-cyan-400/20 bg-cyan-400/[0.08] px-5 py-3 text-sm font-semibold text-cyan-300 transition hover:border-cyan-400/40 hover:bg-cyan-400/[0.12]"
              >
                + Add Vehicle
              </button>

              <Link
                to="/admin"
                className="rounded-xl border border-white/10 bg-white/[0.04] px-5 py-3 text-center text-sm font-semibold text-slate-300 transition hover:border-white/20 hover:bg-white/[0.07] hover:text-white"
              >
                Dashboard
              </Link>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 shadow-2xl shadow-black/20">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-600">
              Total Fleet
            </p>

            <p className="mt-3 text-3xl font-bold text-white">
              {vehicles.length}
            </p>

            <p className="mt-1 text-xs text-slate-600">
              Vehicle records
            </p>
          </div>

          <div className="rounded-2xl border border-cyan-400/10 bg-cyan-400/[0.03] p-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-600">
              For Sale
            </p>

            <p className="mt-3 text-3xl font-bold text-cyan-300">
              {saleCount}
            </p>

            <p className="mt-1 text-xs text-slate-600">
              Active sale inventory
            </p>
          </div>

          <div className="rounded-2xl border border-emerald-400/10 bg-emerald-400/[0.03] p-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-600">
              For Rent
            </p>

            <p className="mt-3 text-3xl font-bold text-emerald-300">
              {rentalCount}
            </p>

            <p className="mt-1 text-xs text-slate-600">
              Active rental inventory
            </p>
          </div>

          <div className="rounded-2xl border border-amber-400/10 bg-amber-400/[0.03] p-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-600">
              Featured
            </p>

            <p className="mt-3 text-3xl font-bold text-amber-300">
              {featuredCount}
            </p>

            <p className="mt-1 text-xs text-slate-600">
              Featured vehicles
            </p>
          </div>
        </div>

        {/* Vehicles */}
        {vehicles.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-12 text-center shadow-2xl shadow-black/20">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04]">
              <svg
                width="26"
                height="26"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="text-slate-500"
              >
                <path d="M5 17h14l-1.5-6H6.5L5 17Z" />
                <path d="M7 11l1.5-4h7L17 11" />
                <circle cx="8" cy="18" r="1.5" />
                <circle cx="16" cy="18" r="1.5" />
              </svg>
            </div>

            <p className="mt-5 text-sm font-semibold text-white">
              No vehicles found
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Add your first vehicle to the fleet.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {vehicles.map((vehicle) => (
              <div
                key={vehicle._id}
                className="group overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] shadow-2xl shadow-black/20 transition duration-300 hover:-translate-y-1 hover:border-white/20"
              >
                {/* Image */}
                <div className="relative aspect-[16/10] overflow-hidden border-b border-white/[0.06] bg-[#090d13]">
                  {vehicle.images?.[0] ? (
                    <img
                      src={vehicle.images[0]}
                      alt={`${vehicle.make} ${vehicle.model}`}
                      className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-600">
                        No image
                      </span>
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                  <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                    {vehicle.isFeatured && (
                      <span className="rounded-full border border-amber-400/20 bg-black/60 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-amber-300 backdrop-blur-md">
                        Featured
                      </span>
                    )}
                  </div>

                  <div className="absolute bottom-4 left-4">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-300">
                      {vehicle.condition || "Vehicle"}
                    </p>

                    <p className="mt-1 text-xs text-white/70">
                      {vehicle.location || "Location not specified"}
                    </p>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-bold tracking-tight text-white">
                        {vehicle.make} {vehicle.model}
                      </h2>

                      <p className="mt-1 text-xs font-medium text-slate-500">
                        {vehicle.year} <span className="mx-1.5">•</span>{" "}
                        {vehicle.type}
                      </p>
                    </div>

                    <span className="rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                      {vehicle.fuelType || "N/A"}
                    </span>
                  </div>

                  {/* Pricing */}
                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-white/[0.07] bg-black/20 p-4">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-600">
                        Sale Price
                      </p>

                      <p className="mt-2 text-lg font-bold text-white">
                        {vehicle.availableForSale
                          ? `GHS ${Number(vehicle.price || 0).toLocaleString()}`
                          : "Unavailable"}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-white/[0.07] bg-black/20 p-4">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-600">
                        Rental / Day
                      </p>

                      <p className="mt-2 text-lg font-bold text-white">
                        {vehicle.availableForRent
                          ? `GHS ${Number(
                              vehicle.rentalPricePerDay || 0
                            ).toLocaleString()}`
                          : "Unavailable"}
                      </p>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="mt-4 flex flex-wrap gap-2">
                    <StatusBadge
                      active={vehicle.availableForSale}
                      label="Sale"
                      tone="cyan"
                    />

                    <StatusBadge
                      active={vehicle.availableForRent}
                      label="Rental"
                      tone="emerald"
                    />

                    {vehicle.availableForSale ||
                    vehicle.availableForRent ? (
                      <StatusBadge
                        active
                        label="Inventory Active"
                        tone="emerald"
                      />
                    ) : (
                      <StatusBadge
                        active={false}
                        label="Unavailable"
                        tone="red"
                      />
                    )}
                  </div>

                  {/* Details */}
                  <div className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-white/[0.06] pt-5">
                    <div>
                      <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-slate-700">
                        Transmission
                      </p>

                      <p className="mt-1 text-xs font-medium text-slate-400">
                        {vehicle.transmission || "N/A"}
                      </p>
                    </div>

                    <div>
                      <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-slate-700">
                        Mileage
                      </p>

                      <p className="mt-1 text-xs font-medium text-slate-400">
                        {vehicle.mileage
                          ? `${Number(
                              vehicle.mileage
                            ).toLocaleString()} km`
                          : "N/A"}
                      </p>
                    </div>

                    <div>
                      <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-slate-700">
                        Color
                      </p>

                      <p className="mt-1 text-xs font-medium text-slate-400">
                        {vehicle.color || "N/A"}
                      </p>
                    </div>

                    <div>
                      <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-slate-700">
                        Images
                      </p>

                      <p className="mt-1 text-xs font-medium text-slate-400">
                        {vehicle.images?.length || 0}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-5 flex flex-wrap gap-3 border-t border-white/[0.06] pt-5">
                    {vehicle.availableForSale && (
                      <button
                        onClick={() => startEditing(vehicle, "sale")}
                        className="min-w-[8rem] flex-1 rounded-xl border border-cyan-400/20 bg-cyan-400/[0.07] px-4 py-2.5 text-xs font-semibold text-cyan-300 transition hover:border-cyan-400/40 hover:bg-cyan-400/[0.12]"
                      >
                        Edit Sale
                      </button>
                    )}

                    {vehicle.availableForRent && (
                      <button
                        onClick={() => startEditing(vehicle, "rental")}
                        className="min-w-[8rem] flex-1 rounded-xl border border-cyan-400/20 bg-cyan-400/[0.07] px-4 py-2.5 text-xs font-semibold text-cyan-300 transition hover:border-cyan-400/40 hover:bg-cyan-400/[0.12]"
                      >
                        Edit Rental
                      </button>
                    )}

                    <button
                      onClick={() => deleteVehicle(vehicle._id)}
                      className="min-w-[8rem] flex-1 rounded-xl border border-red-400/15 bg-red-400/[0.04] px-4 py-2.5 text-xs font-semibold text-red-300 transition hover:border-red-400/30 hover:bg-red-400/[0.09]"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Edit Vehicle Modal */}
        {editingVehicle && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
            <div className="w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-[#0a0f16] shadow-2xl shadow-black/50">
              <div className="border-b border-white/[0.07] p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-300">
                      Fleet Update
                    </div>

                    <h2 className="text-2xl font-bold text-white">
                      Edit Vehicle
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      {editingVehicle.make} {editingVehicle.model}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={cancelEditing}
                    className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-semibold text-slate-400 transition hover:bg-white/[0.08] hover:text-white"
                  >
                    Close
                  </button>
                </div>
              </div>

              <form onSubmit={updateVehicle} className="p-6">
                <div>
                  <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-500">
                    {editType === "sale" ? "Sale Price" : "Rental Price Per Day"}
                  </label>

                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-600">
                      GHS
                    </span>

                    <input
                      type="number"
                      min="1"
                      value={editType === "sale" ? salePrice : rentalPrice}
                      onChange={(e) =>
                        editType === "sale"
                          ? setSalePrice(e.target.value)
                          : setRentalPrice(e.target.value)
                      }
                      placeholder={
                        editType === "sale"
                          ? "Enter sale price"
                          : "Enter rental price"
                      }
                      required
                      className="w-full rounded-xl border border-white/10 bg-white/[0.04] py-3 pl-14 pr-4 text-sm text-white outline-none transition placeholder:text-slate-700 focus:border-cyan-400/40 focus:bg-white/[0.06]"
                    />
                  </div>
                </div>

                <div className="mt-6 flex gap-3">
                  <button
                    type="button"
                    onClick={cancelEditing}
                    className="flex-1 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-semibold text-slate-400 transition hover:bg-white/[0.08] hover:text-white"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 rounded-xl border border-cyan-400/20 bg-cyan-400/[0.08] px-4 py-3 text-sm font-semibold text-cyan-300 transition hover:border-cyan-400/40 hover:bg-cyan-400/[0.12] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Add Vehicle Modal */}
        {isAddVehicleOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
            <div className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-3xl border border-white/10 bg-[#0a0f16] shadow-2xl shadow-black/50">
              {/* Modal Header */}
              <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-white/[0.07] bg-[#0a0f16]/95 p-6 backdrop-blur-xl">
                <div>
                  <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-300">
                    Fleet Management
                  </div>

                  <h2 className="text-2xl font-bold text-white">
                    Add Vehicle
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Create a new vehicle listing.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={resetAddVehicleForm}
                  className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-semibold text-slate-400 transition hover:bg-white/[0.08] hover:text-white"
                >
                  Close
                </button>
              </div>

              <form
                onSubmit={submitNewVehicle}
                className="space-y-7 p-6"
              >
                {/* Vehicle Information */}
                <section>
                  <div className="mb-4">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-300">
                      Vehicle Information
                    </p>

                    <p className="mt-1 text-xs text-slate-600">
                      Basic information about the vehicle.
                    </p>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    {[
                      ["make", "Make", "text"],
                      ["model", "Model", "text"],
                      ["year", "Year", "number"],
                      ["mileage", "Mileage", "number"],
                      ["color", "Color", "text"],
                      ["location", "Location", "text"],
                    ].map(([name, label, type]) => (
                      <div key={name}>
                        <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                          {label}
                        </label>

                        <input
                          type={type}
                          name={name}
                          value={newVehicle[name]}
                          onChange={handleCreateFieldChange}
                          min={
                            name === "year"
                              ? "1900"
                              : name === "mileage"
                                ? "0"
                                : undefined
                          }
                          max={name === "year" ? "2100" : undefined}
                          className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-700 focus:border-cyan-400/40 focus:bg-white/[0.06]"
                          required={
                            ["make", "model", "year"].includes(name)
                          }
                        />
                      </div>
                    ))}

                    <div>
                      <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                        Type
                      </label>

                      <select
                        name="type"
                        value={newVehicle.type}
                        onChange={handleCreateFieldChange}
                        className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none focus:border-cyan-400/40"
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
                      <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                        Fuel Type
                      </label>

                      <select
                        name="fuelType"
                        value={newVehicle.fuelType}
                        onChange={handleCreateFieldChange}
                        className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none focus:border-cyan-400/40"
                      >
                        <option value="Petrol">Petrol</option>
                        <option value="Diesel">Diesel</option>
                        <option value="Electric">Electric</option>
                        <option value="Hybrid">Hybrid</option>
                      </select>
                    </div>

                    <div>
                      <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                        Transmission
                      </label>

                      <select
                        name="transmission"
                        value={newVehicle.transmission}
                        onChange={handleCreateFieldChange}
                        className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none focus:border-cyan-400/40"
                      >
                        <option value="Automatic">Automatic</option>
                        <option value="Manual">Manual</option>
                      </select>
                    </div>

                    <div>
                      <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                        Condition
                      </label>

                      <select
                        name="condition"
                        value={newVehicle.condition}
                        onChange={handleCreateFieldChange}
                        className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none focus:border-cyan-400/40"
                      >
                        <option value="New">New</option>
                        <option value="Used">Used</option>
                      </select>
                    </div>
                  </div>
                </section>

                {/* Description */}
                <section>
                  <div className="mb-4">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-300">
                      Description
                    </p>
                  </div>

                  <textarea
                    name="description"
                    value={newVehicle.description}
                    onChange={handleCreateFieldChange}
                    rows="4"
                    placeholder="Describe the vehicle..."
                    className="w-full resize-none rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-700 focus:border-cyan-400/40 focus:bg-white/[0.06]"
                  />
                </section>

                {/* Business Options */}
                <section className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
                  <div className="mb-4">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-300">
                      Business Options
                    </p>

                    <p className="mt-1 text-xs text-slate-600">
                      Decide how this vehicle will be offered.
                    </p>
                  </div>

                  <div className="grid gap-3 md:grid-cols-3">
                    <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-4 transition hover:border-cyan-400/20 hover:bg-cyan-400/[0.03]">
                      <input
                        type="checkbox"
                        name="availableForSale"
                        checked={newVehicle.availableForSale}
                        onChange={handleCreateFieldChange}
                        className="h-4 w-4 accent-cyan-400"
                      />

                      <span className="text-sm font-medium text-slate-300">
                        Available for Sale
                      </span>
                    </label>

                    <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-4 transition hover:border-emerald-400/20 hover:bg-emerald-400/[0.03]">
                      <input
                        type="checkbox"
                        name="availableForRent"
                        checked={newVehicle.availableForRent}
                        onChange={handleCreateFieldChange}
                        className="h-4 w-4 accent-emerald-400"
                      />

                      <span className="text-sm font-medium text-slate-300">
                        Available for Rent
                      </span>
                    </label>

                    <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-4 transition hover:border-amber-400/20 hover:bg-amber-400/[0.03]">
                      <input
                        type="checkbox"
                        name="isFeatured"
                        checked={newVehicle.isFeatured}
                        onChange={handleCreateFieldChange}
                        className="h-4 w-4 accent-amber-400"
                      />

                      <span className="text-sm font-medium text-slate-300">
                        Featured Vehicle
                      </span>
                    </label>
                  </div>
                </section>

                {/* Pricing */}
                {(newVehicle.availableForSale ||
                  newVehicle.availableForRent) && (
                  <section>
                    <div className="mb-4">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-300">
                        Pricing
                      </p>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      {newVehicle.availableForSale && (
                        <div>
                          <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                            Sale Price
                          </label>

                          <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-600">
                              GHS
                            </span>

                            <input
                              type="number"
                              name="price"
                              value={newVehicle.price}
                              onChange={handleCreateFieldChange}
                              min="1"
                              placeholder="Enter sale price"
                              className="w-full rounded-xl border border-white/10 bg-white/[0.04] py-3 pl-14 pr-4 text-sm text-white outline-none focus:border-cyan-400/40"
                            />
                          </div>
                        </div>
                      )}

                      {newVehicle.availableForRent && (
                        <div>
                          <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                            Rental Price Per Day
                          </label>

                          <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-600">
                              GHS
                            </span>

                            <input
                              type="number"
                              name="rentalPricePerDay"
                              value={newVehicle.rentalPricePerDay}
                              onChange={handleCreateFieldChange}
                              min="1"
                              placeholder="Enter rental price"
                              className="w-full rounded-xl border border-white/10 bg-white/[0.04] py-3 pl-14 pr-4 text-sm text-white outline-none focus:border-emerald-400/40"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </section>
                )}

                {/* Images */}
                <section>
                  <div className="mb-4">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-300">
                      Vehicle Images
                    </p>

                    <p className="mt-1 text-xs text-slate-600">
                      Upload one or more images for this vehicle.
                    </p>
                  </div>

                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) =>
                      setSelectedImages(
                        Array.from(e.target.files || [])
                      )
                    }
                    className="w-full rounded-xl border border-dashed border-white/15 bg-white/[0.025] px-4 py-4 text-sm text-slate-400 file:mr-4 file:rounded-lg file:border-0 file:bg-cyan-400/10 file:px-4 file:py-2 file:text-xs file:font-semibold file:text-cyan-300"
                  />

                  {selectedImages.length > 0 && (
                    <div className="mt-3 rounded-xl border border-cyan-400/10 bg-cyan-400/[0.03] px-4 py-3">
                      <p className="text-xs font-medium text-cyan-300">
                        {selectedImages.length} image
                        {selectedImages.length !== 1 ? "s" : ""} selected
                      </p>
                    </div>
                  )}
                </section>

                {/* Actions */}
                <div className="flex flex-col-reverse gap-3 border-t border-white/[0.07] pt-6 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={resetAddVehicleForm}
                    className="rounded-xl border border-white/10 bg-white/[0.04] px-6 py-3 text-sm font-semibold text-slate-400 transition hover:bg-white/[0.08] hover:text-white"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={creatingVehicle}
                    className="rounded-xl border border-cyan-400/20 bg-cyan-400/[0.08] px-6 py-3 text-sm font-semibold text-cyan-300 transition hover:border-cyan-400/40 hover:bg-cyan-400/[0.12] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {creatingVehicle
                      ? "Creating Vehicle..."
                      : "Create Vehicle"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-10 border-t border-white/10 pt-5">
          <div className="flex flex-col gap-2 text-xs text-slate-600 sm:flex-row sm:items-center sm:justify-between">
            <p>Ruvasgod Auto · Fleet Administration</p>

            <p className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.7)]" />
              Fleet workspace active
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminVehicles;