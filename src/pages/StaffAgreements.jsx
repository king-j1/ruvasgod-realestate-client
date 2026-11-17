import { useCallback, useEffect, useState } from "react";
import api from "../api/axios";

const STATUSES = [
  "ALL",
  "DRAFT",
  "PENDING_APPROVAL",
  "APPROVED",
  "PENDING_SIGNATURE",
  "ACTIVE",
  "COMPLETED",
  "CANCELLED",
  "TERMINATED",
  "EXPIRED",
];

function money(amount, currency = "GHS") {
  return new Intl.NumberFormat("en-GH", {
    style: "currency",
    currency,
  }).format(Number(amount || 0));
}

function date(value) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-GB");
}

function Field({ label, value }) {
  return (
    <div className="rounded-xl bg-stone-50 p-4">
      <p className="text-xs font-medium text-stone-500">{label}</p>
      <p className="mt-1 break-words text-sm font-semibold text-stone-900">
        {value || "—"}
      </p>
    </div>
  );
}

function StaffAgreements() {
  const [agreements, setAgreements] = useState([]);
  const [selected, setSelected] = useState(null);
  const [plan, setPlan] = useState(null);
  const [status, setStatus] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [planLoading, setPlanLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [action, setAction] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadAgreements = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const params = status === "ALL" ? {} : { status };
      const response = await api.get("/paims/agreements", { params });

      setAgreements(response.data.agreements || []);
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to load agreements."
      );
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    loadAgreements();
  }, [loadAgreements]);

  async function openAgreement(agreement) {
    setSelected(agreement);
    setPlan(null);
    setAction("");
    setReason("");
    setDetailLoading(true);
    setError("");
    setNotice("");

    try {
      const response = await api.get(`/paims/agreements/${agreement._id}`);
      setSelected(response.data.agreement);
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to load agreement details."
      );
    } finally {
      setDetailLoading(false);
    }
  }

  async function loadPlan() {
    if (!selected?._id) return;

    setPlanLoading(true);
    setError("");

    try {
      const response = await api.get(
        `/paims/agreements/${selected._id}/payment-plan`
      );
      setPlan(response.data);
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to load payment plan."
      );
    } finally {
      setPlanLoading(false);
    }
  }

  async function submitAction(event) {
    event.preventDefault();

    if (!selected?._id || !action) return;

    const minimum = action === "APPROVE" ? 0 : 3;

    if (
      action === "REJECT" &&
      reason.trim().length < minimum
    ) {
      setError("Please provide a rejection reason of at least 3 characters.");
      return;
    }

    if (
      ["CANCEL", "TERMINATE"].includes(action) &&
      reason.trim().length < 5
    ) {
      setError("Please provide a reason of at least 5 characters.");
      return;
    }

    setActionLoading(true);
    setError("");
    setNotice("");

    try {
      let response;

      if (action === "APPROVE" || action === "REJECT") {
        response = await api.patch(
          `/paims/agreements/${selected._id}/review`,
          {
            decision: action === "APPROVE" ? "APPROVED" : "REJECTED",
            ...(reason.trim() ? { reason: reason.trim() } : {}),
          }
        );
      } else {
        const endpoint =
          action === "CANCEL" ? "cancel" : "terminate";

        response = await api.patch(
          `/paims/agreements/${selected._id}/${endpoint}`,
          { reason: reason.trim() }
        );
      }

      setNotice(response.data.message || "Agreement updated successfully.");
      setAction("");
      setReason("");
      setPlan(null);

      await loadAgreements();

      const refreshed = await api.get(
        `/paims/agreements/${selected._id}`
      );

      setSelected(refreshed.data.agreement);
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to process this action."
      );
    } finally {
      setActionLoading(false);
    }
  }

  const canReview = selected?.status === "DRAFT";
  const canTerminate = selected?.status === "ACTIVE";
  const canCancel = ["DRAFT", "PENDING_APPROVAL", "APPROVED"].includes(
    selected?.status
  );

  return (
    <main className="min-h-screen bg-[#fffdf8] px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-900">
              PAIMS operations
            </p>
            <h1 className="mt-2 text-3xl font-bold text-stone-900">
              Agreement management
            </h1>
            <p className="mt-2 text-sm text-stone-600">
              Review agreements, manage their lifecycle and inspect payment plans.
            </p>
          </div>

          <a
            href="/staff/agreements/new"
            className="rounded-xl bg-amber-800 px-5 py-3 text-sm font-bold text-white hover:bg-amber-900"
          >
            Create agreement
          </a>
        </header>

        {error && (
          <div role="alert" className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            {error}
          </div>
        )}

        {notice && (
          <div role="status" className="mb-5 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">
            {notice}
          </div>
        )}

        <section className="mb-7 rounded-2xl border border-stone-200 bg-white p-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="font-semibold text-stone-900">
                Property agreements
              </h2>
              <p className="mt-1 text-xs text-stone-500">
                {agreements.length} agreement(s) displayed. The API returns up to 100.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <select
                value={status}
                onChange={(event) => {
                  setStatus(event.target.value);
                  setSelected(null);
                  setPlan(null);
                }}
                className="min-h-11 rounded-lg border border-stone-300 bg-white px-3 text-sm"
              >
                {STATUSES.map((item) => (
                  <option key={item} value={item}>
                    {item === "ALL" ? "All statuses" : item.replaceAll("_", " ")}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={loadAgreements}
                className="rounded-lg border border-stone-300 px-4 py-2 text-sm font-semibold hover:bg-stone-50"
              >
                Refresh
              </button>
            </div>
          </div>

          {loading ? (
            <p className="py-10 text-center text-sm text-stone-500">
              Loading agreements...
            </p>
          ) : agreements.length === 0 ? (
            <p className="py-10 text-center text-sm text-stone-500">
              No agreements found for this status.
            </p>
          ) : (
            <div className="mt-5 overflow-x-auto">
              <table className="w-full min-w-[850px] text-left text-sm">
                <thead className="bg-stone-50 text-xs uppercase text-stone-500">
                  <tr>
                    <th className="px-4 py-3">Agreement</th>
                    <th className="px-4 py-3">Customer</th>
                    <th className="px-4 py-3">Property</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {agreements.map((agreement) => (
                    <tr
                      key={agreement._id}
                      className="border-t border-stone-100"
                    >
                      <td className="px-4 py-4 font-semibold">
                        {agreement.agreementNumber || agreement._id}
                      </td>
                      <td className="px-4 py-4">
                        {agreement.customer?.name || "—"}
                      </td>
                      <td className="px-4 py-4">
                        {agreement.property?.title || "—"}
                      </td>
                      <td className="px-4 py-4">
                        {agreement.agreementType || "—"}
                      </td>
                      <td className="px-4 py-4">
                        <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold">
                          {agreement.status || "—"}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <button
                          type="button"
                          onClick={() => openAgreement(agreement)}
                          className="rounded-lg bg-amber-800 px-3 py-2 text-xs font-bold text-white hover:bg-amber-900"
                        >
                          Manage
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
          <section className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-7">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-stone-200 pb-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-amber-900">
                  Agreement details
                </p>
                <h2 className="mt-2 text-xl font-bold text-stone-900">
                  {selected.agreementNumber || "Property agreement"}
                </h2>
                <p className="mt-1 text-sm text-stone-500">
                  {selected.status}
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setSelected(null);
                  setPlan(null);
                  setAction("");
                  setError("");
                }}
                className="rounded-lg border border-stone-300 px-4 py-2 text-sm font-semibold"
              >
                Close
              </button>
            </div>

            {detailLoading ? (
              <p className="py-8 text-sm text-stone-500">
                Loading agreement details...
              </p>
            ) : (
              <>
                <div className="grid gap-3 py-6 sm:grid-cols-2 lg:grid-cols-3">
                  <Field label="Customer" value={selected.customer?.name} />
                  <Field label="Customer email" value={selected.customer?.email} />
                  <Field label="Customer phone" value={selected.customer?.phone} />
                  <Field label="Property" value={selected.property?.title} />
                  <Field label="Agreement type" value={selected.agreementType} />
                  <Field label="Status" value={selected.status} />
                  <Field label="Start date" value={date(selected.startDate)} />
                  <Field label="End date" value={date(selected.endDate)} />
                  <Field label="Assigned officer" value={selected.assignedOfficer?.name} />
                  <Field label="Created" value={date(selected.createdAt)} />
                  <Field label="Approved" value={date(selected.approvedAt)} />
                  <Field label="Terminated" value={date(selected.terminatedAt)} />
                  <Field
                    label="Termination reason"
                    value={selected.status === "TERMINATED" ? selected.cancellationReason : ""}
                  />
                </div>

                <div className="flex flex-wrap gap-3 border-t border-stone-200 pt-5">
                  <button
                    type="button"
                    onClick={loadPlan}
                    disabled={planLoading}
                    className="rounded-lg border border-stone-300 px-4 py-2 text-sm font-semibold hover:bg-stone-50 disabled:opacity-50"
                  >
                    {planLoading ? "Loading..." : "View payment plan"}
                  </button>

                  {canReview && (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          setAction("APPROVE");
                          setReason("");
                        }}
                        className="rounded-lg bg-green-700 px-4 py-2 text-sm font-bold text-white hover:bg-green-800"
                      >
                        Approve agreement
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setAction("REJECT");
                          setReason("");
                        }}
                        className="rounded-lg bg-red-700 px-4 py-2 text-sm font-bold text-white hover:bg-red-800"
                      >
                        Reject agreement
                      </button>
                    </>
                  )}

                  {canCancel && (
                    <button
                      type="button"
                      onClick={() => {
                        setAction("CANCEL");
                        setReason("");
                      }}
                      className="rounded-lg border border-red-300 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50"
                    >
                      Cancel agreement
                    </button>
                  )}

                  {canTerminate && (
                    <button
                      type="button"
                      onClick={() => {
                        setAction("TERMINATE");
                        setReason("");
                      }}
                      className="rounded-lg bg-red-800 px-4 py-2 text-sm font-bold text-white hover:bg-red-900"
                    >
                      Terminate agreement
                    </button>
                  )}
                </div>

                {action && (
                  <form
                    onSubmit={submitAction}
                    className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-5"
                  >
                    <h3 className="font-bold text-stone-900">
                      {action === "APPROVE" && "Approve agreement"}
                      {action === "REJECT" && "Reject agreement"}
                      {action === "CANCEL" && "Cancel agreement"}
                      {action === "TERMINATE" && "Terminate agreement"}
                    </h3>

                    <p className="mt-1 text-sm text-stone-600">
                      {action === "APPROVE"
                        ? "Confirm that this agreement is ready for approval."
                        : "Enter the reason. This action will be recorded in the agreement audit history."}
                    </p>

                    {action !== "APPROVE" && (
                      <textarea
                        value={reason}
                        onChange={(event) => setReason(event.target.value)}
                        required
                        minLength={action === "REJECT" ? 3 : 5}
                        maxLength={2000}
                        rows={3}
                        placeholder="Enter reason..."
                        className="mt-4 w-full rounded-lg border border-stone-300 bg-white p-3 text-sm"
                      />
                    )}

                    <div className="mt-4 flex flex-wrap gap-3">
                      <button
                        type="submit"
                        disabled={actionLoading}
                        className="rounded-lg bg-stone-900 px-5 py-2.5 text-sm font-bold text-white disabled:opacity-50"
                      >
                        {actionLoading ? "Processing..." : "Confirm"}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setAction("");
                          setReason("");
                        }}
                        className="rounded-lg border border-stone-300 px-5 py-2.5 text-sm font-semibold"
                      >
                        Go back
                      </button>
                    </div>
                  </form>
                )}

                {plan && (
                  <div className="mt-7 border-t border-stone-200 pt-6">
                    <h3 className="mb-4 text-lg font-bold">
                      Payment plan
                    </h3>

                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                      <Field
                        label="Plan amount"
                        value={money(
                          plan.financialSummary?.totalAmount,
                          plan.financialSummary?.currency
                        )}
                      />
                      <Field
                        label="Total paid"
                        value={money(
                          plan.financialSummary?.totalPaid,
                          plan.financialSummary?.currency
                        )}
                      />
                      <Field
                        label="Outstanding principal"
                        value={money(
                          plan.financialSummary?.outstandingBalance,
                          plan.financialSummary?.currency
                        )}
                      />
                      <Field
                        label="Accrued penalties"
                        value={money(
                          plan.financialSummary?.totalAccruedPenalties,
                          plan.financialSummary?.currency
                        )}
                      />
                    </div>

                    <div className="mt-5 overflow-x-auto">
                      <table className="w-full min-w-[650px] text-left text-sm">
                        <thead className="bg-stone-50 text-xs uppercase text-stone-500">
                          <tr>
                            <th className="px-3 py-3">Installment</th>
                            <th className="px-3 py-3">Due date</th>
                            <th className="px-3 py-3">Amount due</th>
                            <th className="px-3 py-3">Paid</th>
                            <th className="px-3 py-3">Penalty</th>
                            <th className="px-3 py-3">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(plan.installments || []).map((item) => (
                            <tr key={item._id} className="border-t border-stone-100">
                              <td className="px-3 py-3">
                                {item.installmentNumber}
                              </td>
                              <td className="px-3 py-3">
                                {date(item.dueDate)}
                              </td>
                              <td className="px-3 py-3">
                                {money(item.amountDue, item.currency)}
                              </td>
                              <td className="px-3 py-3">
                                {money(item.amountPaid, item.currency)}
                              </td>
                              <td className="px-3 py-3">
                                {money(item.accruedPenalty, item.currency)}
                              </td>
                              <td className="px-3 py-3">{item.status}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </>
            )}
          </section>
        )}
      </div>
    </main>
  );
}

export default StaffAgreements;
