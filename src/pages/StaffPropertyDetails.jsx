import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";

function readImagePreview(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve({ name: file.name, src: reader.result });
    reader.onerror = () => reject(new Error(`Unable to preview ${file.name}.`));
    reader.readAsDataURL(file);
  });
}

function StaffPropertyDetails() {
  const { id } = useParams();
  const location = useLocation();
  const { t } = useLanguage();
  const { user } = useAuth();
  const [ownerAccessReady, setOwnerAccessReady] = useState(false);
  const [ownerAccessBusy, setOwnerAccessBusy] = useState(false);
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState(location.state?.message || "");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const fileInput = useRef(null);
  const previewRequest = useRef(0);

  const loadProperty = useCallback(async () => {
    try {
      const response = await api.get("/properties/staff/all");
      const found = (response.data?.properties || []).find((item) => item._id === id);
      if (!found) throw new Error("Property not found in staff records.");
      setError("");
      setProperty(found);
    } catch (requestError) {
      setError(requestError.response?.data?.message || requestError.message || "Unable to load this property.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    // Initial protected API fetch; state updates resolve asynchronously.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadProperty();
  }, [loadProperty]);

  const assignMyOwnerAccess = async () => {
    const ownerRecordId =
      typeof property?.ownerRecord === "string"
        ? property.ownerRecord
        : property?.ownerRecord?._id;

    const staffId = user?.id || user?._id;

    if (!ownerRecordId || !staffId || user?.role !== "admin") {
      setError("Administrator access and a valid owner record are required.");
      return;
    }

    try {
      setOwnerAccessBusy(true);
      setError("");
      setNotice("");

      const { data: accessData } = await api.get(
        `/property-owner-access/owner/${ownerRecordId}`
      );

      const existingAccess = (accessData.access || []).find(
        (item) =>
          (item.staff?._id || item.staff) === staffId && item.isActive
      );

      const hasRequiredPermissions =
        existingAccess?.canViewOwner &&
        existingAccess?.canViewDocuments &&
        existingAccess?.canUploadDocuments &&
        existingAccess?.canVerifyDocuments &&
        existingAccess?.canDownloadDocuments;

      if (!hasRequiredPermissions) {
        await api.post("/property-owner-access", {
          staffId,
          ownerRecord: ownerRecordId,
          canViewOwner: true,
          canViewDocuments: true,
          canUploadDocuments: true,
          canVerifyDocuments: true,
          canDownloadDocuments: true,
        });
      }

      setOwnerAccessReady(true);
      setNotice(
        hasRequiredPermissions
          ? "You already have the required access to this owner record."
          : "Administrator access assigned successfully."
      );
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to assign access to this owner record."
      );
    } finally {
      setOwnerAccessBusy(false);
    }
  };

  const updateProperty = (result) => {
    if (result?.property) {
      setProperty((current) => ({ ...current, ...result.property, _id: current?._id }));
      setNotice(result.message || "Property updated.");
    } else {
      setNotice(result?.message || "Property updated.");
    }
  };

  const runWorkflowAction = async (path, body, confirmMessage) => {
    if (confirmMessage && !window.confirm(confirmMessage)) return;
    try {
      setBusy(true);
      setError("");
      setNotice("");
      const response = await api.patch(`/properties/staff/${id}/${path}`, body);
      updateProperty(response.data);
      await loadProperty();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "The property action could not be completed.");
    } finally {
      setBusy(false);
    }
  };

  const onFilesSelected = (event) => {
    const files = Array.from(event.target.files || []);
    setError("");
    if (files.length > 10) {
      setSelectedFiles([]);
      setPreviews([]);
      previewRequest.current += 1;
      setError("Select no more than 10 images per upload.");
      event.target.value = "";
      return;
    }
    const invalid = files.find((file) => !["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(file.type) || file.size > 10 * 1024 * 1024);
    if (invalid) {
      setSelectedFiles([]);
      setPreviews([]);
      previewRequest.current += 1;
      setError("Images must be JPG, JPEG, PNG, or WEBP and no larger than 10 MB each.");
      event.target.value = "";
      return;
    }
    setSelectedFiles(files);
    setPreviews([]);
    const requestId = ++previewRequest.current;
    Promise.all(files.map(readImagePreview))
      .then((filePreviews) => {
        if (previewRequest.current === requestId) setPreviews(filePreviews);
      })
      .catch((previewError) => {
        if (previewRequest.current === requestId) {
          setError(previewError.message);
        }
      });
  };

  const uploadImages = async (event) => {
    event.preventDefault();
    if (!selectedFiles.length) return;
    const formData = new FormData();
    selectedFiles.forEach((file) => formData.append("images", file));
    try {
      setUploading(true);
      setProgress(0);
      setError("");
      setNotice("");
      const response = await api.post(`/property-images/${id}/images`, formData, {
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) setProgress(Math.round((progressEvent.loaded / progressEvent.total) * 100));
        },
      });
      updateProperty(response.data);
      setSelectedFiles([]);
      setPreviews([]);
      previewRequest.current += 1;
      if (fileInput.current) fileInput.current.value = "";
      await loadProperty();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Image upload failed. Check your connection and try again.");
    } finally {
      setUploading(false);
    }
  };

  const deleteImage = async (index) => {
    if (!window.confirm("Delete this property image? The listing will return to draft and require re-verification.")) return;
    try {
      setBusy(true);
      setError("");
      setNotice("");
      const response = await api.delete(`/property-images/${id}/images/${index}`);
      updateProperty(response.data);
      await loadProperty();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to delete this image.");
    } finally {
      setBusy(false);
    }
  };

  const deleteAllImages = async () => {
    if (!window.confirm("Delete every image for this property? This cannot be undone. The property will return to draft and require re-verification.")) return;
    try {
      setBusy(true);
      setError("");
      setNotice("");
      const response = await api.delete(`/property-images/${id}/images`);
      updateProperty(response.data);
      await loadProperty();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to delete property images.");
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return <main className="staff-page min-h-[60vh] bg-[#fffdf8] px-5 py-12"><div className="mx-auto max-w-6xl animate-pulse"><div className="h-7 w-56 rounded bg-stone-200" /><div className="mt-6 h-48 rounded-2xl bg-stone-200" /></div></main>;
  }
  if (error && !property) {
    return <main className="staff-page min-h-[60vh] bg-[#fffdf8] px-5 py-12"><div className="mx-auto max-w-4xl rounded-2xl border border-red-200 bg-white p-7"><h1 className="text-xl font-semibold">Property unavailable</h1><p className="mt-3 text-sm text-red-800">{error}</p><Link className="mt-5 inline-block text-sm font-bold text-amber-900" to="/staff/properties">← Back to properties</Link></div></main>;
  }

  const images = property?.images || [];
  const isDraft = property?.listingStatus === "DRAFT";
  const isPublished = property?.listingStatus === "PUBLISHED" && property?.isPublished;
  const isUnderReview =
    property?.verificationStatus === "UNDER_REVIEW" &&
    property?.listingStatus === "PENDING_REVIEW";
  const backTo = location.state?.from === "/staff/property-verification"
    ? location.state.from
    : "/staff/properties";

  return (
    <main className="staff-page min-h-screen bg-[#fffdf8] px-4 py-8 sm:px-7 lg:px-10 lg:py-10">
      <div className="mx-auto max-w-6xl">
        <Link className="text-sm font-semibold text-amber-900 hover:underline" to={backTo}>← Back to properties</Link>
        <header className="mt-5 flex flex-wrap items-start justify-between gap-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-900">{t("propertyRecord")}</p>
            <h1 className="mt-2 text-3xl font-semibold text-stone-900">{property.title}</h1>
            <p className="mt-2 text-sm text-stone-600">{[property.address?.area, property.address?.city, property.address?.region].filter(Boolean).join(", ") || "Location unavailable"}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link className="button-primary rounded-xl px-4 py-3 text-sm font-bold" to={`/staff/properties/${id}/edit`}>{t("editProperty")}</Link>
            {isDraft && <button className="rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm font-semibold disabled:opacity-50" disabled={busy} onClick={() => runWorkflowAction("submit-review")} type="button">{t("submitReview")}</button>}
            {isUnderReview && property.verificationStatus !== "VERIFIED" && <button className="rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-900 disabled:opacity-50" disabled={busy} onClick={() => runWorkflowAction("verification", { verificationStatus: "VERIFIED" }, "Verification requires the owner to be verified and at least one active verified owner document. Continue and let the backend validate these requirements?")} type="button">{t("verify")}</button>}
            {isUnderReview && property.verificationStatus !== "REJECTED" && <button className="rounded-xl border border-red-200 bg-white px-4 py-3 text-sm font-semibold text-red-800 disabled:opacity-50" disabled={busy} onClick={() => runWorkflowAction("verification", { verificationStatus: "REJECTED" }, "Reject this property verification?")} type="button">{t("reject")}</button>}
            {property.verificationStatus === "VERIFIED" && !isPublished && <button className="rounded-xl bg-emerald-800 px-4 py-3 text-sm font-bold text-white disabled:opacity-50" disabled={busy} onClick={() => runWorkflowAction("publish")} type="button">{t("publish")}</button>}
            {isPublished && <button className="rounded-xl border border-red-200 bg-white px-4 py-3 text-sm font-semibold text-red-800 disabled:opacity-50" disabled={busy} onClick={() => runWorkflowAction("unpublish", undefined, "Unpublish this property? It will be removed from public listings and returned to draft.")} type="button">{t("unpublish")}</button>}
          </div>
        </header>

        {error && <p className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800" role="alert">{error}</p>}
        {notice && <p className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900" role="status">{notice}</p>}

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            [t("priceLabel"), `${property.currency || "GHS"} ${Number(property.price).toLocaleString("en-GH")}`],
            [t("propertyTypeLabel"), property.propertyType],
            [t("verificationLabel"), property.verificationStatus],
            [t("listingStatusLabel"), property.listingStatus],
          ].map(([label, value]) => (
            <div className="rounded-xl border border-stone-200 bg-white p-4" key={label}>
              <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">{label}</p>
              <p className="mt-2 font-semibold text-stone-900">{value}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
          {t("propertyChangeWarning")} Submit it for review before publishing. The backend confirms every workflow action.
        </div>

        <section className="mt-6 rounded-2xl border border-stone-200 bg-white p-5 sm:p-7">
          <h2 className="text-xl font-semibold text-stone-900">Property owner record</h2>
          <p className="mt-2 text-sm text-stone-600">
            This property is linked to an existing private owner record.
          </p>
          <p className="mt-3 break-all rounded-lg bg-stone-50 p-3 font-mono text-xs text-stone-700">
            Owner record ID: {typeof property.ownerRecord === "string"
              ? property.ownerRecord
              : property.ownerRecord?._id || "Owner record ID unavailable"}
          </p>
          {user?.role === "admin" && (
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button
                className="button-primary min-h-11 rounded-xl px-5 py-3 text-sm font-bold disabled:opacity-50"
                disabled={ownerAccessBusy || !property.ownerRecord}
                onClick={assignMyOwnerAccess}
                type="button"
              >
                {ownerAccessBusy ? "Assigning access…" : "Assign my owner access"}
              </button>
              {ownerAccessReady && (
                <Link
                  className="inline-flex min-h-11 items-center rounded-xl border border-stone-300 px-5 py-3 text-sm font-semibold text-stone-800 hover:border-amber-800"
                  to={`/staff/owners/${typeof property.ownerRecord === "string" ? property.ownerRecord : property.ownerRecord?._id}`}
                >
                  Open owner record
                </Link>
              )}
            </div>
          )}
        </section>

        <section className="mt-6 rounded-2xl border border-stone-200 bg-white p-5 sm:p-7">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-stone-900">{t("propertyImages")}</h2>
              <p className="mt-1 text-sm text-stone-600">{t("imageUploadRules")}</p>
            </div>
            {images.length > 0 && <button className="rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-800 hover:bg-red-50 disabled:opacity-50" disabled={busy || uploading} onClick={deleteAllImages} type="button">{t("deleteAllImages")}</button>}
          </div>
          <form className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-end" onSubmit={uploadImages}>
            <label className="flex-1 text-sm font-semibold text-stone-700">
              {t("selectImages")}
              <input className="mt-1.5 block min-h-11 w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm file:me-3 file:rounded-md file:border-0 file:bg-amber-50 file:px-3 file:py-2 file:font-semibold file:text-amber-950" ref={fileInput} type="file" accept="image/jpeg,image/jpg,image/png,image/webp" multiple onChange={onFilesSelected} />
            </label>
            <button className="button-primary min-h-11 rounded-xl px-5 py-3 text-sm font-bold disabled:opacity-50" disabled={uploading || busy || selectedFiles.length === 0} type="submit">{uploading ? `${t("uploadImages")} ${progress}%` : t("uploadImages")}</button>
          </form>
          {uploading && <progress className="mt-3 h-2 w-full accent-amber-800" max="100" value={progress} aria-label="Image upload progress" />}
          {selectedFiles.length > 0 && <p className="mt-2 text-xs text-stone-600">{selectedFiles.length} image{selectedFiles.length === 1 ? "" : "s"} selected</p>}
          {previews.length > 0 && (
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4" aria-label="Selected image previews">
              {previews.map((preview) => (
                <figure className="overflow-hidden rounded-lg border border-stone-200" key={preview.name}>
                  <img className="aspect-square w-full object-cover" src={preview.src} alt={`Preview: ${preview.name}`} />
                  <figcaption className="truncate p-2 text-xs text-stone-600">{preview.name}</figcaption>
                </figure>
              ))}
            </div>
          )}
          {images.length ? (
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {images.map((image, index) => <figure className="overflow-hidden rounded-xl border border-stone-200" key={`${image}-${index}`}><img className="aspect-[4/3] w-full object-cover" src={image} alt={`${property.title} image ${index + 1}`} /><figcaption className="flex items-center justify-between gap-3 p-3"><span className="text-xs font-medium text-stone-600">{t("image")} {index + 1}</span><button className="rounded-md px-2 py-1 text-xs font-semibold text-red-800 hover:bg-red-50 disabled:opacity-50" disabled={busy || uploading} onClick={() => deleteImage(index)} type="button">{t("delete")}</button></figcaption></figure>)}
            </div>
          ) : <p className="mt-6 rounded-xl border border-dashed border-stone-300 p-7 text-center text-sm text-stone-600">{t("noImagesUploaded")}</p>}
        </section>

        <section className="mt-6 rounded-2xl border border-stone-200 bg-white p-5 sm:p-7">
          <h2 className="text-xl font-semibold text-stone-900">Description</h2>
          <p className="mt-3 whitespace-pre-line text-sm leading-7 text-stone-700">{property.description}</p>
          <div className="mt-6 border-t border-stone-100 pt-5">
            <h3 className="text-sm font-bold text-stone-900">{t("coordinates")}</h3>
            {Array.isArray(property.location?.coordinates) &&
            property.location.coordinates.length === 2 &&
            property.location.coordinates.every(Number.isFinite) ? (
              <p className="mt-2 text-sm text-stone-700" dir="ltr">
                {t("longitude")}: {property.location.coordinates[0]}, {t("latitude")}: {property.location.coordinates[1]}
              </p>
            ) : (
              <p className="mt-2 text-sm text-stone-600">No valid coordinates were returned for this property.</p>
            )}
            <p className="mt-2 text-xs leading-5 text-stone-500">{t("mapProviderNotConfigured")}</p>
          </div>
          <p className="mt-6 break-all border-t border-stone-100 pt-4 font-mono text-xs text-stone-500">Record ID: {property._id}</p>
        </section>
      </div>
    </main>
  );
}

export default StaffPropertyDetails;
