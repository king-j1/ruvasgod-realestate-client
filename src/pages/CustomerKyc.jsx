
import { useCallback, useEffect, useState } from "react";
import api from "../api/axios";

const DOCUMENT_TYPES = [
  { value: "GH_CARD", label: "Ghana Card" },
  { value: "PASSPORT", label: "Passport" },
  { value: "DRIVERS_LICENSE", label: "Driver's Licence" },
];

const STATUS_STYLES = {
  VERIFIED: "bg-green-100 text-green-800",
  PENDING: "bg-amber-100 text-amber-800",
  UNDER_REVIEW: "bg-blue-100 text-blue-800",
  REJECTED: "bg-red-100 text-red-800",
  UNVERIFIED: "bg-stone-100 text-stone-700",
};

function formatStatus(status) {
  return (status || "UNVERIFIED")
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatDate(date) {
  if (!date) return "Not available";

  return new Intl.DateTimeFormat("en-GH", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
}

function CustomerKyc() {
  const [kyc, setKyc] = useState({
    status: "UNVERIFIED",
    documents: [],
  });

  const [documentType, setDocumentType] = useState("GH_CARD");
  const [documentName, setDocumentName] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [downloadingId, setDownloadingId] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadKyc = useCallback(async () => {
    setError("");

    try {
      const { data } = await api.get("/customer-kyc/me");
      setKyc(data.kyc);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load your verification information.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadKyc();
  }, [loadKyc]);

  const handleUpload = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!documentName.trim()) {
      setError("Please enter a document name.");
      return;
    }

    if (!file) {
      setError("Please select an identity document.");
      return;
    }

    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      setError("Only PDF, JPG, PNG and WEBP files are allowed.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("File size must not exceed 10 MB.");
      return;
    }

    const formData = new FormData();
    formData.append("documentType", documentType);
    formData.append("documentName", documentName.trim());
    formData.append("document", file);

    setUploading(true);

    try {
      const { data } = await api.post(
        "/customer-kyc/documents",
        formData,
      );

      setSuccess(data.message || "Document submitted successfully.");
      setDocumentName("");
      setFile(null);

      const input = document.getElementById("kyc-document");
      if (input) input.value = "";

      await loadKyc();
    } catch (err) {
      setError(
        err.response?.data?.message || "Document upload failed.",
      );
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (id) => {
    setError("");
    setDownloadingId(id);

    const documentWindow = window.open("", "_blank");

    try {
      const { data } = await api.get(
        `/customer-kyc/documents/${id}/download`,
      );

      if (!data?.access?.url) {
        throw new Error("Secure document access was not returned.");
      }

      if (documentWindow) {
        documentWindow.location.href = data.access.url;
      } else {
        window.location.assign(data.access.url);
      }
    } catch (err) {
      if (documentWindow) documentWindow.close();

      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to access this document.",
      );
    } finally {
      setDownloadingId("");
    }
  };

  const overallStatus = kyc.status || "UNVERIFIED";

  return (
    <main className="min-h-[70vh] bg-[#fffdf8] px-5 py-12 sm:px-8 lg:px-10 lg:py-16">
      <div className="mx-auto max-w-5xl">

        <header>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-900">
            Ruvasgod Real Estate
          </p>

          <h1 className="mt-3 text-3xl font-semibold text-stone-900 sm:text-4xl">
            Identity verification
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-600">
            Submit your identity documents so our verification team
            can confirm your account.
          </p>
        </header>

        {error && (
          <div role="alert" className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            {error}
          </div>
        )}

        {success && (
          <div role="status" className="mt-6 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">
            {success}
          </div>
        )}

        <section className="mt-8 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-stone-900">
                Verification status
              </h2>
              <p className="mt-1 text-sm text-stone-500">
                Your current identity verification status.
              </p>
            </div>

            <span className={`inline-flex w-fit rounded-full px-4 py-2 text-sm font-semibold ${STATUS_STYLES[overallStatus] || STATUS_STYLES.UNVERIFIED}`}>
              {formatStatus(overallStatus)}
            </span>
          </div>

          {overallStatus === "VERIFIED" && (
            <p className="mt-4 text-sm text-green-700">
              Your identity has been verified.
            </p>
          )}

          {overallStatus === "REJECTED" && (
            <p className="mt-4 text-sm text-red-700">
              One or more documents were rejected. Review the feedback below.
            </p>
          )}
        </section>

        <section className="mt-6 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-xl font-semibold text-stone-900">
            Submit an identity document
          </h2>

          <p className="mt-2 text-sm text-stone-600">
            PDF, JPG, PNG or WEBP. Maximum file size: 10 MB.
          </p>

          <form onSubmit={handleUpload} className="mt-6 space-y-5">

            <div>
              <label htmlFor="document-type" className="mb-2 block text-sm font-semibold text-stone-700">
                Document type
              </label>

              <select
                id="document-type"
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value)}
                className="min-h-12 w-full rounded-xl border border-stone-300 bg-white px-4 text-sm text-stone-800"
              >
                {DOCUMENT_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="document-name" className="mb-2 block text-sm font-semibold text-stone-700">
                Document name
              </label>

              <input
                id="document-name"
                type="text"
                value={documentName}
                onChange={(e) => setDocumentName(e.target.value)}
                maxLength={200}
                placeholder="e.g. My Ghana Card"
                required
                className="min-h-12 w-full rounded-xl border border-stone-300 px-4 text-sm text-stone-800"
              />
            </div>

            <div>
              <label htmlFor="kyc-document" className="mb-2 block text-sm font-semibold text-stone-700">
                Select document
              </label>

              <input
                id="kyc-document"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.webp"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                required
                className="block w-full rounded-xl border border-stone-300 bg-white p-3 text-sm text-stone-700"
              />

              {file && (
                <p className="mt-2 text-xs text-stone-500">
                  Selected: {file.name}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={uploading}
              className="min-h-12 rounded-xl bg-amber-700 px-6 py-3 text-sm font-semibold text-white hover:bg-amber-800 disabled:opacity-60"
            >
              {uploading ? "Submitting..." : "Submit for verification"}
            </button>

          </form>
        </section>

        <section className="mt-6 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-xl font-semibold text-stone-900">
            Submitted documents
          </h2>

          {loading ? (
            <p className="mt-6 text-sm text-stone-500">
              Loading verification records...
            </p>
          ) : kyc.documents.length === 0 ? (
            <div className="mt-6 rounded-xl bg-stone-50 p-6 text-center">
              <p className="text-sm text-stone-700">
                No identity documents submitted yet.
              </p>
            </div>
          ) : (
            <div className="mt-6 divide-y divide-stone-200">
              {kyc.documents.map((document) => {
                const id = document._id || document.id;

                return (
                  <article key={id} className="py-5">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <h3 className="font-semibold text-stone-900">
                          {DOCUMENT_TYPES.find(
                            (type) => type.value === document.documentType,
                          )?.label || document.documentType}
                        </h3>

                        <p className="mt-1 text-xs text-stone-500">
                          Submitted {formatDate(document.createdAt)}
                        </p>
                      </div>

                      <span className={`inline-flex w-fit rounded-full px-3 py-1.5 text-xs font-semibold ${STATUS_STYLES[document.verificationStatus] || STATUS_STYLES.UNVERIFIED}`}>
                        {formatStatus(document.verificationStatus)}
                      </span>
                    </div>

                    {document.rejectionReason && (
                      <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3">
                        <p className="text-xs font-bold text-red-800">
                          Review feedback
                        </p>
                        <p className="mt-1 text-sm text-red-700">
                          {document.rejectionReason}
                        </p>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => handleDownload(id)}
                      disabled={downloadingId === id}
                      className="mt-3 text-sm font-semibold text-amber-900 underline underline-offset-4 disabled:opacity-50"
                    >
                      {downloadingId === id
                        ? "Preparing access..."
                        : "View submitted document"}
                    </button>
                  </article>
                );
              })}
            </div>
          )}

          {!loading && (
            <button
              type="button"
              onClick={loadKyc}
              className="mt-6 text-sm font-semibold text-amber-900 underline underline-offset-4"
            >
              Refresh verification status
            </button>
          )}
        </section>

      </div>
    </main>
  );
}

export default CustomerKyc;
