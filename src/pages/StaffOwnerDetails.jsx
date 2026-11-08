import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../api/axios";

const ACCESS_FIELDS = [
  ["canViewOwner", "View owner identity"],
  ["canViewDocuments", "View document records"],
  ["canUploadDocuments", "Upload documents"],
  ["canVerifyDocuments", "Verify documents"],
  ["canDownloadDocuments", "Download documents"],
];

const DOCUMENT_TYPES = [
  "GH_CARD",
  "PASSPORT",
  "DRIVERS_LICENSE",
  "VOTER_ID",
  "LAND_DOCUMENT",
  "TITLE_DEED",
  "SITE_PLAN",
  "OWNERSHIP_DOCUMENT",
  "POWER_OF_ATTORNEY",
  "COMPANY_DOCUMENT",
  "OTHER",
];

function StaffOwnerDetails() {
  const { id } = useParams();
  const [owner, setOwner] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [access, setAccess] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [documentsError, setDocumentsError] = useState("");
  const [notice, setNotice] = useState("");
  const [documentForm, setDocumentForm] = useState({ documentType: "GH_CARD", documentName: "" });
  const [documentFile, setDocumentFile] = useState(null);
  const [documentReview, setDocumentReview] = useState({});
  const [accessForm, setAccessForm] = useState({
    staffId: "",
    canViewOwner: true,
    canViewDocuments: false,
    canUploadDocuments: false,
    canVerifyDocuments: false,
    canDownloadDocuments: false,
  });
  const documentFormRef = useRef(null);

  const loadOwner = useCallback(async () => {
    if (!/^[a-f\d]{24}$/i.test(id || "")) {
      setError("Invalid owner record ID.");
      setLoading(false);
      return;
    }

    try {
      const { data } = await api.get(`/property-owners/${id}`);
      setOwner(data.owner || null);
      setError("");

      try {
        const documentResponse = await api.get(`/property-owner-documents/owner/${id}`);
        setDocuments(documentResponse.data.documents || []);
        setDocumentsError("");
      } catch (requestError) {
        setDocuments([]);
        setDocumentsError(requestError.response?.data?.message || "You are not authorized to view owner documents.");
      }

      const [accessResponse, staffResponse] = await Promise.all([
        api.get(`/property-owner-access/owner/${id}`),
        api.get("/staff"),
      ]);
      setAccess(accessResponse.data.access || []);
      setStaff((staffResponse.data.staff || []).filter((member) => member.isActive));
      setAccessForm((current) => ({ ...current, staffId: current.staffId || staffResponse.data.staff?.find((member) => member.isActive)?._id || "" }));
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to load this owner record or its authorized access information.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    // Load protected owner information after the route is resolved.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadOwner();
  }, [loadOwner]);

  const runOwnerVerification = async (verificationStatus) => {
    if (verificationStatus === "SUSPENDED" && !window.confirm("Suspend this property owner?")) return;
    if (verificationStatus === "REJECTED" && !window.confirm("Reject this property owner verification?")) return;
    try {
      setBusy(true);
      setError("");
      setNotice("");
      const { data } = await api.patch(`/property-owners/${id}/verification`, { verificationStatus });
      setNotice(data.message || "Owner verification status updated.");
      await loadOwner();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to update owner verification.");
    } finally {
      setBusy(false);
    }
  };

  const uploadDocument = async (event) => {
    event.preventDefault();
    if (!documentFile) return;

    const body = new FormData();
    body.append("ownerRecord", id);
    body.append("documentType", documentForm.documentType);
    body.append("documentName", documentForm.documentName.trim());
    body.append("document", documentFile);

    try {
      setBusy(true);
      setError("");
      setNotice("");
      const { data } = await api.post("/property-owner-documents", body);
      setNotice(data.message || "Owner document uploaded.");
      setDocumentForm((current) => ({ ...current, documentName: "" }));
      setDocumentFile(null);
      if (documentFormRef.current) documentFormRef.current.reset();
      await loadOwner();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to upload the owner document. Check your document permissions and file type.");
    } finally {
      setBusy(false);
    }
  };

  const updateDocumentStatus = async (document) => {
    const review = documentReview[document._id] || {};
    if (review.status === "REJECTED" && !review.rejectionReason?.trim()) {
      setError("Provide a rejection reason before rejecting a document.");
      return;
    }
    try {
      setBusy(true);
      setError("");
      setNotice("");
      const { data } = await api.patch(`/property-owner-documents/${document._id}/verification`, {
        verificationStatus: review.status || "UNDER_REVIEW",
        ...(review.status === "REJECTED" ? { rejectionReason: review.rejectionReason.trim() } : {}),
      });
      setNotice(data.message || "Document status updated.");
      await loadOwner();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to update the document status.");
    } finally {
      setBusy(false);
    }
  };

  const openDocument = async (documentId) => {
    try {
      setError("");
      const { data } = await api.get(`/property-owner-documents/${documentId}/download`);
      if (!data.access?.url) throw new Error("The document service did not return a secure access link.");
      const link = window.document.createElement("a");
      link.href = data.access.url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.click();
    } catch (requestError) {
      setError(requestError.response?.data?.message || requestError.message || "Unable to open the private document.");
    }
  };

  const assignStaff = async (event) => {
    event.preventDefault();
    if (!accessForm.staffId) return;
    try {
      setBusy(true);
      setError("");
      setNotice("");
      const { data } = await api.post("/property-owner-access", {
        ...accessForm,
        ownerRecord: id,
      });
      setNotice(data.message || "Staff access assigned.");
      await loadOwner();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to assign owner access.");
    } finally {
      setBusy(false);
    }
  };

  const revokeAccess = async (accessId) => {
    if (!window.confirm("Revoke this staff member's access to the owner record?")) return;
    try {
      setBusy(true);
      setError("");
      setNotice("");
      const { data } = await api.patch(`/property-owner-access/${accessId}/revoke`);
      setNotice(data.message || "Staff access revoked.");
      await loadOwner();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to revoke owner access.");
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return <main className="staff-page min-h-[50vh] bg-[#fffdf8] px-5 py-12"><p className="mx-auto max-w-5xl text-sm text-stone-600" role="status">Loading private owner record…</p></main>;
  }

  if (error && !owner) {
    return (
      <main className="staff-page min-h-[50vh] bg-[#fffdf8] px-5 py-12">
        <div className="mx-auto max-w-4xl rounded-2xl border border-red-200 bg-white p-7">
          <h1 className="text-xl font-semibold text-stone-900">Owner record unavailable</h1>
          <p className="mt-3 text-sm text-red-800" role="alert">{error}</p>
          <Link className="mt-5 inline-block text-sm font-bold text-amber-900" to="/staff/owners">Back to owners</Link>
        </div>
      </main>
    );
  }

  const inputClass = "mt-1.5 min-h-11 w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-sm text-stone-900";
  const labelClass = "block text-sm font-semibold text-stone-700";

  return (
    <main className="staff-page min-h-[calc(100vh-4rem)] bg-[#fffdf8] px-4 py-8 sm:px-7 lg:px-10 lg:py-10">
      <div className="mx-auto max-w-6xl">
        <Link className="text-sm font-semibold text-amber-900 hover:underline" to="/staff/owners">← Back to owners</Link>
        <header className="mt-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-900">Private owner record</p>
            <h1 className="mt-2 text-3xl font-semibold text-stone-900">{owner?.firstName} {owner?.lastName}</h1>
            <p className="mt-2 text-sm text-stone-600">{owner?.ownerType?.replaceAll("_", " ")} · {owner?.verificationStatus}</p>
          </div>
          <span className="break-all rounded-lg border border-stone-200 bg-white px-3 py-2 text-xs font-mono text-stone-600">ID: {owner?._id}</span>
        </header>

        {error && <p className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800" role="alert">{error}</p>}
        {notice && <p className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900" role="status">{notice}</p>}

        <section className="mt-6 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-lg font-semibold text-stone-900">Owner identity and contact</h2>
          <dl className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[
              ["Phone", owner?.phone],
              ["Email", owner?.email],
              ["Company", owner?.companyName],
              ["Identification type", owner?.identificationType],
              ["Identification number", owner?.identificationNumber],
              ["Record status", owner?.status],
              ["Internal notes", owner?.internalNotes],
            ].map(([label, value]) => (
              <div key={label}>
                <dt className="text-xs font-semibold uppercase tracking-wide text-stone-500">{label}</dt>
                <dd className="mt-1 break-words text-sm text-stone-900">{value || "Not provided"}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-6 flex flex-wrap gap-2">
            {["UNDER_REVIEW", "VERIFIED", "REJECTED", "SUSPENDED"].map((status) => (
              <button className="min-h-10 rounded-lg border border-stone-300 px-3 py-2 text-xs font-semibold text-stone-800 hover:border-amber-800 disabled:opacity-50" disabled={busy || owner?.verificationStatus === status} key={status} onClick={() => runOwnerVerification(status)} type="button">{status.replaceAll("_", " ")}</button>
            ))}
          </div>
          <p className="mt-3 text-xs leading-5 text-stone-500">The backend requires identification details and at least one active verified document before owner verification can succeed.</p>
        </section>

        <section className="mt-6 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-lg font-semibold text-stone-900">Private owner documents</h2>
          <p className="mt-2 text-sm leading-6 text-stone-600">Document file links are not stored in this page. Access is requested from the backend when authorized.</p>
          {documentsError && <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-950" role="status">{documentsError}</p>}
          <form className="mt-5 grid gap-4 sm:grid-cols-2" onSubmit={uploadDocument} ref={documentFormRef}>
            <label className={labelClass}>Document type
              <select className={inputClass} value={documentForm.documentType} onChange={(event) => setDocumentForm((current) => ({ ...current, documentType: event.target.value }))}>
                {DOCUMENT_TYPES.map((type) => <option key={type} value={type}>{type.replaceAll("_", " ")}</option>)}
              </select>
            </label>
            <label className={labelClass}>Document name
              <input className={inputClass} value={documentForm.documentName} onChange={(event) => setDocumentForm((current) => ({ ...current, documentName: event.target.value }))} required maxLength={200} />
            </label>
            <label className={`${labelClass} sm:col-span-2`}>Document file (JPG, PNG, WEBP, PDF; max 10 MB)
              <input className={`${inputClass} file:me-3 file:rounded-md file:border-0 file:bg-amber-50 file:px-3 file:py-2 file:font-semibold`} type="file" accept="image/jpeg,image/jpg,image/png,image/webp,application/pdf" onChange={(event) => setDocumentFile(event.target.files?.[0] || null)} required />
            </label>
            <button className="button-primary min-h-11 w-fit rounded-xl px-5 py-3 text-sm font-bold disabled:opacity-50 sm:col-span-2" disabled={busy || !documentFile} type="submit">Upload document</button>
          </form>

          {documents.length === 0 && !documentsError ? <p className="mt-6 rounded-xl border border-dashed border-stone-300 p-6 text-center text-sm text-stone-600">No active owner documents were returned.</p> : (
            <div className="mt-6 space-y-3">
              {documents.map((document) => {
                const review = documentReview[document._id] || { status: document.verificationStatus, rejectionReason: document.rejectionReason || "" };
                return (
                  <article className="rounded-xl border border-stone-200 p-4" key={document._id}>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h3 className="font-semibold text-stone-900">{document.documentName}</h3>
                        <p className="mt-1 text-xs text-stone-600">{document.documentType?.replaceAll("_", " ")} · {document.verificationStatus}</p>
                        {document.rejectionReason && <p className="mt-2 text-sm text-red-800">{document.rejectionReason}</p>}
                      </div>
                      <button className="min-h-9 rounded-lg border border-stone-300 px-3 py-2 text-xs font-semibold text-stone-800 disabled:opacity-50" disabled={busy} onClick={() => openDocument(document._id)} type="button">Open secure document</button>
                    </div>
                    <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_1.5fr_auto]">
                      <label className={labelClass}>Review status
                        <select className={inputClass} value={review.status} onChange={(event) => setDocumentReview((current) => ({ ...current, [document._id]: { ...review, status: event.target.value } }))}>
                          {["UNDER_REVIEW", "VERIFIED", "REJECTED"].map((status) => <option key={status} value={status}>{status.replaceAll("_", " ")}</option>)}
                        </select>
                      </label>
                      <label className={labelClass}>Rejection reason
                        <input className={inputClass} value={review.rejectionReason} onChange={(event) => setDocumentReview((current) => ({ ...current, [document._id]: { ...review, rejectionReason: event.target.value } }))} disabled={review.status !== "REJECTED"} />
                      </label>
                      <button className="mt-auto min-h-11 rounded-xl border border-stone-300 px-4 py-2 text-sm font-semibold text-stone-800 disabled:opacity-50" disabled={busy || review.status === document.verificationStatus && review.rejectionReason === (document.rejectionReason || "")} onClick={() => updateDocumentStatus(document)} type="button">Save review</button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <section className="mt-6 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-lg font-semibold text-stone-900">Staff access</h2>
          <form className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3" onSubmit={assignStaff}>
            <label className={`${labelClass} sm:col-span-2 lg:col-span-1`}>Active staff member
              <select className={inputClass} value={accessForm.staffId} onChange={(event) => setAccessForm((current) => ({ ...current, staffId: event.target.value }))} required>
                <option value="">Select staff</option>
                {staff.map((member) => <option key={member._id} value={member._id}>{member.name} · {member.role}</option>)}
              </select>
            </label>
            {ACCESS_FIELDS.map(([key, label]) => (
              <label className="flex min-h-11 items-center gap-2 text-sm text-stone-700" key={key}>
                <input checked={accessForm[key]} onChange={(event) => setAccessForm((current) => ({ ...current, [key]: event.target.checked }))} type="checkbox" />
                {label}
              </label>
            ))}
            <button className="button-primary min-h-11 w-fit rounded-xl px-5 py-3 text-sm font-bold disabled:opacity-50 sm:col-span-2 lg:col-span-3" disabled={busy || !accessForm.staffId} type="submit">Assign or update access</button>
          </form>
          <div className="mt-6 space-y-3">
            {access.map((assignment) => (
              <article className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-stone-200 p-4" key={assignment._id}>
                <div>
                  <h3 className="font-semibold text-stone-900">{assignment.staff?.name || "Staff member"}</h3>
                  <p className="mt-1 text-xs text-stone-600">{assignment.staff?.email} · {assignment.staff?.role}</p>
                  <p className="mt-2 text-xs leading-5 text-stone-600">{ACCESS_FIELDS.filter(([key]) => assignment[key]).map(([, label]) => label).join(" · ") || "No permissions enabled"}</p>
                </div>
                <button className="min-h-9 rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-800 disabled:opacity-50" disabled={busy || !assignment.isActive} onClick={() => revokeAccess(assignment._id)} type="button">Revoke access</button>
              </article>
            ))}
            {access.length === 0 && <p className="text-sm text-stone-600">No active staff assignments returned.</p>}
          </div>
        </section>
      </div>
    </main>
  );
}

export default StaffOwnerDetails;
