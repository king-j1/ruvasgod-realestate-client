import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useLanguage } from "../context/LanguageContext";

const initialForm = {
  title: "",
  description: "",
  propertyType: "LAND",
  listingType: "SALE",
  price: "",
  currency: "GHS",
  region: "",
  city: "",
  area: "",
  addressLine: "",
  longitude: "",
  latitude: "",
  ownerRecord: "",
};

function StaffPropertyCreate() {
  const { t } = useLanguage();
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const update = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const submit = async (event) => {
    event.preventDefault();
    setError("");

    const price = Number(form.price);
    const longitude = Number(form.longitude);
    const latitude = Number(form.latitude);
    if (!form.ownerRecord.trim()) {
      setError("Enter the assigned property owner record ID.");
      return;
    }
    if (!Number.isFinite(price) || price < 0) {
      setError("Enter a valid non-negative price.");
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
      setError("Enter valid GPS coordinates: longitude -180 to 180 and latitude -90 to 90.");
      return;
    }

    try {
      setSaving(true);
      const response = await api.post("/properties/staff/create", {
        title: form.title.trim(),
        description: form.description.trim(),
        propertyType: form.propertyType,
        listingType: form.listingType,
        price,
        currency: form.currency.trim() || "GHS",
        address: {
          region: form.region.trim(),
          city: form.city.trim(),
          area: form.area.trim(),
          addressLine: form.addressLine.trim(),
        },
        location: { type: "Point", coordinates: [longitude, latitude] },
        ownerRecord: form.ownerRecord.trim(),
      });
      const propertyId = response.data?.property?.id;
      if (!propertyId) {
        throw new Error("The property was created, but the server did not return its identifier.");
      }
      navigate(`/staff/properties/${propertyId}`, { replace: true });
    } catch (requestError) {
      setError(requestError.response?.data?.message || requestError.message || "Unable to create the property.");
    } finally {
      setSaving(false);
    }
  };

  const inputClass = "mt-1.5 w-full rounded-xl border border-stone-300 bg-white px-3.5 py-3 text-sm text-stone-900 outline-none focus:border-amber-800";
  const labelClass = "block text-sm font-semibold text-stone-700";

  return (
    <main className="staff-page min-h-screen bg-[#fffdf8] px-4 py-8 sm:px-7 lg:px-10">
      <div className="mx-auto max-w-4xl">
        <Link className="text-sm font-semibold text-amber-900 hover:underline" to="/staff/properties">← Back to properties</Link>
        <header className="mt-6">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-900">{t("propertyManagement")}</p>
          <h1 className="mt-2 text-3xl font-semibold text-stone-900">{t("createProperty")}</h1>
          <p className="mt-2 text-sm leading-6 text-stone-600">{t("draftWorkflowNote")}</p>
        </header>

        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
          {t("staffOwnerPermissionNote")}
        </div>
        {error && <p className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800" role="alert">{error}</p>}

        <form className="mt-6 space-y-6" onSubmit={submit}>
          <section className="grid gap-4 rounded-2xl border border-stone-200 bg-white p-5 sm:grid-cols-2 sm:p-7">
            <label className={`${labelClass} sm:col-span-2`}>{t("title")}<input className={inputClass} name="title" value={form.title} onChange={update} required maxLength={200} /></label>
            <label className={`${labelClass} sm:col-span-2`}>{t("descriptionLabel")}<textarea className={inputClass} name="description" rows={5} value={form.description} onChange={update} required /></label>
            <label className={labelClass}>{t("propertyTypeLabel")}<select className={inputClass} name="propertyType" value={form.propertyType} onChange={update}><option value="LAND">{t("land")}</option><option value="HOUSE">{t("house")}</option></select></label>
            <label className={labelClass}>{t("listingTypeLabel")}<select className={inputClass} name="listingType" value={form.listingType} onChange={update}><option value="SALE">{t("sale")}</option><option value="RENT">{t("rent")}</option></select></label>
            <label className={labelClass}>{t("priceLabel")}<input className={inputClass} name="price" type="number" min="0" step="any" value={form.price} onChange={update} required /></label>
            <label className={labelClass}>{t("currencyLabel")}<input className={inputClass} name="currency" value={form.currency} onChange={update} required maxLength={8} /></label>
            <label className={labelClass}>{t("regionLabel")}<input className={inputClass} name="region" value={form.region} onChange={update} /></label>
            <label className={labelClass}>{t("cityLabel")}<input className={inputClass} name="city" value={form.city} onChange={update} /></label>
            <label className={labelClass}>{t("areaLabel")}<input className={inputClass} name="area" value={form.area} onChange={update} /></label>
            <label className={labelClass}>{t("addressLineLabel")}<input className={inputClass} name="addressLine" value={form.addressLine} onChange={update} /></label>
            <label className={labelClass}>{t("longitude")}<input className={inputClass} name="longitude" type="number" step="any" value={form.longitude} onChange={update} required /></label>
            <label className={labelClass}>{t("latitude")}<input className={inputClass} name="latitude" type="number" step="any" value={form.latitude} onChange={update} required /></label>
            <label className={`${labelClass} sm:col-span-2`}>{t("assignedOwnerId")}<input className={inputClass} name="ownerRecord" value={form.ownerRecord} onChange={update} required autoComplete="off" /></label>
          </section>
          <div className="flex flex-wrap gap-3">
            <button className="button-primary min-h-11 rounded-xl px-5 py-3 text-sm font-bold disabled:opacity-50" disabled={saving} type="submit">{saving ? "Creating…" : t("createDraft")}</button>
            <Link className="rounded-xl border border-stone-300 bg-white px-5 py-3 text-sm font-semibold text-stone-700" to="/staff/properties">{t("cancel")}</Link>
          </div>
        </form>
      </div>
    </main>
  );
}

export default StaffPropertyCreate;
