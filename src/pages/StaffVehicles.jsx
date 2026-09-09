import { useEffect, useState } from "react";
import api from "../api/axios";

const VEHICLE_TYPES = [
  "SUV",
  "Sedan",
  "Pickup",
  "Sports",
  "Electric",
  "Luxury",
  "Van",
];

const FUEL_TYPES = ["Petrol", "Diesel", "Electric", "Hybrid"];

const TRANSMISSIONS = ["Automatic", "Manual"];

const CONDITIONS = ["New", "Used"];

function StaffVehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [editingVehicle, setEditingVehicle] = useState(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    make: "",
    model: "",
    year: "",
    price: "",
    rentalPricePerDay: "",
    type: "SUV",
    fuelType: "Petrol",
    transmission: "Automatic",
    mileage: "",
    color: "",
    condition: "Used",
    description: "",
    location: "",
    availableForSale: false,
    availableForRent: true,
    isFeatured: false,
  });

  // New images selected from the computer
  const [newImages, setNewImages] = useState([]);

  // Existing image replacements
  // Example: [{ imageIndex: 0, file: File }]
  const [replacementImages, setReplacementImages] = useState([]);

  // Existing image URLs marked for removal
  const [removedImages, setRemovedImages] = useState([]);

  // Preview URLs for newly selected images
  const [newImagePreviews, setNewImagePreviews] = useState([]);

  // Preview URLs for replacement images
  const [replacementPreviews, setReplacementPreviews] = useState({});

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

  // Create safe browser previews for newly selected images
  useEffect(() => {
    const urls = newImages.map((file) => URL.createObjectURL(file));

    setNewImagePreviews(urls);

    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [newImages]);

  // Create safe browser previews for replacement images
  useEffect(() => {
    const urls = {};

    replacementImages.forEach(({ imageIndex, file }) => {
      urls[imageIndex] = URL.createObjectURL(file);
    });

    setReplacementPreviews(urls);

    return () => {
      Object.values(urls).forEach((url) => URL.revokeObjectURL(url));
    };
  }, [replacementImages]);

  const startEditing = (vehicle) => {
    setEditingVehicle(vehicle);

    setForm({
      make: vehicle.make || "",
      model: vehicle.model || "",
      year: vehicle.year || "",
      price: vehicle.price || "",
      rentalPricePerDay: vehicle.rentalPricePerDay || "",
      type: vehicle.type || "SUV",
      fuelType: vehicle.fuelType || "Petrol",
      transmission: vehicle.transmission || "Automatic",
      mileage: vehicle.mileage ?? "",
      color: vehicle.color || "",
      condition: vehicle.condition || "Used",
      description: vehicle.description || "",
      location: vehicle.location || "",
      availableForSale: Boolean(vehicle.availableForSale),
      availableForRent: Boolean(vehicle.availableForRent),
      isFeatured: Boolean(vehicle.isFeatured),
    });

    setNewImages([]);
    setReplacementImages([]);
    setRemovedImages([]);
  };

  const closeEditor = () => {
    if (saving) return;

    setEditingVehicle(null);
    setNewImages([]);
    setReplacementImages([]);
    setRemovedImages([]);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  /*
   * Add new images from the computer.
   *
   * Backend allows a maximum of 10 uploaded files per request.
   * Replacements and new images share that limit.
   */
  const handleImages = (e) => {
    const files = Array.from(e.target.files || []);

    const totalUploads =
      replacementImages.length + files.length;

    if (totalUploads > 10) {
      alert(
        `You can upload up to 10 images per save. You currently have ${replacementImages.length} replacement image(s) selected.`
      );
      e.target.value = "";
      return;
    }

    setNewImages(files);

    // Allows selecting the same file again later
    e.target.value = "";
  };

  const removeNewImage = (index) => {
    setNewImages((current) =>
      current.filter((_, imageIndex) => imageIndex !== index)
    );
  };

  /*
   * Replace one existing vehicle image.
   */
  const handleReplaceImage = (imageIndex, file) => {
    if (!file) return;

    const alreadyReplacing = replacementImages.some(
      (item) => item.imageIndex === imageIndex
    );

    if (!alreadyReplacing && replacementImages.length >= 10) {
      alert("You can upload a maximum of 10 images per save.");
      return;
    }

    setReplacementImages((current) => {
      const existing = current.findIndex(
        (item) => item.imageIndex === imageIndex
      );

      if (existing !== -1) {
        return current.map((item, index) =>
          index === existing
            ? { imageIndex, file }
            : item
        );
      }

      return [...current, { imageIndex, file }];
    });

    // If the image was previously marked for removal,
    // replacing it means we want to keep it.
    setRemovedImages((current) => {
      const imageUrl = editingVehicle?.images?.[imageIndex];

      return current.filter((url) => url !== imageUrl);
    });
  };

  /*
   * Remove an existing vehicle image.
   */
  const handleRemoveExistingImage = (imageIndex) => {
    const imageUrl = editingVehicle?.images?.[imageIndex];

    if (!imageUrl) return;

    setRemovedImages((current) => {
      if (current.includes(imageUrl)) {
        return current;
      }

      return [...current, imageUrl];
    });

    // If this image had a replacement selected,
    // remove that replacement because the image is now being removed.
    setReplacementImages((current) =>
      current.filter(
        (item) => item.imageIndex !== imageIndex
      )
    );
  };

  /*
   * Restore an existing image that was marked for removal.
   */
  const handleRestoreExistingImage = (imageIndex) => {
    const imageUrl = editingVehicle?.images?.[imageIndex];

    if (!imageUrl) return;

    setRemovedImages((current) =>
      current.filter((url) => url !== imageUrl)
    );
  };

  /*
   * Cancel a replacement and return to the original image.
   */
  const handleCancelReplacement = (imageIndex) => {
    setReplacementImages((current) =>
      current.filter(
        (item) => item.imageIndex !== imageIndex
      )
    );
  };

  const updateVehicle = async (e) => {
    e.preventDefault();

    if (!form.make.trim()) {
      alert("Make is required.");
      return;
    }

    if (!form.model.trim()) {
      alert("Model is required.");
      return;
    }

    if (!form.year || Number(form.year) < 1900) {
      alert("Please enter a valid year.");
      return;
    }

    if (!form.availableForSale && !form.availableForRent) {
      alert("Vehicle must be available for sale or rental.");
      return;
    }

    if (
      form.availableForSale &&
      (!form.price || Number(form.price) <= 0)
    ) {
      alert("Please enter a valid sale price.");
      return;
    }

    if (
      form.availableForRent &&
      (!form.rentalPricePerDay ||
        Number(form.rentalPricePerDay) <= 0)
    ) {
      alert("Please enter a valid rental price.");
      return;
    }

    /*
     * Replacements + new images are all uploaded
     * through the same "images" field.
     */
    const totalUploads =
      replacementImages.length + newImages.length;

    if (totalUploads > 10) {
      alert("You can upload a maximum of 10 images per save.");
      return;
    }

    try {
      setSaving(true);

      const formData = new FormData();

      formData.append("make", form.make.trim());
      formData.append("model", form.model.trim());
      formData.append("year", Number(form.year));
      formData.append(
        "price",
        form.price ? Number(form.price) : ""
      );
      formData.append(
        "rentalPricePerDay",
        form.rentalPricePerDay
          ? Number(form.rentalPricePerDay)
          : ""
      );
      formData.append("type", form.type);
      formData.append("fuelType", form.fuelType);
      formData.append("transmission", form.transmission);
      formData.append(
        "mileage",
        form.mileage !== "" ? Number(form.mileage) : ""
      );
      formData.append("color", form.color.trim());
      formData.append("condition", form.condition);
      formData.append(
        "description",
        form.description.trim()
      );
      formData.append("location", form.location.trim());
      formData.append(
        "availableForSale",
        String(form.availableForSale)
      );
      formData.append(
        "availableForRent",
        String(form.availableForRent)
      );
      formData.append(
        "isFeatured",
        String(form.isFeatured)
      );

      /*
       * Build upload files and image actions
       * without mutating React state.
       */
      const filesToUpload = [];
      const actionsToSend = [];

      // Existing image replacements
      replacementImages.forEach(({ imageIndex, file }) => {
        const fileIndex = filesToUpload.length;

        filesToUpload.push(file);

        actionsToSend.push({
          fileIndex,
          action: "replace",
          imageIndex,
        });
      });

      // Brand-new images
      newImages.forEach((file) => {
        const fileIndex = filesToUpload.length;

        filesToUpload.push(file);

        actionsToSend.push({
          fileIndex,
          action: "add",
        });
      });

      // Attach files
      filesToUpload.forEach((file) => {
        formData.append("images", file);
      });

      // Tell backend exactly what each uploaded file means
      if (actionsToSend.length > 0) {
        formData.append(
          "imageActions",
          JSON.stringify(actionsToSend)
        );
      }

      // Tell backend which existing images to remove
      if (removedImages.length > 0) {
        formData.append(
          "removeImages",
          JSON.stringify(removedImages)
        );
      }

      await api.put(
        `/vehicles/${editingVehicle._id}`,
        formData
      );

      setEditingVehicle(null);
      setNewImages([]);
      setReplacementImages([]);
      setRemovedImages([]);

      await fetchVehicles();
    } catch (err) {
      const message =
        err.response?.data?.errors?.join("\n") ||
        err.response?.data?.message ||
        "Failed to update vehicle.";

      alert(message);
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
      await api.delete(`/vehicles/${id}`);

      await fetchVehicles();
    } catch (err) {
      alert(
        err.response?.data?.message ||
          "Failed to delete vehicle."
      );
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#05080d]">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-white/10 border-t-cyan-400" />
          <p className="text-sm text-slate-500">
            Loading vehicles...
          </p>
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
                Manage the Ruvasgod Auto fleet, vehicle information,
                pricing, availability, and images.
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

                <p className="mt-1 whitespace-pre-line text-sm text-red-300/70">
                  {error}
                </p>
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
              const isAvailableForRent =
                vehicle.availableForRent;
              const isAvailableForSale =
                vehicle.availableForSale;

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
                          isAvailableForRent ||
                          isAvailableForSale
                            ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
                            : "border-red-400/20 bg-red-400/10 text-red-300"
                        }`}
                      >
                        {isAvailableForRent ||
                        isAvailableForSale
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

                    {/* Pricing */}
                    <div className="mt-5 grid grid-cols-2 gap-2">
                      <div className="rounded-xl border border-white/[0.06] bg-black/20 p-4">
                        <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-slate-600">
                          Sale Price
                        </p>

                        <p className="mt-1 text-sm font-bold text-white">
                          {vehicle.price
                            ? `GHS ${Number(
                                vehicle.price
                              ).toLocaleString()}`
                            : "Not set"}
                        </p>
                      </div>

                      <div className="rounded-xl border border-white/[0.06] bg-black/20 p-4">
                        <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-slate-600">
                          Rental / Day
                        </p>

                        <p className="mt-1 text-sm font-bold text-white">
                          {vehicle.rentalPricePerDay
                            ? `GHS ${Number(
                                vehicle.rentalPricePerDay
                              ).toLocaleString()}`
                            : "Not set"}
                        </p>
                      </div>
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
                          {isAvailableForRent
                            ? "Available"
                            : "Unavailable"}
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
                          {isAvailableForSale
                            ? "Available"
                            : "Unavailable"}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-5 flex gap-3">
                      <button
                        onClick={() =>
                          startEditing(vehicle)
                        }
                        className="flex-1 rounded-xl border border-cyan-400/20 bg-cyan-400/[0.08] px-4 py-2.5 text-sm font-semibold text-cyan-300 transition hover:border-cyan-400/40 hover:bg-cyan-400/[0.12] hover:text-cyan-200"
                      >
                        Edit Vehicle
                      </button>

                      <button
                        onClick={() =>
                          deleteVehicle(vehicle._id)
                        }
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

      {/* Full Vehicle Edit Modal */}
      {editingVehicle && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 px-4 py-6 backdrop-blur-sm sm:py-10">
          <div className="mx-auto w-full max-w-3xl overflow-hidden rounded-3xl border border-white/10 bg-[#0a0f16] shadow-2xl shadow-black/60">
            {/* Modal Header */}
            <div className="border-b border-white/10 px-6 py-5 sm:px-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-400">
                    Fleet Management
                  </p>

                  <h2 className="mt-1 text-2xl font-bold tracking-tight text-white sm:text-3xl">
                    Edit Vehicle
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Update vehicle information, pricing, availability,
                    and images.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={closeEditor}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-slate-500 transition hover:border-white/20 hover:text-white"
                  aria-label="Close"
                >
                  ×
                </button>
              </div>
            </div>

            {/* Form */}
            <form
              onSubmit={updateVehicle}
              className="p-6 sm:p-8"
            >
              <div className="space-y-7">
                {/* Basic Information */}
                <section>
                  <div className="mb-4">
                    <p className="text-sm font-semibold text-white">
                      Basic Information
                    </p>

                    <p className="mt-1 text-xs text-slate-600">
                      Core vehicle identification and specifications.
                    </p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                        Make
                      </label>

                      <input
                        name="make"
                        value={form.make}
                        onChange={handleChange}
                        required
                        className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-700 focus:border-cyan-400/40 focus:ring-2 focus:ring-cyan-400/10"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                        Model
                      </label>

                      <input
                        name="model"
                        value={form.model}
                        onChange={handleChange}
                        required
                        className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-700 focus:border-cyan-400/40 focus:ring-2 focus:ring-cyan-400/10"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                        Year
                      </label>

                      <input
                        name="year"
                        type="number"
                        min="1900"
                        max={new Date().getFullYear() + 1}
                        value={form.year}
                        onChange={handleChange}
                        required
                        className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400/40 focus:ring-2 focus:ring-cyan-400/10"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                        Vehicle Type
                      </label>

                      <select
                        name="type"
                        value={form.type}
                        onChange={handleChange}
                        className="w-full rounded-xl border border-white/10 bg-[#0d131c] px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400/40 focus:ring-2 focus:ring-cyan-400/10"
                      >
                        {VEHICLE_TYPES.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                        Fuel Type
                      </label>

                      <select
                        name="fuelType"
                        value={form.fuelType}
                        onChange={handleChange}
                        className="w-full rounded-xl border border-white/10 bg-[#0d131c] px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400/40 focus:ring-2 focus:ring-cyan-400/10"
                      >
                        {FUEL_TYPES.map((fuel) => (
                          <option key={fuel} value={fuel}>
                            {fuel}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                        Transmission
                      </label>

                      <select
                        name="transmission"
                        value={form.transmission}
                        onChange={handleChange}
                        className="w-full rounded-xl border border-white/10 bg-[#0d131c] px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400/40 focus:ring-2 focus:ring-cyan-400/10"
                      >
                        {TRANSMISSIONS.map(
                          (transmission) => (
                            <option
                              key={transmission}
                              value={transmission}
                            >
                              {transmission}
                            </option>
                          )
                        )}
                      </select>
                    </div>

                    <div>
                      <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                        Mileage
                      </label>

                      <input
                        name="mileage"
                        type="number"
                        min="0"
                        value={form.mileage}
                        onChange={handleChange}
                        placeholder="e.g. 45000"
                        className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-700 focus:border-cyan-400/40 focus:ring-2 focus:ring-cyan-400/10"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                        Color
                      </label>

                      <input
                        name="color"
                        value={form.color}
                        onChange={handleChange}
                        placeholder="e.g. Black"
                        className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-700 focus:border-cyan-400/40 focus:ring-2 focus:ring-cyan-400/10"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                        Condition
                      </label>

                      <select
                        name="condition"
                        value={form.condition}
                        onChange={handleChange}
                        className="w-full rounded-xl border border-white/10 bg-[#0d131c] px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400/40 focus:ring-2 focus:ring-cyan-400/10"
                      >
                        {CONDITIONS.map((condition) => (
                          <option
                            key={condition}
                            value={condition}
                          >
                            {condition}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                        Location
                      </label>

                      <input
                        name="location"
                        value={form.location}
                        onChange={handleChange}
                        placeholder="e.g. Accra"
                        className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-700 focus:border-cyan-400/40 focus:ring-2 focus:ring-cyan-400/10"
                      />
                    </div>
                  </div>
                </section>

                {/* Pricing */}
                <section className="border-t border-white/[0.06] pt-7">
                  <div className="mb-4">
                    <p className="text-sm font-semibold text-white">
                      Pricing
                    </p>

                    <p className="mt-1 text-xs text-slate-600">
                      Update both rental and sale pricing independently.
                    </p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                        Sale Price
                      </label>

                      <div className="relative">
                        <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-xs font-semibold text-slate-600">
                          GHS
                        </span>

                        <input
                          name="price"
                          type="number"
                          min="1"
                          value={form.price}
                          onChange={handleChange}
                          placeholder="Sale price"
                          className="w-full rounded-xl border border-white/10 bg-black/20 py-3.5 pl-14 pr-4 text-sm text-white outline-none transition placeholder:text-slate-700 focus:border-emerald-400/40 focus:ring-2 focus:ring-emerald-400/10"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                        Rental Price Per Day
                      </label>

                      <div className="relative">
                        <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-xs font-semibold text-slate-600">
                          GHS
                        </span>

                        <input
                          name="rentalPricePerDay"
                          type="number"
                          min="1"
                          value={form.rentalPricePerDay}
                          onChange={handleChange}
                          placeholder="Rental price"
                          className="w-full rounded-xl border border-white/10 bg-black/20 py-3.5 pl-14 pr-4 text-sm text-white outline-none transition placeholder:text-slate-700 focus:border-cyan-400/40 focus:ring-2 focus:ring-cyan-400/10"
                        />
                      </div>
                    </div>
                  </div>
                </section>

                {/* Availability */}
                <section className="border-t border-white/[0.06] pt-7">
                  <div className="mb-4">
                    <p className="text-sm font-semibold text-white">
                      Availability
                    </p>

                    <p className="mt-1 text-xs text-slate-600">
                      A vehicle must remain available for at least one
                      purpose.
                    </p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    <label
                      className={`cursor-pointer rounded-2xl border p-4 transition ${
                        form.availableForRent
                          ? "border-cyan-400/30 bg-cyan-400/[0.07]"
                          : "border-white/10 bg-white/[0.02]"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          name="availableForRent"
                          checked={form.availableForRent}
                          onChange={handleChange}
                          className="mt-1 h-4 w-4 accent-cyan-400"
                        />

                        <div>
                          <p className="text-sm font-semibold text-white">
                            Available for Rent
                          </p>

                          <p className="mt-1 text-xs text-slate-600">
                            Customers can book this vehicle.
                          </p>
                        </div>
                      </div>
                    </label>

                    <label
                      className={`cursor-pointer rounded-2xl border p-4 transition ${
                        form.availableForSale
                          ? "border-emerald-400/30 bg-emerald-400/[0.07]"
                          : "border-white/10 bg-white/[0.02]"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          name="availableForSale"
                          checked={form.availableForSale}
                          onChange={handleChange}
                          className="mt-1 h-4 w-4 accent-emerald-400"
                        />

                        <div>
                          <p className="text-sm font-semibold text-white">
                            Available for Sale
                          </p>

                          <p className="mt-1 text-xs text-slate-600">
                            Customers can purchase this vehicle.
                          </p>
                        </div>
                      </div>
                    </label>

                    <label
                      className={`cursor-pointer rounded-2xl border p-4 transition ${
                        form.isFeatured
                          ? "border-amber-400/30 bg-amber-400/[0.07]"
                          : "border-white/10 bg-white/[0.02]"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          name="isFeatured"
                          checked={form.isFeatured}
                          onChange={handleChange}
                          className="mt-1 h-4 w-4 accent-amber-400"
                        />

                        <div>
                          <p className="text-sm font-semibold text-white">
                            Featured Vehicle
                          </p>

                          <p className="mt-1 text-xs text-slate-600">
                            Highlight this vehicle on the fleet.
                          </p>
                        </div>
                      </div>
                    </label>
                  </div>
                </section>

                {/* Description */}
                <section className="border-t border-white/[0.06] pt-7">
                  <div className="mb-4">
                    <p className="text-sm font-semibold text-white">
                      Description
                    </p>
                  </div>

                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    rows="4"
                    placeholder="Describe the vehicle..."
                    className="w-full resize-none rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-slate-700 focus:border-cyan-400/40 focus:ring-2 focus:ring-cyan-400/10"
                  />
                </section>

                {/* Images */}
                <section className="border-t border-white/[0.06] pt-7">
                  <div className="mb-4">
                    <p className="text-sm font-semibold text-white">
                      Vehicle Images
                    </p>

                    <p className="mt-1 text-xs text-slate-600">
                      Replace or remove existing images, or add new images
                      from your computer.
                    </p>
                  </div>

                  {/* Existing Images */}
                  {editingVehicle.images?.length > 0 && (
                    <div className="grid gap-4 sm:grid-cols-2">
                      {editingVehicle.images.map(
                        (image, index) => {
                          const isRemoved =
                            removedImages.includes(image);

                          const replacement =
                            replacementImages.find(
                              (item) =>
                                item.imageIndex === index
                            );

                          const replacementPreview =
                            replacementPreviews[index];

                          return (
                            <div
                              key={`${image}-${index}`}
                              className={`overflow-hidden rounded-2xl border bg-black/20 ${
                                isRemoved
                                  ? "border-red-400/20"
                                  : replacement
                                  ? "border-amber-400/20"
                                  : "border-white/10"
                              }`}
                            >
                              <div className="relative h-40">
                                <img
                                  src={
                                    replacementPreview ||
                                    image
                                  }
                                  alt={`${editingVehicle.make} ${editingVehicle.model} ${
                                    index + 1
                                  }`}
                                  className={`h-full w-full object-cover ${
                                    isRemoved
                                      ? "opacity-30"
                                      : ""
                                  }`}
                                />

                                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-4 pb-3 pt-8">
                                  <div className="flex items-center justify-between gap-2">
                                    <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-white/70">
                                      Image {index + 1}
                                    </span>

                                    {replacement && (
                                      <span className="rounded-full border border-amber-400/20 bg-amber-400/10 px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.1em] text-amber-300">
                                        Replacement
                                      </span>
                                    )}

                                    {isRemoved && (
                                      <span className="rounded-full border border-red-400/20 bg-red-400/10 px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.1em] text-red-300">
                                        Removed
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div className="flex flex-wrap gap-2 p-3">
                                {!isRemoved && (
                                  <>
                                    <label className="cursor-pointer rounded-lg border border-cyan-400/20 bg-cyan-400/[0.06] px-3 py-2 text-xs font-semibold text-cyan-300 transition hover:border-cyan-400/40 hover:bg-cyan-400/[0.1]">
                                      Replace
                                      <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => {
                                          const file =
                                            e.target
                                              .files?.[0];

                                          handleReplaceImage(
                                            index,
                                            file
                                          );

                                          e.target.value =
                                            "";
                                        }}
                                        className="hidden"
                                      />
                                    </label>

                                    {replacement && (
                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleCancelReplacement(
                                            index
                                          )
                                        }
                                        className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-semibold text-slate-400 transition hover:border-white/20 hover:text-white"
                                      >
                                        Undo Replace
                                      </button>
                                    )}

                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleRemoveExistingImage(
                                          index
                                        )
                                      }
                                      className="rounded-lg border border-red-400/15 bg-red-400/[0.05] px-3 py-2 text-xs font-semibold text-red-300 transition hover:border-red-400/30 hover:bg-red-400/[0.1]"
                                    >
                                      Remove
                                    </button>
                                  </>
                                )}

                                {isRemoved && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleRestoreExistingImage(
                                        index
                                      )
                                    }
                                    className="rounded-lg border border-emerald-400/20 bg-emerald-400/[0.06] px-3 py-2 text-xs font-semibold text-emerald-300 transition hover:border-emerald-400/40 hover:bg-emerald-400/[0.1]"
                                  >
                                    Restore
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        }
                      )}
                    </div>
                  )}

                  {/* Add New Images */}
                  <div className="mt-5">
                    <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-white/15 bg-white/[0.02] px-6 py-8 text-center transition hover:border-cyan-400/30 hover:bg-cyan-400/[0.03]">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-slate-500">
                        +
                      </div>

                      <p className="mt-3 text-sm font-semibold text-white">
                        Add new images
                      </p>

                      <p className="mt-1 text-xs text-slate-600">
                        Select images from your computer
                      </p>

                      <p className="mt-1 text-[10px] text-slate-700">
                        Maximum 10 uploads per save, including replacements
                      </p>

                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImages}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {/* New Image Previews */}
                  {newImages.length > 0 && (
                    <div className="mt-5">
                      <div className="mb-3 flex items-center justify-between">
                        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                          New Images
                        </p>

                        <p className="text-xs text-cyan-300">
                          {newImages.length} selected
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                        {newImages.map((file, index) => (
                          <div
                            key={`${file.name}-${index}`}
                            className="overflow-hidden rounded-xl border border-cyan-400/15 bg-cyan-400/[0.03]"
                          >
                            <div className="relative h-24">
                              {newImagePreviews[index] && (
                                <img
                                  src={newImagePreviews[index]}
                                  alt={file.name}
                                  className="h-full w-full object-cover"
                                />
                              )}

                              <button
                                type="button"
                                onClick={() =>
                                  removeNewImage(index)
                                }
                                className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full border border-red-400/20 bg-black/70 text-sm text-red-300 backdrop-blur-sm transition hover:bg-red-400/20"
                                aria-label="Remove selected image"
                              >
                                ×
                              </button>
                            </div>

                            <div className="p-2">
                              <p className="truncate text-[10px] text-slate-500">
                                {file.name}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Image Changes Summary */}
                  {(replacementImages.length > 0 ||
                    removedImages.length > 0 ||
                    newImages.length > 0) && (
                    <div className="mt-5 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-500">
                        Image Changes
                      </p>

                      <div className="mt-3 flex flex-wrap gap-2">
                        {replacementImages.length > 0 && (
                          <span className="rounded-full border border-amber-400/20 bg-amber-400/[0.06] px-3 py-1.5 text-[10px] font-semibold text-amber-300">
                            {replacementImages.length} replacement
                            {replacementImages.length !== 1
                              ? "s"
                              : ""}
                          </span>
                        )}

                        {removedImages.length > 0 && (
                          <span className="rounded-full border border-red-400/20 bg-red-400/[0.06] px-3 py-1.5 text-[10px] font-semibold text-red-300">
                            {removedImages.length} removal
                            {removedImages.length !== 1
                              ? "s"
                              : ""}
                          </span>
                        )}

                        {newImages.length > 0 && (
                          <span className="rounded-full border border-cyan-400/20 bg-cyan-400/[0.06] px-3 py-1.5 text-[10px] font-semibold text-cyan-300">
                            {newImages.length} new image
                            {newImages.length !== 1
                              ? "s"
                              : ""}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </section>
              </div>

              {/* Actions */}
              <div className="mt-8 flex flex-col-reverse gap-3 border-t border-white/[0.06] pt-6 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeEditor}
                  disabled={saving}
                  className="rounded-xl border border-white/10 bg-white/[0.03] px-6 py-3 text-sm font-semibold text-slate-400 transition hover:border-white/20 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-cyan-400 px-7 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving
                    ? "Saving Changes..."
                    : "Save Vehicle"}
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