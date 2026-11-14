import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../api/axios";

function formatStatus(status) {
  return (status || "UNKNOWN")
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function formatMoney(amount, currency = "GHS") {
  if (amount === null || amount === undefined) return "Not specified";

  return new Intl.NumberFormat("en-GH", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatDate(date) {
  if (!date) return "Not specified";

  return new Intl.DateTimeFormat("en-GH", {
    dateStyle: "long",
  }).format(new Date(date));
}

function Detail({ label, value }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-stone-500">
        {label}
      </dt>
      <dd className="mt-1 break-words text-sm font-medium text-stone-900">
        {value ?? "Not specified"}
      </dd>
    </div>
  );
}

function CustomerAgreementDetails() {
  const { id } = useParams();

  const [agreement, setAgreement] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [file, setFile] = useState(null);

  const [loading, setLoading] = useState(true);
  const [documentsLoading, setDocumentsLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [downloadingId, setDownloadingId] = useState(null);

  const [error, setError] = useState("");
  const [documentsError, setDocumentsError] = useState("");
  const [success, setSuccess] = useState("");

  const loadAgreement = useCallback(async () => {
    try {
      setError("");

      const { data } = await api.get(`/paims/agreements/${id}`);
      setAgreement(data.agreement);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to retrieve this agreement.",
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  const loadDocuments = useCallback(async () => {
    try {
      setDocumentsError("");
      setDocumentsLoading(true);

      const { data } = await api.get(`/paims/agreements/${id}/documents`);

      setDocuments(data.documents || []);
    } catch (requestError) {
      setDocumentsError(
        requestError.response?.data?.message ||
          "Unable to retrieve agreement documents.",
      );
    } finally {
      setDocumentsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadAgreement();
    loadDocuments();
  }, [loadAgreement, loadDocuments]);

  const handleSignedUpload = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!file) {
      setError("Please select your signed agreement.");
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
      setError("The signed document must not exceed 10 MB.");
      return;
    }

    const formData = new FormData();
    formData.append("document", file);

    setUploading(true);

    try {
      const { data } = await api.post(
        `/paims/agreements/${id}/signed-document`,
        formData,
      );

      setSuccess(
        data.message ||
          "Signed agreement uploaded. It is awaiting staff verification.",
      );

      setFile(null);

      const input = document.getElementById("signed-agreement");

      if (input) {
        input.value = "";
      }

      await Promise.all([loadAgreement(), loadDocuments()]);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to upload the signed agreement.",
      );
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (documentId) => {
    setDocumentsError("");
    setDownloadingId(documentId);

    try {
      const { data } = await api.get(`/paims/documents/${documentId}/download`);

      if (!data.access?.url) {
        throw new Error("A secure download link was not returned.");
      }

      window.location.assign(data.access.url);
    } catch (requestError) {
      setDocumentsError(
        requestError.response?.data?.message ||
          requestError.message ||
          "Unable to download this document.",
      );
    } finally {
      setDownloadingId(null);
    }
  };

  if (loading) {
    return (
      <main className="min-h-[70vh] bg-[#fffdf8] px-5 py-16">
        <div className="mx-auto max-w-5xl text-sm text-stone-500">
          Loading agreement...
        </div>
      </main>
    );
  }

  if (!agreement) {
    return (
      <main className="min-h-[70vh] bg-[#fffdf8] px-5 py-16">
        <div className="mx-auto max-w-5xl">
          <p className="text-sm text-red-700">
            {error || "Agreement not found."}
          </p>

          <Link
            to="/account/agreements"
            className="mt-5 inline-block text-sm font-semibold text-amber-900 underline"
          >
            Return to agreements
          </Link>
        </div>
      </main>
    );
  }

  const terms = agreement.financialTerms || {};

  const property =
    agreement.property && typeof agreement.property === "object"
      ? agreement.property
      : null;

  const hasSignedAgreement = documents.some(
    (document) => document.documentType === "SIGNED_AGREEMENT",
  );

  const canUploadSignedDocument =
    agreement.status === "PENDING_SIGNATURE" && !hasSignedAgreement;

  const address = property?.address;

  const addressText =
    typeof address === "string"
      ? address
      : [address?.street, address?.city, address?.region, address?.country]
          .filter(Boolean)
          .join(", ");

  return (
    <main className="min-h-[70vh] bg-[#fffdf8] px-5 py-12 sm:px-8 lg:px-10 lg:py-16">
      <div className="mx-auto max-w-5xl">
        <Link
          to="/account/agreements"
          className="text-sm font-semibold text-amber-900 underline underline-offset-4"
        >
          ← Back to my agreements
        </Link>

        <header className="mt-6">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-900">
            Ruvasgod Real Estate
          </p>

          <h1 className="mt-3 text-3xl font-semibold text-stone-900 sm:text-4xl">
            Agreement details
          </h1>

          <p className="mt-2 text-sm text-stone-500">
            Agreement number: {agreement.agreementNumber}
          </p>

          <span className="mt-4 inline-flex rounded-full bg-amber-100 px-4 py-2 text-sm font-semibold text-amber-900">
            {formatStatus(agreement.status)}
          </span>
        </header>

        {error && (
          <div
            role="alert"
            className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
          >
            {error}
          </div>
        )}

        {success && (
          <div
            role="status"
            className="mt-6 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800"
          >
            {success}
          </div>
        )}

        {/* PROPERTY INFORMATION */}

        <section className="mt-8 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-xl font-semibold text-stone-900">
            Property information
          </h2>

          <dl className="mt-6 grid gap-5 sm:grid-cols-2">
            <Detail label="Property" value={property?.title} />

            <Detail
              label="Agreement type"
              value={
                agreement.agreementType === "PURCHASE"
                  ? "Purchase"
                  : agreement.agreementType === "LEASE"
                    ? "Lease"
                    : "Rental"
              }
            />

            <Detail
              label="Property address"
              value={addressText || "Not specified"}
            />

            <Detail label="Property type" value={property?.propertyType} />
          </dl>
        </section>

        {/* FINANCIAL TERMS */}

        <section className="mt-6 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-xl font-semibold text-stone-900">
            Financial terms
          </h2>

          <dl className="mt-6 grid gap-5 sm:grid-cols-2">
            <Detail
              label="Agreed amount"
              value={formatMoney(terms.agreedAmount, agreement.currency)}
            />

            <Detail
              label="Property price"
              value={formatMoney(terms.propertyPrice, agreement.currency)}
            />

            <Detail
              label="Deposit"
              value={formatMoney(terms.depositAmount, agreement.currency)}
            />

            <Detail
              label="Installment amount"
              value={formatMoney(terms.installmentAmount, agreement.currency)}
            />

            <Detail
              label="Installment frequency"
              value={terms.installmentFrequency}
            />

            <Detail
              label="Total installments"
              value={terms.totalInstallments}
            />

            <Detail
              label="Advance rent"
              value={formatMoney(terms.advanceRent, agreement.currency)}
            />

            <Detail
              label="Security deposit"
              value={formatMoney(terms.securityDeposit, agreement.currency)}
            />

            <Detail label="Rental period" value={terms.rentalPeriod} />
          </dl>
        </section>

        {/* AGREEMENT TIMELINE */}

        <section className="mt-6 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-xl font-semibold text-stone-900">
            Agreement timeline
          </h2>

          <dl className="mt-6 grid gap-5 sm:grid-cols-2">
            <Detail
              label="Start date"
              value={formatDate(agreement.startDate)}
            />

            <Detail label="End date" value={formatDate(agreement.endDate)} />

            <Detail
              label="Approved date"
              value={formatDate(agreement.approvedAt)}
            />

            <Detail
              label="Signed date"
              value={formatDate(agreement.signedAt)}
            />

            <Detail
              label="Activated date"
              value={formatDate(agreement.activatedAt)}
            />

            <Detail
              label="Created date"
              value={formatDate(agreement.createdAt)}
            />
          </dl>
        </section>

        {/* OWNERSHIP TRANSFER */}

        {agreement.ownershipTransfer &&
          agreement.agreementType === "PURCHASE" && (
            <section className="mt-6 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
              <h2 className="text-xl font-semibold text-stone-900">
                Ownership transfer
              </h2>

              <dl className="mt-5 grid gap-5 sm:grid-cols-2">
                <Detail
                  label="Transfer required"
                  value={agreement.ownershipTransfer.required ? "Yes" : "No"}
                />

                <Detail
                  label="Transfer date"
                  value={formatDate(agreement.ownershipTransfer.transferredAt)}
                />

                <Detail
                  label="Transfer conditions"
                  value={agreement.ownershipTransfer.condition}
                />
              </dl>
            </section>
          )}

        {/* AGREEMENT DOCUMENTS */}

        <section className="mt-6 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-xl font-semibold text-stone-900">
            Agreement documents
          </h2>

          <p className="mt-2 text-sm text-stone-500">
            Securely access documents associated with this agreement.
          </p>

          {documentsError && (
            <div
              role="alert"
              className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
            >
              {documentsError}
            </div>
          )}

          {documentsLoading ? (
            <p className="mt-5 text-sm text-stone-500">Loading documents...</p>
          ) : documents.length === 0 ? (
            <p className="mt-5 rounded-xl bg-stone-50 p-4 text-sm text-stone-600">
              No documents have been uploaded for this agreement yet.
            </p>
          ) : (
            <div className="mt-5 space-y-3">
              {documents.map((document) => (
                <div
                  key={document._id}
                  className="flex flex-col gap-4 rounded-xl border border-stone-200 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="break-words text-sm font-semibold text-stone-900">
                      {document.documentName}
                    </p>

                    <p className="mt-1 text-xs text-stone-500">
                      {formatStatus(document.documentType)}
                    </p>

                    <p className="mt-1 text-xs text-stone-500">
                      Uploaded: {formatDate(document.createdAt)}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDownload(document._id)}
                    disabled={downloadingId === document._id}
                    className="min-h-11 shrink-0 rounded-xl bg-amber-700 px-5 py-2 text-sm font-semibold text-white hover:bg-amber-800 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {downloadingId === document._id
                      ? "Preparing..."
                      : "Download document"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* SIGNED AGREEMENT UPLOAD */}

        {canUploadSignedDocument && (
          <section className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-6 sm:p-8">
            <h2 className="text-xl font-semibold text-amber-950">
              Upload your signed agreement
            </h2>

            <p className="mt-2 text-sm leading-6 text-amber-950/80">
              Sign your agreement document and upload the signed copy here.
              Authorised staff must verify it before the agreement becomes
              active.
            </p>

            <form onSubmit={handleSignedUpload} className="mt-6 space-y-4">
              <div>
                <label
                  htmlFor="signed-agreement"
                  className="mb-2 block text-sm font-semibold text-stone-800"
                >
                  Signed agreement document
                </label>

                <input
                  id="signed-agreement"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.webp"
                  required
                  onChange={(event) => setFile(event.target.files?.[0] || null)}
                  className="block w-full rounded-xl border border-stone-300 bg-white p-3 text-sm"
                />

                <p className="mt-2 text-xs text-stone-600">
                  PDF, JPG, PNG or WEBP. Maximum 10 MB.
                </p>
              </div>

              <button
                type="submit"
                disabled={uploading}
                className="min-h-12 rounded-xl bg-amber-700 px-6 py-3 text-sm font-semibold text-white hover:bg-amber-800 disabled:opacity-60"
              >
                {uploading ? "Uploading..." : "Upload signed agreement"}
              </button>
            </form>
          </section>
        )}

        {hasSignedAgreement && agreement.status === "PENDING_SIGNATURE" && (
          <div className="mt-6 rounded-xl border border-purple-200 bg-purple-50 p-4 text-sm text-purple-800">
            Your signed agreement has been received and is awaiting verification
            by authorised staff.
          </div>
        )}

        {agreement.status === "ACTIVE" && (
          <div className="mt-6 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">
            Your agreement is active.
          </div>
        )}

        {agreement.status === "CANCELLED" && agreement.cancellationReason && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            Cancellation reason: {agreement.cancellationReason}
          </div>
        )}
      </div>
    </main>
  );
}

export default CustomerAgreementDetails;
