
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";

const PAYMENT_METHODS = [
  { value: "BANK_TRANSFER", label: "Bank transfer" },
  { value: "MOBILE_MONEY", label: "Mobile money" },
  { value: "CASH", label: "Cash" },
];

const MAX_RECEIPT_SIZE = 10 * 1024 * 1024;

const ALLOWED_RECEIPT_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "application/pdf",
];

function formatMoney(amount, currency = "GHS") {
  return new Intl.NumberFormat("en-GH", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(Number(amount || 0));
}

function formatDate(date) {
  if (!date) return "Not scheduled";

  return new Date(date).toLocaleDateString("en-GH", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getErrorMessage(error) {
  return (
    error.response?.data?.message ||
    error.response?.data?.errors?.[0]?.message ||
    error.message ||
    "Something went wrong. Please try again."
  );
}

function StatusBadge({ status }) {
  const styles = {
    ACTIVE: "bg-green-100 text-green-800",
    COMPLETED: "bg-blue-100 text-blue-800",
    PENDING: "bg-amber-100 text-amber-800",
    PARTIALLY_PAID: "bg-orange-100 text-orange-800",
    PAID: "bg-green-100 text-green-800",
    OVERDUE: "bg-red-100 text-red-800",
    WAIVED: "bg-stone-100 text-stone-700",
    CANCELLED: "bg-stone-100 text-stone-700",
    SUBMITTED: "bg-amber-100 text-amber-800",
    UNDER_REVIEW: "bg-blue-100 text-blue-800",
    CONFIRMED: "bg-green-100 text-green-800",
    REJECTED: "bg-red-100 text-red-800",
    REVERSED: "bg-stone-100 text-stone-700",
  };

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
        styles[status] || "bg-stone-100 text-stone-700"
      }`}
    >
      {(status || "UNKNOWN").replaceAll("_", " ")}
    </span>
  );
}

function CustomerInstallments() {
  const [agreements, setAgreements] = useState([]);
  const [plans, setPlans] = useState([]);
  const [payments, setPayments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [selectedInstallment, setSelectedInstallment] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("BANK_TRANSFER");
  const [paymentReference, setPaymentReference] = useState("");
  const [receiptFile, setReceiptFile] = useState(null);

  // Retained when payment creation succeeds but receipt upload fails.
  // This prevents accidentally creating a duplicate payment on retry.
  const [receiptUploadPaymentId, setReceiptUploadPaymentId] = useState(null);

  const [submitting, setSubmitting] = useState(false);
  const [viewingReceiptId, setViewingReceiptId] = useState(null);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [agreementsResponse, paymentsResponse] = await Promise.all([
        api.get("/paims/agreements"),
        api.get("/paims/payments/my"),
      ]);

      const agreementData = agreementsResponse.data;
      const paymentData = paymentsResponse.data;

      const agreementList = Array.isArray(agreementData)
        ? agreementData
        : agreementData.agreements || [];

      const paymentList = Array.isArray(paymentData)
        ? paymentData
        : paymentData.payments || [];

      setAgreements(agreementList);
      setPayments(paymentList);

      const planResults = await Promise.all(
        agreementList.map(async (agreement) => {
          const agreementId = agreement._id || agreement.id;

          if (!agreementId) return null;

          try {
            const response = await api.get(
              `/paims/agreements/${agreementId}/payment-plan`
            );

            return {
              agreement,
              ...response.data,
            };
          } catch (planError) {
            if (planError.response?.status === 404) {
              return null;
            }

            throw planError;
          }
        })
      );

      setPlans(planResults.filter(Boolean));
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  function openPaymentForm(installment, agreement) {
    const outstanding =
      Number(installment.amountDue || 0) -
      Number(installment.amountPaid || 0);

    setSelectedInstallment({
      installment,
      agreement,
      outstanding,
    });

    setPaymentAmount(outstanding.toFixed(2));
    setPaymentMethod("BANK_TRANSFER");
    setPaymentReference("");
    setReceiptFile(null);
    setReceiptUploadPaymentId(null);
    setNotice("");
    setError("");
  }

  function closePaymentForm() {
    setSelectedInstallment(null);
    setPaymentAmount("");
    setPaymentReference("");
    setReceiptFile(null);
    setReceiptUploadPaymentId(null);
    setError("");
  }

  function validateReceipt(file) {
    if (!file) {
      return "Please attach your payment receipt.";
    }

    if (!ALLOWED_RECEIPT_TYPES.includes(file.type)) {
      return "Only JPG, JPEG, PNG, WEBP and PDF files are allowed.";
    }

    if (file.size > MAX_RECEIPT_SIZE) {
      return "Your receipt must not exceed 10 MB.";
    }

    return "";
  }

  async function uploadPaymentReceipt(paymentId, file) {
    const formData = new FormData();
    formData.append("receipt", file);

    await api.post(
      `/paims/payments/${paymentId}/receipt`,
      formData
    );
  }

  async function handlePaymentSubmit(event) {
    event.preventDefault();

    if (!selectedInstallment) return;

    setError("");
    setNotice("");

    const receiptError = validateReceipt(receiptFile);

    if (receiptError) {
      setError(receiptError);
      return;
    }

    setSubmitting(true);

    try {
      let paymentId = receiptUploadPaymentId;

      // Create the payment only once.
      // If receipt upload previously failed, reuse the saved payment ID.
      if (!paymentId) {
        const amount = Number(paymentAmount);

        const {
          installment,
          agreement,
          outstanding,
        } = selectedInstallment;

        const agreementId = agreement._id || agreement.id;
        const installmentId = installment._id || installment.id;

        if (!Number.isFinite(amount) || amount <= 0) {
          setError("Enter a valid payment amount.");
          return;
        }

        if (amount > outstanding) {
          setError(
            "The payment cannot exceed the outstanding installment balance."
          );
          return;
        }

        if (
          paymentReference.trim() &&
          paymentReference.trim().length < 3
        ) {
          setError(
            "Payment reference must contain at least 3 characters."
          );
          return;
        }

        const paymentResponse = await api.post("/paims/payments", {
          agreement: agreementId,
          allocations: [
            {
              installment: installmentId,
              amount,
            },
          ],
          amount,
          paymentMethod,
          ...(paymentReference.trim()
            ? { paymentReference: paymentReference.trim() }
            : {}),
        });

        const createdPayment = paymentResponse.data?.payment;

        paymentId =
          createdPayment?.id ||
          createdPayment?._id ||
          paymentResponse.data?.paymentId;

        if (!paymentId) {
          throw new Error(
            "The payment may have been created, but the server did not return its ID. Please contact support before trying again."
          );
        }

        setReceiptUploadPaymentId(paymentId);
      }

      // Upload the receipt against the payment record.
      await uploadPaymentReceipt(paymentId, receiptFile);

      closePaymentForm();

      setNotice(
        "Your payment and receipt have been submitted successfully. The finance team will verify them before confirming your payment."
      );

      await loadDashboard();
    } catch (paymentError) {
      setError(getErrorMessage(paymentError));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleViewReceipt(paymentId) {
    setViewingReceiptId(paymentId);
    setError("");

    try {
      const response = await api.get(
        `/paims/payments/${paymentId}/receipt`
      );

      const secureUrl = response.data?.access?.url;

      if (!secureUrl) {
        throw new Error("A secure receipt link was not returned.");
      }

      // The backend provides a short-lived private download URL.
      window.location.assign(secureUrl);
    } catch (receiptError) {
      setError(getErrorMessage(receiptError));
    } finally {
      setViewingReceiptId(null);
    }
  }

  const totalOutstanding = plans.reduce(
    (sum, item) =>
      sum + Number(item.financialSummary?.outstandingBalance || 0),
    0
  );

  const totalPaid = plans.reduce(
    (sum, item) =>
      sum + Number(item.financialSummary?.totalPaid || 0),
    0
  );

  if (loading) {
    return (
      <main className="min-h-[70vh] bg-[#fffdf8] px-5 py-12">
        <div className="mx-auto max-w-6xl text-center text-stone-600">
          Loading your installment dashboard...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[70vh] bg-[#fffdf8] px-5 py-12 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8">
          <Link
            to="/account"
            className="text-sm font-semibold text-amber-900 hover:underline"
          >
            ← Back to my account
          </Link>

          <p className="mt-6 text-xs font-bold uppercase tracking-[0.18em] text-amber-900">
            Ruvasgod Real Estate
          </p>

          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-stone-900 sm:text-4xl">
            My Installments
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-600">
            Track your property payment plans, installment due dates,
            outstanding balances and submitted payments.
          </p>
        </header>

        {error && (
          <div
            role="alert"
            className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
          >
            {error}
          </div>
        )}

        {notice && (
          <div
            role="status"
            className="mb-6 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800"
          >
            {notice}
          </div>
        )}

        <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-stone-500">Payment plans</p>
            <p className="mt-2 text-3xl font-bold text-stone-900">
              {plans.length}
            </p>
          </div>

          <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-stone-500">Total paid</p>
            <p className="mt-2 text-2xl font-bold text-green-700">
              {formatMoney(totalPaid)}
            </p>
          </div>

          <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-stone-500">Outstanding balance</p>
            <p className="mt-2 text-2xl font-bold text-amber-800">
              {formatMoney(totalOutstanding)}
            </p>
          </div>
        </section>

        {plans.length === 0 && (
          <section className="rounded-2xl border border-stone-200 bg-white p-8 text-center shadow-sm">
            <h2 className="text-xl font-semibold text-stone-900">
              No payment plans available
            </h2>

            <p className="mt-3 text-sm leading-6 text-stone-600">
              There are no payment plans linked to your agreements yet.
              Please contact the property team if you believe a payment plan
              should be available.
            </p>

            <Link
              to="/account/agreements"
              className="mt-5 inline-flex rounded-xl bg-amber-700 px-5 py-3 text-sm font-semibold text-white hover:bg-amber-800"
            >
              View my agreements
            </Link>
          </section>
        )}

        <div className="space-y-8">
          {plans.map(({ agreement, plan, financialSummary, installments }) => {
            const agreementId = agreement._id || agreement.id;
            const currency =
              financialSummary?.currency || agreement.currency || "GHS";

            return (
              <section
                key={agreementId}
                className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm"
              >
                <div className="border-b border-stone-200 p-6">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wide text-amber-900">
                        {agreement.agreementType || "Property agreement"}
                      </p>

                      <h2 className="mt-2 text-xl font-semibold text-stone-900">
                        {agreement.agreementNumber || "Property agreement"}
                      </h2>

                      <p className="mt-1 text-sm text-stone-500">
                        {agreement.property?.title ||
                          agreement.property?.name ||
                          agreement.property?.address ||
                          "Property details"}
                      </p>
                    </div>

                    <StatusBadge status={plan?.status || "ACTIVE"} />
                  </div>

                  <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div>
                      <p className="text-xs text-stone-500">Plan amount</p>
                      <p className="mt-1 font-semibold text-stone-900">
                        {formatMoney(financialSummary?.totalAmount, currency)}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-stone-500">Amount paid</p>
                      <p className="mt-1 font-semibold text-green-700">
                        {formatMoney(financialSummary?.totalPaid, currency)}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-stone-500">Outstanding</p>
                      <p className="mt-1 font-semibold text-amber-800">
                        {formatMoney(
                          financialSummary?.outstandingBalance,
                          currency
                        )}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-stone-500">
                        Payment progress
                      </p>
                      <p className="mt-1 font-semibold text-stone-900">
                        {Number(
                          financialSummary?.paymentPercentage || 0
                        ).toFixed(1)}
                        %
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-stone-100">
                    <div
                      className="h-full rounded-full bg-amber-600"
                      style={{
                        width: `${Math.min(
                          100,
                          Math.max(
                            0,
                            Number(
                              financialSummary?.paymentPercentage || 0
                            )
                          )
                        )}%`,
                      }}
                    />
                  </div>

                  {Number(financialSummary?.overdueCount || 0) > 0 && (
                    <p className="mt-4 text-sm font-semibold text-red-700">
                      {financialSummary.overdueCount} overdue installment(s):{" "}
                      {formatMoney(
                        financialSummary.overdueAmount,
                        currency
                      )}
                    </p>
                  )}
                </div>

                <div className="p-6">
                  <h3 className="mb-4 text-lg font-semibold text-stone-900">
                    Installment schedule
                  </h3>

                  {!installments?.length ? (
                    <p className="text-sm text-stone-500">
                      No installments are available for this payment plan.
                    </p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[650px] text-left text-sm">
                        <thead>
                          <tr className="border-b border-stone-200 text-xs uppercase tracking-wide text-stone-500">
                            <th className="px-3 py-3">Installment</th>
                            <th className="px-3 py-3">Due date</th>
                            <th className="px-3 py-3">Amount due</th>
                            <th className="px-3 py-3">Paid</th>
                            <th className="px-3 py-3">Balance</th>
                            <th className="px-3 py-3">Status</th>
                            <th className="px-3 py-3">Action</th>
                          </tr>
                        </thead>

                        <tbody>
                          {installments.map((installment) => {
                            const installmentId =
                              installment._id || installment.id;

                            const balance = Math.max(
                              0,
                              Number(installment.amountDue || 0) -
                                Number(installment.amountPaid || 0)
                            );

                            const canPay =
                              balance > 0 &&
                              !["WAIVED", "CANCELLED"].includes(
                                installment.status
                              ) &&
                              agreement.status === "ACTIVE" &&
                              plan?.status === "ACTIVE";

                            return (
                              <tr
                                key={installmentId}
                                className="border-b border-stone-100 last:border-0"
                              >
                                <td className="px-3 py-4 font-medium text-stone-900">
                                  {installment.installmentNumber}
                                </td>

                                <td className="px-3 py-4 text-stone-600">
                                  {formatDate(installment.dueDate)}
                                </td>

                                <td className="px-3 py-4 text-stone-700">
                                  {formatMoney(
                                    installment.amountDue,
                                    currency
                                  )}
                                </td>

                                <td className="px-3 py-4 text-green-700">
                                  {formatMoney(
                                    installment.amountPaid,
                                    currency
                                  )}
                                </td>

                                <td className="px-3 py-4 font-semibold text-stone-900">
                                  {formatMoney(balance, currency)}
                                </td>

                                <td className="px-3 py-4">
                                  <StatusBadge status={installment.status} />
                                </td>

                                <td className="px-3 py-4">
                                  {canPay ? (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        openPaymentForm(installment, agreement)
                                      }
                                      className="whitespace-nowrap rounded-lg bg-amber-700 px-3 py-2 text-xs font-bold text-white hover:bg-amber-800"
                                    >
                                      Make payment
                                    </button>
                                  ) : (
                                    <span className="text-xs text-stone-400">
                                      {balance <= 0 ? "Settled" : "Unavailable"}
                                    </span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </section>
            );
          })}
        </div>

        <section className="mt-10 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-stone-900">
            Payment history
          </h2>

          <p className="mt-2 text-sm text-stone-500">
            Payments you have submitted and their finance verification status.
          </p>

          {payments.length === 0 ? (
            <p className="mt-5 text-sm text-stone-500">
              You have not submitted any payments yet.
            </p>
          ) : (
            <div className="mt-5 overflow-x-auto">
              <table className="w-full min-w-[750px] text-left text-sm">
                <thead>
                  <tr className="border-b border-stone-200 text-xs uppercase tracking-wide text-stone-500">
                    <th className="px-3 py-3">Date</th>
                    <th className="px-3 py-3">Agreement</th>
                    <th className="px-3 py-3">Method</th>
                    <th className="px-3 py-3">Reference</th>
                    <th className="px-3 py-3">Amount</th>
                    <th className="px-3 py-3">Status</th>
                    <th className="px-3 py-3">Receipt</th>
                  </tr>
                </thead>

                <tbody>
                  {payments.map((payment) => {
                    const paymentId = payment._id || payment.id;
                    const hasReceipt = Boolean(
                      payment.receiptMimeType || payment.receiptFileSize
                    );

                    return (
                      <tr
                        key={paymentId}
                        className="border-b border-stone-100 last:border-0"
                      >
                        <td className="px-3 py-4 text-stone-600">
                          {formatDate(payment.createdAt)}
                        </td>

                        <td className="px-3 py-4 text-stone-700">
                          {payment.agreement?.agreementNumber || "Agreement"}
                        </td>

                        <td className="px-3 py-4 text-stone-700">
                          {(payment.paymentMethod || "").replaceAll("_", " ")}
                        </td>

                        <td className="px-3 py-4 text-stone-600">
                          {payment.paymentReference || "—"}
                        </td>

                        <td className="px-3 py-4 font-semibold text-stone-900">
                          {formatMoney(
                            payment.amount,
                            payment.currency || "GHS"
                          )}
                        </td>

                        <td className="px-3 py-4">
                          <StatusBadge status={payment.status} />
                        </td>

                        <td className="px-3 py-4">
                          {hasReceipt ? (
                            <button
                              type="button"
                              onClick={() => handleViewReceipt(paymentId)}
                              disabled={viewingReceiptId === paymentId}
                              className="whitespace-nowrap rounded-lg border border-amber-700 px-3 py-2 text-xs font-bold text-amber-900 hover:bg-amber-50 disabled:opacity-60"
                            >
                              {viewingReceiptId === paymentId
                                ? "Opening..."
                                : "View receipt"}
                            </button>
                          ) : (
                            <span className="text-xs text-stone-400">
                              Not uploaded
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {selectedInstallment && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="payment-dialog-title"
          >
            <div className="my-8 w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2
                    id="payment-dialog-title"
                    className="text-xl font-semibold text-stone-900"
                  >
                    Submit installment payment
                  </h2>

                  <p className="mt-1 text-sm text-stone-500">
                    Installment{" "}
                    {selectedInstallment.installment.installmentNumber}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={closePaymentForm}
                  disabled={submitting || Boolean(receiptUploadPaymentId)}
                  className="rounded-lg px-3 py-2 text-stone-500 hover:bg-stone-100 disabled:opacity-50"
                  aria-label="Close payment form"
                >
                  ✕
                </button>
              </div>

              <div className="mt-5 rounded-xl bg-amber-50 p-4">
                <p className="text-sm text-amber-900">
                  Outstanding installment balance
                </p>

                <p className="mt-1 text-2xl font-bold text-amber-950">
                  {formatMoney(
                    selectedInstallment.outstanding,
                    selectedInstallment.agreement.currency || "GHS"
                  )}
                </p>
              </div>

              {receiptUploadPaymentId && (
                <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                  Your payment has been created. The receipt upload needs to
                  be completed. Select the receipt again and retry below.
                  Do not create another payment.
                </div>
              )}

              <form onSubmit={handlePaymentSubmit} className="mt-6 space-y-4">
                <div>
                  <label
                    htmlFor="paymentAmount"
                    className="mb-2 block text-sm font-semibold text-stone-700"
                  >
                    Amount to pay
                  </label>

                  <input
                    id="paymentAmount"
                    type="number"
                    min="0.01"
                    max={selectedInstallment.outstanding}
                    step="0.01"
                    required
                    disabled={Boolean(receiptUploadPaymentId)}
                    value={paymentAmount}
                    onChange={(event) => setPaymentAmount(event.target.value)}
                    className="w-full rounded-xl border border-stone-300 px-4 py-3 text-stone-900 outline-none focus:border-amber-700 focus:ring-2 focus:ring-amber-100 disabled:bg-stone-100"
                  />
                </div>

                <div>
                  <label
                    htmlFor="paymentMethod"
                    className="mb-2 block text-sm font-semibold text-stone-700"
                  >
                    Payment method
                  </label>

                  <select
                    id="paymentMethod"
                    value={paymentMethod}
                    disabled={Boolean(receiptUploadPaymentId)}
                    onChange={(event) => setPaymentMethod(event.target.value)}
                    className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-stone-900 outline-none focus:border-amber-700 disabled:bg-stone-100"
                  >
                    {PAYMENT_METHODS.map((method) => (
                      <option key={method.value} value={method.value}>
                        {method.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="paymentReference"
                    className="mb-2 block text-sm font-semibold text-stone-700"
                  >
                    Payment reference (optional)
                  </label>

                  <input
                    id="paymentReference"
                    type="text"
                    minLength="3"
                    maxLength="150"
                    disabled={Boolean(receiptUploadPaymentId)}
                    value={paymentReference}
                    onChange={(event) =>
                      setPaymentReference(event.target.value)
                    }
                    placeholder="Bank or mobile money transaction reference"
                    className="w-full rounded-xl border border-stone-300 px-4 py-3 text-stone-900 outline-none focus:border-amber-700 disabled:bg-stone-100"
                  />
                </div>

                <div>
                  <label
                    htmlFor="paymentReceipt"
                    className="mb-2 block text-sm font-semibold text-stone-700"
                  >
                    Payment receipt{" "}
                    <span className="text-red-600">*</span>
                  </label>

                  <input
                    id="paymentReceipt"
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp,.pdf,image/jpeg,image/png,image/webp,application/pdf"
                    required
                    onChange={(event) => {
                      setReceiptFile(event.target.files?.[0] || null);
                      setError("");
                    }}
                    className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-700 file:mr-4 file:rounded-lg file:border-0 file:bg-amber-100 file:px-3 file:py-2 file:font-semibold file:text-amber-900"
                  />

                  <p className="mt-2 text-xs leading-5 text-stone-500">
                    Upload your bank transfer slip, mobile money confirmation
                    or other payment evidence. JPG, PNG, WEBP or PDF.
                    Maximum 10 MB.
                  </p>

                  {receiptFile && (
                    <p className="mt-2 break-all text-sm font-medium text-green-700">
                      Selected: {receiptFile.name}
                    </p>
                  )}
                </div>

                <p className="text-xs leading-5 text-stone-500">
                  Submitting this form does not mark your installment as paid.
                  The finance team must verify and confirm your payment first.
                </p>

                {error && (
                  <p role="alert" className="text-sm text-red-700">
                    {error}
                  </p>
                )}

                <div className="flex flex-wrap justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={closePaymentForm}
                    disabled={submitting || Boolean(receiptUploadPaymentId)}
                    className="rounded-xl border border-stone-300 px-5 py-3 text-sm font-semibold text-stone-700 hover:bg-stone-50 disabled:opacity-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="rounded-xl bg-amber-700 px-5 py-3 text-sm font-semibold text-white hover:bg-amber-800 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {submitting
                      ? "Submitting..."
                      : receiptUploadPaymentId
                        ? "Retry receipt upload"
                        : "Submit payment"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default CustomerInstallments;
