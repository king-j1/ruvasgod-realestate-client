
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../api/axios";
import { useLanguage } from "../context/LanguageContext";

const emptyForm = {
  title: "",
  description: "",
  propertyType: "LAND",
  listingType: "SALE",
  acceptedPaymentMethods: [],
  price: "",
  currency: "GHS",
  region: "",
  city: "",
  area: "",
  addressLine: "",
  longitude: "",
  latitude: "",
  landSizeValue: "",
  landSizeUnit: "SQ_M",
  bedrooms: "",
  bathrooms: "",
  isFeatured: false,
};

function StaffPropertyEdit() {
  const { t } = useLanguage();
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadProperty() {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/properties/staff/all");
        const properties = response.data.properties || [];
        const property = properties.find((item) => item._id === id);

        if (!property) {
          throw new Error("Property not found in staff records.");
        }

        if (!active) return;

        const coordinates = property.location?.coordinates || [];

        setForm({
          title: property.title || "",
          description: property.description || "",
          propertyType: property.propertyType || "LAND",
          listingType: property.listingType || "SALE",
          acceptedPaymentMethods: Array.isArray(
            property.acceptedPaymentMethods
          )
            ? property.acceptedPaymentMethods
            : [],
          price: property.price ?? "",
          currency: property.currency || "GHS",
          region: property.address?.region || "",
          city: property.address?.city || "",
          area: property.address?.area || "",
          addressLine: property.address?.addressLine || "",
          longitude: coordinates[0] ?? "",
          latitude: coordinates[1] ?? "",
          landSizeValue: property.landSize?.value ?? "",
          landSizeUnit: property.landSize?.unit || "SQ_M",
          bedrooms: property.bedrooms ?? "",
          bathrooms: property.bathrooms ?? "",
          isFeatured: Boolean(property.isFeatured),
        });
      } catch (err) {
        if (active) {
          setError(
            err.response?.data?.message ||
              err.message ||
              "Unable to load this property."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadProperty();

    return () => {
      active = false;
    };
  }, [id]);

  function updateField(event) {
    const { name, value, type, checked } = event.target;

    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,

      ...(name === "listingType" && value === "RENT"
        ? { acceptedPaymentMethods: [] }
        : {}),
    }));
  }

  function togglePaymentMethod(method) {
    setForm((current) => {
      const methods = current.acceptedPaymentMethods;

      return {
        ...current,
        acceptedPaymentMethods: methods.includes(method)
          ? methods.filter((item) => item !== method)
          : [...methods, method],
      };
    });
  }

  function submitForm(event) {
    event.preventDefault();
    setError("");

    if (!form.title.trim()) {
      setError("Please enter a property title.");
      return;
    }

    if (!form.description.trim()) {
      setError("Please enter a property description.");
      return;
    }

    const price = Number(form.price);
    const longitude = Number(form.longitude);
    const latitude = Number(form.latitude);

    if (form.price === "" || !Number.isFinite(price) || price <= 0) {
      setError("Please enter a valid price greater than zero.");
      return;
    }

    if (
      form.longitude === "" ||
      form.latitude === "" ||
      !Number.isFinite(longitude) ||
      !Number.isFinite(latitude) ||
      longitude < -180 ||
      longitude > 180 ||
      latitude < -90 ||
      latitude > 90
    ) {
      setError(
        "Enter valid GPS coordinates. Longitude must be between -180 and 180, and latitude between -90 and 90."
      );
      return;
    }

    if (
      form.landSizeValue !== "" &&
      (!Number.isFinite(Number(form.landSizeValue)) ||
        Number(form.landSizeValue) < 0)
    ) {
      setError("Land size must be a valid number of zero or greater.");
      return;
    }

    if (
      form.listingType === "SALE" &&
      form.acceptedPaymentMethods.length === 0
    ) {
      setError("Select at least one payment method for this SALE property.");
      return;
    }

    setShowWarning(true);
  }

  async function confirmSave() {
    try {
      setSaving(true);
      setError("");

      const numericOptional = (value) =>
        value === "" ? null : Number(value);

      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        propertyType: form.propertyType,
        listingType: form.listingType,

        acceptedPaymentMethods:
          form.listingType === "SALE"
            ? form.acceptedPaymentMethods
            : [],

        price: Number(form.price),
        currency: form.currency.trim() || "GHS",

        address: {
          region: form.region.trim(),
          city: form.city.trim(),
          area: form.area.trim(),
          addressLine: form.addressLine.trim(),
        },

        location: {
          type: "Point",
          coordinates: [
            Number(form.longitude),
            Number(form.latitude),
          ],
        },

        landSize: {
          value: numericOptional(form.landSizeValue),
          unit: form.landSizeValue === "" ? null : form.landSizeUnit,
        },

        bedrooms: numericOptional(form.bedrooms),
        bathrooms: numericOptional(form.bathrooms),
        isFeatured: form.isFeatured,
      };

      await api.patch(`/properties/staff/${id}`, payload);

      navigate(`/staff/properties/${id}`, {
        replace: true,
        state: {
          message:
            "Property updated. It is now a Draft and requires verification again before publication.",
        },
      });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to save the property. Please check your connection and try again."
      );
      setShowWarning(false);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="staff-page min-h-screen bg-[#fffdf8] p-8 text-stone-900">
        <p className="text-slate-400">Loading property for editing...</p>
      </main>
    );
  }

  if (error && !form.title) {
    return (
      <main className="staff-page min-h-screen bg-[#fffdf8] p-8 text-stone-900">
        <h1 className="text-2xl font-bold">Unable to open editor</h1>
        <p className="mt-3 text-red-400">{error}</p>

        <Link
          to="/staff/properties"
          className="mt-5 inline-block text-cyan-400"
        >
          Back to Properties
        </Link>
      </main>
    );
  }

  const inputClass =
    "mt-2 w-full rounded-xl border border-white/15 bg-slate-900 px-4 py-3 text-white outline-none focus:border-cyan-400";

  const labelClass = "block text-sm font-semibold text-slate-300";

  return (
    <main className="staff-page min-h-screen bg-[#fffdf8] px-5 py-8 text-stone-900 md:px-10 md:py-12">
      <div className="mx-auto max-w-5xl">
        <Link
          to={`/staff/properties/${id}`}
          className="text-sm font-medium text-cyan-400 hover:text-cyan-300"
        >
          ← {t("backToPropertyDetails")}
        </Link>

        <header className="mt-7">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-cyan-400">
            Ruvasgod Real Estate
          </p>

          <h1 className="mt-3 text-3xl font-black md:text-4xl">
            {t("editProperty")}
          </h1>

          <p className="mt-3 text-slate-400">
            {t("propertyChangeEffect")}
          </p>
        </header>

        <div className="mt-6 rounded-2xl border border-amber-400/30 bg-amber-400/10 p-5">
          <h2 className="font-bold text-amber-300">
            {t("importantVerificationReset")}
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-200">
            {t("propertyChangeEffect")}
          </p>
        </div>

        {error && (
          <div
            role="alert"
            className="mt-5 rounded-xl border border-red-400/30 bg-red-400/10 p-4 text-red-300"
          >
            {error}
          </div>
        )}

        <form onSubmit={submitForm} className="mt-6 space-y-6">
          <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 md:p-7">
            <h2 className="text-xl font-bold">
              {t("basicInformation")}
            </h2>

            <div className="mt-5 grid gap-5 md:grid-cols-2">
              <label className={`${labelClass} md:col-span-2`}>
                {t("title")} *
                <input
                  className={inputClass}
                  name="title"
                  value={form.title}
                  onChange={updateField}
                  required
                  maxLength={200}
                />
              </label>

              <label className={labelClass}>
                {t("propertyTypeLabel")} *
                <select
                  className={inputClass}
                  name="propertyType"
                  value={form.propertyType}
                  onChange={updateField}
                  required
                >
                  <option value="LAND">{t("land")}</option>
                  <option value="HOUSE">{t("house")}</option>
                </select>
              </label>

              <label className={labelClass}>
                {t("listingTypeLabel")} *
                <select
                  className={inputClass}
                  name="listingType"
                  value={form.listingType}
                  onChange={updateField}
                  required
                >
                  <option value="SALE">{t("sale")}</option>
                  <option value="RENT">{t("rent")}</option>
                </select>
              </label>

              {/* ==================================
                  SALE PAYMENT OPTIONS
              ================================== */}

              {form.listingType === "SALE" && (
                <div className="md:col-span-2 rounded-xl border border-amber-400/30 bg-amber-400/10 p-5">
                  <h3 className="font-bold text-amber-300">
                    Accepted Payment Methods
                  </h3>

                  <p className="mt-2 text-sm text-slate-300">
                    Select the payment methods allowed for this property.
                  </p>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 bg-white/[0.04] p-4">
                      <input
                        type="checkbox"
                        className="mt-1 h-4 w-4 accent-amber-400"
                        checked={form.acceptedPaymentMethods.includes(
                          "FULL_PAYMENT"
                        )}
                        onChange={() =>
                          togglePaymentMethod("FULL_PAYMENT")
                        }
                      />

                      <span>
                        <span className="block font-semibold text-white">
                          Full Payment
                        </span>

                        <span className="mt-1 block text-xs text-slate-400">
                          Customer pays the entire agreed amount at once.
                        </span>
                      </span>
                    </label>

                    <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 bg-white/[0.04] p-4">
                      <input
                        type="checkbox"
                        className="mt-1 h-4 w-4 accent-amber-400"
                        checked={form.acceptedPaymentMethods.includes(
                          "INSTALLMENTS"
                        )}
                        onChange={() =>
                          togglePaymentMethod("INSTALLMENTS")
                        }
                      />

                      <span>
                        <span className="block font-semibold text-white">
                          Installment Payment
                        </span>

                        <span className="mt-1 block text-xs text-slate-400">
                          Customer pays through the existing PAIMS installment plan.
                        </span>
                      </span>
                    </label>
                  </div>

                  <p className="mt-3 text-xs text-slate-400">
                    You can select one method or both methods.
                  </p>
                </div>
              )}

              <label className={labelClass}>
                {t("priceLabel")} *
                <input
                  className={inputClass}
                  type="number"
                  name="price"
                  value={form.price}
                  onChange={updateField}
                  min="0.01"
                  step="any"
                  required
                />
              </label>

              <label className={labelClass}>
                {t("currencyLabel")}
                <input
                  className={inputClass}
                  name="currency"
                  value={form.currency}
                  onChange={updateField}
                  maxLength={10}
                />
              </label>

              <label className={`${labelClass} md:col-span-2`}>
                {t("descriptionLabel")} *
                <textarea
                  className={inputClass}
                  name="description"
                  value={form.description}
                  onChange={updateField}
                  rows={5}
                  required
                />
              </label>

              <label className="flex items-center gap-3 text-sm font-semibold text-slate-300 md:col-span-2">
                <input
                  type="checkbox"
                  name="isFeatured"
                  checked={form.isFeatured}
                  onChange={updateField}
                  className="h-5 w-5 accent-cyan-400"
                />
                {t("featuredProperty")}
              </label>
            </div>
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 md:p-7">
            <h2 className="text-xl font-bold">
              {t("locationAndGps")}
            </h2>

            <div className="mt-5 grid gap-5 md:grid-cols-2">
              <label className={labelClass}>
                {t("regionLabel")}
                <input
                  className={inputClass}
                  name="region"
                  value={form.region}
                  onChange={updateField}
                />
              </label>

              <label className={labelClass}>
                {t("cityLabel")}
                <input
                  className={inputClass}
                  name="city"
                  value={form.city}
                  onChange={updateField}
                />
              </label>

              <label className={labelClass}>
                {t("areaLabel")}
                <input
                  className={inputClass}
                  name="area"
                  value={form.area}
                  onChange={updateField}
                />
              </label>

              <label className={labelClass}>
                {t("addressLineLabel")}
                <input
                  className={inputClass}
                  name="addressLine"
                  value={form.addressLine}
                  onChange={updateField}
                />
              </label>

              <label className={labelClass}>
                {t("longitude")} *
                <input
                  className={inputClass}
                  type="number"
                  name="longitude"
                  value={form.longitude}
                  onChange={updateField}
                  min="-180"
                  max="180"
                  step="any"
                  required
                />
              </label>

              <label className={labelClass}>
                {t("latitude")} *
                <input
                  className={inputClass}
                  type="number"
                  name="latitude"
                  value={form.latitude}
                  onChange={updateField}
                  min="-90"
                  max="90"
                  step="any"
                  required
                />
              </label>
            </div>

            <p className="mt-4 text-sm text-slate-400">
              {t("gpsCoordinatesNote")}
            </p>
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 md:p-7">
            <h2 className="text-xl font-bold">
              {t("propertyMeasurements")}
            </h2>

            <div className="mt-5 grid gap-5 md:grid-cols-2">
              <label className={labelClass}>
                {t("landSize")}
                <input
                  className={inputClass}
                  type="number"
                  name="landSizeValue"
                  value={form.landSizeValue}
                  onChange={updateField}
                  min="0"
                  step="any"
                />
              </label>

              <label className={labelClass}>
                {t("landSize")}
                <select
                  className={inputClass}
                  name="landSizeUnit"
                  value={form.landSizeUnit}
                  onChange={updateField}
                  disabled={form.landSizeValue === ""}
                >
                  <option value="SQ_M">{t("squareMetres")}</option>
                  <option value="SQ_FT">{t("squareFeet")}</option>
                  <option value="ACRE">{t("acres")}</option>
                </select>
              </label>

              <label className={labelClass}>
                {t("bedrooms")}
                <input
                  className={inputClass}
                  type="number"
                  name="bedrooms"
                  value={form.bedrooms}
                  onChange={updateField}
                  min="0"
                  step="1"
                />
              </label>

              <label className={labelClass}>
                {t("bathrooms")}
                <input
                  className={inputClass}
                  type="number"
                  name="bathrooms"
                  value={form.bathrooms}
                  onChange={updateField}
                  min="0"
                  step="1"
                />
              </label>
            </div>
          </section>

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-cyan-500 px-6 py-3 font-bold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {t("reviewChanges")}
            </button>

            <Link
              to={`/staff/properties/${id}`}
              className="rounded-xl border border-white/15 px-6 py-3 font-semibold text-slate-200 hover:bg-white/5"
            >
              {t("cancel")}
            </Link>
          </div>
        </form>

        {showWarning && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
            role="presentation"
          >
            <section
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="save-warning-title"
              className="w-full max-w-lg rounded-2xl border border-amber-400/30 bg-slate-900 p-6 shadow-2xl"
            >
              <h2
                id="save-warning-title"
                className="text-xl font-bold text-amber-300"
              >
                {t("confirmPropertyUpdate")}
              </h2>

              <p className="mt-4 leading-7 text-slate-300">
                {t("confirmPropertyUpdateMessage")}
              </p>

              <div className="mt-6 flex flex-wrap justify-end gap-3">
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => setShowWarning(false)}
                  className="rounded-xl border border-white/15 px-4 py-3 font-semibold hover:bg-white/5 disabled:opacity-50"
                >
                  {t("goBack")}
                </button>

                <button
                  type="button"
                  disabled={saving}
                  onClick={confirmSave}
                  className="rounded-xl bg-amber-400 px-4 py-3 font-bold text-slate-950 hover:bg-amber-300 disabled:opacity-50"
                >
                  {saving ? t("saving") : t("confirmAndSave")}
                </button>
              </div>
            </section>
          </div>
        )}
      </div>
    </main>
  );
}

export default StaffPropertyEdit;
