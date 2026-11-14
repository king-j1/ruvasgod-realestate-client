import { useCallback, useEffect, useState } from "react";
import api from "../api/axios";

function money(amount, currency = "GHS") {
  return new Intl.NumberFormat("en-GH", {
    style: "currency",
    currency,
  }).format(Number(amount || 0));
}

function date(value) {
  return value ? new Date(value).toLocaleDateString("en-GH") : "—";
}

function StaffPaymentQueue() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [selected, setSelected] = useState(null);
  const [decision, setDecision] = useState("CONFIRMED");
  const [reason, setReason] = useState("");

  const [saving, setSaving] = useState(false);
  const [receiptLoading, setReceiptLoading] = useState(false);
  const [receiptAccess, setReceiptAccess] = useState(null);

  const loadPayments = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/paims/payments/queue");
      setPayments(response.data.payments || []);
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to load the payment queue.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPayments();
  }, [loadPayments]);

  function openReview(payment) {
    setSelected(payment);
    setDecision("CONFIRMED");
    setReason("");
    setReceiptAccess(null);
    setError("");
    setNotice("");
  }

  function closeReview() {
    if (saving) return;

    setSelected(null);
    setReason("");
    setReceiptAccess(null);
    setError("");
  }

  const hasReceipt = (payment) =>
    Boolean(payment.receiptMimeType || payment.receiptFileSize);

  const receiptIsRequired = (payment) => payment.receiptRequired === true;

  const canConfirm = (payment) =>
    !receiptIsRequired(payment) || hasReceipt(payment);

  async function handleViewReceipt(paymentId) {
    setReceiptLoading(true);
    setError("");
    setReceiptAccess(null);

    try {
      const response = await api.get(`/paims/payments/${paymentId}/receipt`);

      const access = response.data?.access;

      if (!access?.url) {
        throw new Error("A secure receipt link was not returned.");
      }

      setReceiptAccess({
        url: access.url,
        expiresAt: access.expiresAt,
      });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to access the payment receipt.",
      );
    } finally {
      setReceiptLoading(false);
    }
  }

  async function handleReview(event) {
    event.preventDefault();

    if (!selected) return;

    if (decision === "CONFIRMED" && !canConfirm(selected)) {
      setError(
        "This payment requires receipt evidence before Finance can confirm it.",
      );
      return;
    }

    if (decision === "REJECTED" && reason.trim().length < 3) {
      setError("Please provide a reason for rejecting this payment.");
      return;
    }

    setSaving(true);
    setError("");
    setNotice("");

    try {
      const response = await api.patch(
        `/paims/payments/${selected._id}/review`,
        {
          decision,
          ...(decision === "REJECTED" ? { reason: reason.trim() } : {}),
        },
      );

      setNotice(response.data.message || "Payment review completed.");

      setSelected(null);
      setReason("");
      setReceiptAccess(null);

      await loadPayments();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to review this payment.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#fffdf8] px-5 py-10 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-900">
              Finance operations
            </p>

            <h1 className="mt-2 text-3xl font-semibold text-stone-900">
              Payment queue
            </h1>

            <p className="mt-2 text-sm text-stone-600">
              Review customer payments and verify their payment evidence.
            </p>
          </div>

          <button
            type="button"
            onClick={loadPayments}
            disabled={loading}
            className="rounded-xl border border-stone-300 bg-white px-5 py-3 text-sm font-semibold text-stone-700 hover:bg-stone-50 disabled:opacity-50"
          >
            {loading ? "Refreshing..." : "Refresh queue"}
          </button>
        </header>

        {error && (
          <div
            role="alert"
            className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
          >
            {error}
          </div>
        )}

        {notice && (
          <div
            role="status"
            className="mb-5 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800"
          >
            {notice}
          </div>
        )}

        <section className="mb-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-stone-500">Awaiting review</p>

            <p className="mt-2 text-3xl font-bold text-amber-800">
              {payments.length}
            </p>
          </div>

          <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-stone-500">Total awaiting review</p>

            <p className="mt-2 text-2xl font-bold text-stone-900">
              {money(
                payments.reduce(
                  (sum, payment) => sum + Number(payment.amount || 0),
                  0,
                ),
              )}
            </p>
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
          <div className="border-b border-stone-200 p-6">
            <h2 className="text-lg font-semibold text-stone-900">
              Submitted payments
            </h2>
          </div>

          {loading ? (
            <p className="p-8 text-sm text-stone-500">
              Loading payment records...
            </p>
          ) : payments.length === 0 ? (
            <div className="p-10 text-center">
              <h3 className="font-semibold text-stone-900">
                No payments awaiting review
              </h3>

              <p className="mt-2 text-sm text-stone-500">
                New customer payment submissions will appear here.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[950px] text-left text-sm">
                <thead className="bg-stone-50 text-xs uppercase tracking-wide text-stone-500">
                  <tr>
                    <th className="px-5 py-4">Date</th>
                    <th className="px-5 py-4">Customer</th>
                    <th className="px-5 py-4">Agreement</th>
                    <th className="px-5 py-4">Method</th>
                    <th className="px-5 py-4">Reference</th>
                    <th className="px-5 py-4">Amount</th>
                    <th className="px-5 py-4">Receipt</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {payments.map((payment) => (
                    <tr key={payment._id} className="border-t border-stone-100">
                      <td className="px-5 py-4 text-stone-600">
                        {date(payment.createdAt)}
                      </td>

                      <td className="px-5 py-4">
                        <p className="font-semibold text-stone-900">
                          {payment.customer?.name || "Customer"}
                        </p>

                        <p className="text-xs text-stone-500">
                          {payment.customer?.email || ""}
                        </p>
                      </td>

                      <td className="px-5 py-4 text-stone-700">
                        {payment.agreement?.agreementNumber || "—"}
                      </td>

                      <td className="px-5 py-4 text-stone-700">
                        {(payment.paymentMethod || "").replaceAll("_", " ")}
                      </td>

                      <td className="px-5 py-4 text-stone-600">
                        {payment.paymentReference || "—"}
                      </td>

                      <td className="px-5 py-4 font-semibold text-stone-900">
                        {money(payment.amount, payment.currency)}
                      </td>

                      <td className="px-5 py-4">
                        {hasReceipt(payment) ? (
                          <span className="text-xs font-semibold text-green-700">
                            Uploaded
                          </span>
                        ) : (
                          <span className="text-xs font-semibold text-red-600">
                            Missing
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">
                          {payment.status}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <button
                          type="button"
                          onClick={() => openReview(payment)}
                          className="rounded-lg bg-amber-700 px-4 py-2 text-xs font-bold text-white hover:bg-amber-800"
                        >
                          Review
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {selected && (
          <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4">
            <section
              role="dialog"
              aria-modal="true"
              aria-labelledby="review-title"
              className="my-8 w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2
                    id="review-title"
                    className="text-xl font-semibold text-stone-900"
                  >
                    Review customer payment
                  </h2>

                  <p className="mt-1 text-sm text-stone-500">
                    Verify the payment details and supporting evidence.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={closeReview}
                  disabled={saving}
                  className="rounded-lg px-3 py-2 text-stone-500 hover:bg-stone-100 disabled:opacity-50"
                  aria-label="Close review"
                >
                  ✕
                </button>
              </div>

              <div className="mt-5 space-y-3 rounded-xl bg-stone-50 p-4 text-sm">
                <p>
                  <span className="text-stone-500">Customer: </span>
                  <strong>{selected.customer?.name || "Customer"}</strong>
                </p>

                <p>
                  <span className="text-stone-500">Agreement: </span>
                  <strong>{selected.agreement?.agreementNumber || "—"}</strong>
                </p>

                <p>
                  <span className="text-stone-500">Amount: </span>
                  <strong>{money(selected.amount, selected.currency)}</strong>
                </p>

                <p>
                  <span className="text-stone-500">Method: </span>
                  <strong>
                    {selected.paymentMethod?.replaceAll("_", " ")}
                  </strong>
                </p>

                <p>
                  <span className="text-stone-500">Reference: </span>
                  <strong>{selected.paymentReference || "—"}</strong>
                </p>

                <p>
                  <span className="text-stone-500">Submitted: </span>
                  <strong>{date(selected.createdAt)}</strong>
                </p>
              </div>

              <div className="mt-5 rounded-xl border border-stone-200 p-4">
                <h3 className="font-semibold text-stone-900">
                  Payment evidence
                </h3>

                {hasReceipt(selected) ? (
                  <>
                    <p className="mt-2 text-sm text-green-700">
                      Receipt uploaded
                      {selected.receiptMimeType
                        ? ` (${selected.receiptMimeType})`
                        : ""}
                    </p>

                    <button
                      type="button"
                      onClick={() => handleViewReceipt(selected._id)}
                      disabled={receiptLoading}
                      className="mt-3 rounded-lg border border-amber-700 px-4 py-2 text-sm font-semibold text-amber-900 hover:bg-amber-50 disabled:opacity-50"
                    >
                      {receiptLoading
                        ? "Preparing secure link..."
                        : "Get secure receipt link"}
                    </button>

                    {receiptAccess && (
                      <div className="mt-3 rounded-lg bg-green-50 p-3">
                        <p className="text-sm text-green-800">
                          Secure receipt link is ready.
                        </p>

                        <a
                          href={receiptAccess.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-2 inline-flex text-sm font-bold text-amber-900 underline"
                        >
                          Open payment receipt
                        </a>

                        {receiptAccess.expiresAt && (
                          <p className="mt-2 text-xs text-stone-500">
                            Temporary access expires:{" "}
                            {new Date(
                              Number(receiptAccess.expiresAt) * 1000,
                            ).toLocaleString("en-GH")}
                          </p>
                        )}
                      </div>
                    )}
                  </>
                ) : (
                  <p className="mt-2 text-sm text-red-700">
                    No receipt has been uploaded.
                  </p>
                )}
              </div>

              {selected.recordedBy &&
                String(selected.recordedBy._id || selected.recordedBy) ===
                  String(selected.customer?._id) && (
                  <p className="mt-4 text-sm text-amber-800">
                    The backend will enforce separation of duties before this
                    payment can be reviewed.
                  </p>
                )}

              {receiptIsRequired(selected) && !hasReceipt(selected) && (
                <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
                  Receipt evidence is required before this payment can be
                  confirmed. You may reject the submission if appropriate.
                </div>
              )}

              <form onSubmit={handleReview} className="mt-6 space-y-4">
                <div>
                  <label
                    htmlFor="decision"
                    className="mb-2 block text-sm font-semibold text-stone-700"
                  >
                    Review decision
                  </label>

                  <select
                    id="decision"
                    value={decision}
                    onChange={(event) => setDecision(event.target.value)}
                    className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3"
                  >
                    <option value="CONFIRMED" disabled={!canConfirm(selected)}>
                      Confirm payment
                    </option>

                    <option value="REJECTED">Reject payment</option>
                  </select>
                </div>

                {decision === "REJECTED" && (
                  <div>
                    <label
                      htmlFor="reason"
                      className="mb-2 block text-sm font-semibold text-stone-700"
                    >
                      Rejection reason
                    </label>

                    <textarea
                      id="reason"
                      required
                      minLength={3}
                      maxLength={2000}
                      rows={4}
                      value={reason}
                      onChange={(event) => setReason(event.target.value)}
                      className="w-full rounded-xl border border-stone-300 px-4 py-3"
                      placeholder="Explain why this payment is being rejected..."
                    />
                  </div>
                )}

                {error && (
                  <p role="alert" className="text-sm text-red-700">
                    {error}
                  </p>
                )}

                <p className="text-xs leading-5 text-stone-500">
                  Confirming a payment updates its allocated installment
                  balances. Review the payment evidence before confirming.
                </p>

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    disabled={saving}
                    onClick={closeReview}
                    className="rounded-xl border border-stone-300 px-5 py-3 text-sm font-semibold"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={
                      saving ||
                      (decision === "CONFIRMED" && !canConfirm(selected))
                    }
                    className="rounded-xl bg-amber-700 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
                  >
                    {saving ? "Processing..." : "Submit decision"}
                  </button>
                </div>
              </form>
            </section>
          </div>
        )}
      </div>
    </main>
  );
}

export default StaffPaymentQueue;
