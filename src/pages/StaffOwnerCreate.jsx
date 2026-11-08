import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

const initialForm = {
  firstName: "",
  lastName: "",
  phone: "",
  email: "",
  identificationType: "",
  identificationNumber: "",
  ownerType: "INDIVIDUAL",
  companyName: "",
  internalNotes: "",
};

function StaffOwnerCreate() {
  const { user } = useAuth();
  const [form, setForm] = useState(initialForm);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [createdOwnerId, setCreatedOwnerId] = useState("");
  const [creationCompleted, setCreationCompleted] = useState(false);
  const navigate = useNavigate();

  const update = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setBusy(true);
    let ownerId = "";
    let creationConfirmed = false;

    try {
      const { data } = await api.post("/property-owners", {
        ...form,
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        phone: form.phone.trim(),
        email: form.email.trim() || undefined,
        identificationNumber: form.identificationNumber.trim() || undefined,
        companyName: form.companyName.trim() || undefined,
        internalNotes: form.internalNotes.trim(),
      });
      creationConfirmed = true;
      setCreationCompleted(true);
      ownerId = data.owner?.id;
      setCreatedOwnerId(ownerId || "");
      if (!ownerId) {
        throw new Error("The owner record was created, but the server did not return its identifier.");
      }

      await api.post("/property-owner-access", {
        staffId: user.id || user._id,
        ownerRecord: ownerId,
        canViewOwner: true,
        canViewDocuments: true,
        canUploadDocuments: true,
        canVerifyDocuments: true,
        canDownloadDocuments: true,
      });
      navigate(`/staff/owners/${ownerId}`, { replace: true });
    } catch (requestError) {
      setError(
        creationConfirmed && ownerId
          ? `Owner record ${ownerId} exists, but its access assignment could not be completed. Contact an administrator; do not submit this form again.`
          : creationConfirmed
            ? "The owner record may have been created, but the server did not return its identifier. Contact an administrator; do not submit this form again."
          : requestError.response?.data?.message || requestError.message || "Unable to create the owner record.",
      );
    } finally {
      setBusy(false);
    }
  };

  const inputClass = "mt-1.5 min-h-11 w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-sm text-stone-900";
  const labelClass = "block text-sm font-semibold text-stone-700";

  return (
    <main className="staff-page min-h-[calc(100vh-4rem)] bg-[#fffdf8] px-4 py-8 sm:px-7 lg:px-10 lg:py-10">
      <div className="mx-auto max-w-4xl">
        <Link className="text-sm font-semibold text-amber-900 hover:underline" to="/staff/owners">← Back to owners</Link>
        <header className="mt-6">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-900">Private owner identity</p>
          <h1 className="mt-2 text-3xl font-semibold text-stone-900">Create property owner</h1>
          <p className="mt-2 text-sm leading-6 text-stone-600">This information is private and is sent only to the protected owner API.</p>
        </header>

        {error && <p className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800" role="alert">{error}</p>}
        {createdOwnerId && error && <p className="mt-2 break-all text-xs text-stone-600">Owner record ID: {createdOwnerId}</p>}

        <form className="mt-6 grid gap-4 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:grid-cols-2 sm:p-7" onSubmit={submit}>
          <label className={labelClass}>First name<input className={inputClass} name="firstName" value={form.firstName} onChange={update} required maxLength={100} /></label>
          <label className={labelClass}>Last name<input className={inputClass} name="lastName" value={form.lastName} onChange={update} required maxLength={100} /></label>
          <label className={labelClass}>Phone<input className={inputClass} name="phone" type="tel" value={form.phone} onChange={update} required /></label>
          <label className={labelClass}>Email (optional)<input className={inputClass} name="email" type="email" value={form.email} onChange={update} /></label>
          <label className={labelClass}>Owner type
            <select className={inputClass} name="ownerType" value={form.ownerType} onChange={update}>
              {["INDIVIDUAL", "COMPANY", "ORGANIZATION", "ESTATE", "TRUST", "OTHER"].map((type) => <option key={type} value={type}>{type.replaceAll("_", " ")}</option>)}
            </select>
          </label>
          <label className={labelClass}>Company name (optional)<input className={inputClass} name="companyName" value={form.companyName} onChange={update} /></label>
          <label className={labelClass}>Identification type
            <select className={inputClass} name="identificationType" value={form.identificationType} onChange={update}>
              <option value="">Not provided</option>
              {["GH_CARD", "PASSPORT", "DRIVERS_LICENSE", "VOTER_ID", "OTHER"].map((type) => <option key={type} value={type}>{type.replaceAll("_", " ")}</option>)}
            </select>
          </label>
          <label className={labelClass}>Identification number<input className={inputClass} name="identificationNumber" value={form.identificationNumber} onChange={update} autoComplete="off" /></label>
          <label className={`${labelClass} sm:col-span-2`}>Internal notes<textarea className={inputClass} name="internalNotes" rows={3} value={form.internalNotes} onChange={update} /></label>
          <div className="flex flex-wrap gap-3 sm:col-span-2">
            <button className="button-primary min-h-11 rounded-xl px-5 py-3 text-sm font-bold disabled:opacity-50" disabled={busy || creationCompleted} type="submit">{busy ? "Creating…" : "Create owner record"}</button>
            <Link className="inline-flex min-h-11 items-center rounded-xl border border-stone-300 px-5 py-3 text-sm font-semibold text-stone-700" to="/staff/owners">Cancel</Link>
          </div>
        </form>
        <p className="mt-4 text-xs leading-5 text-stone-500">The backend requires verified identity information and at least one verified owner document before the owner can be marked verified.</p>
      </div>
    </main>
  );
}

export default StaffOwnerCreate;
