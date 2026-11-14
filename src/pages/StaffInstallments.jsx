
import { useCallback, useEffect, useState } from "react";
import api from "../api/axios";

function money(amount, currency = "GHS") {
  return new Intl.NumberFormat("en-GH", {
    style: "currency",
    currency,
  }).format(Number(amount || 0));
}

function StaffInstallments() {
  const [agreements, setAgreements] = useState([]);
  const [selected, setSelected] = useState(null);
  const [planData, setPlanData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [planLoading, setPlanLoading] = useState(false);
  const [error, setError] = useState("");

  const loadAgreements = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/paims/agreements");
      const data = response.data;

      setAgreements(
        Array.isArray(data) ? data : data.agreements || []
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load property agreements."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAgreements();
  }, [loadAgreements]);

  async function viewPlan(agreement) {
    const id = agreement._id || agreement.id;

    setSelected(agreement);
    setPlanData(null);
    setPlanLoading(true);
    setError("");

    try {
      const response = await api.get(
        `/paims/agreements/${id}/payment-plan`
      );
      setPlanData(response.data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load this agreement's payment plan."
      );
    } finally {
      setPlanLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#fffdf8] px-5 py-10 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-900">
            Finance operations
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-stone-900">
            Installment management
          </h1>
          <p className="mt-2 text-sm text-stone-600">
            View customer agreements, payment plans and installment balances.
          </p>
        </header>

        {error && (
          <div role="alert" className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            {error}
          </div>
        )}

        <section className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
          <div className="border-b border-stone-200 p-6">
            <h2 className="text-lg font-semibold text-stone-900">
              Property agreements
            </h2>
            <p className="mt-1 text-sm text-stone-500">
              Select an agreement to inspect its payment plan.
            </p>
          </div>

          {loading ? (
            <p className="p-8 text-sm text-stone-500">
              Loading agreements...
            </p>
          ) : agreements.length === 0 ? (
            <p className="p-8 text-sm text-stone-500">
              No agreements were found.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[750px] text-left text-sm">
                <thead className="bg-stone-50 text-xs uppercase tracking-wide text-stone-500">
                  <tr>
                    <th className="px-5 py-4">Agreement</th>
                    <th className="px-5 py-4">Customer</th>
                    <th className="px-5 py-4">Type</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {agreements.map((agreement) => (
                    <tr
                      key={agreement._id || agreement.id}
                      className="border-t border-stone-100"
                    >
                      <td className="px-5 py-4 font-semibold text-stone-900">
                        {agreement.agreementNumber || "Agreement"}
                      </td>
                      <td className="px-5 py-4 text-stone-700">
                        {agreement.customer?.name || "Customer"}
                      </td>
                      <td className="px-5 py-4 text-stone-700">
                        {agreement.agreementType || "—"}
                      </td>
                      <td className="px-5 py-4 text-stone-700">
                        {agreement.status || "—"}
                      </td>
                      <td className="px-5 py-4">
                        <button
                          type="button"
                          onClick={() => viewPlan(agreement)}
                          className="rounded-lg bg-amber-700 px-4 py-2 text-xs font-bold text-white hover:bg-amber-800"
                        >
                          View installments
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
          <section className="mt-8 overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-200 p-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-amber-900">
                  Selected agreement
                </p>
                <h2 className="mt-2 text-xl font-semibold text-stone-900">
                  {selected.agreementNumber || "Property agreement"}
                </h2>
                <p className="mt-1 text-sm text-stone-500">
                  {selected.customer?.name || "Customer"}
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setSelected(null);
                  setPlanData(null);
                  setError("");
                }}
                className="rounded-xl border border-stone-300 px-4 py-2 text-sm font-semibold text-stone-700 hover:bg-stone-50"
              >
                Close details
              </button>
            </div>

            {planLoading ? (
              <p className="p-8 text-sm text-stone-500">
                Loading installment schedule...
              </p>
            ) : planData ? (
              <>
                <div className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-4">
                  {[
                    ["Plan amount", planData.financialSummary?.totalAmount],
                    ["Total paid", planData.financialSummary?.totalPaid],
                    ["Outstanding", planData.financialSummary?.outstandingBalance],
                    ["Overdue amount", planData.financialSummary?.overdueAmount],
                  ].map(([label, amount]) => (
                    <div key={label} className="rounded-xl bg-stone-50 p-4">
                      <p className="text-xs text-stone-500">{label}</p>
                      <p className="mt-2 text-lg font-bold text-stone-900">
                        {money(
                          amount,
                          planData.financialSummary?.currency || "GHS"
                        )}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="px-6 pb-6">
                  <h3 className="mb-4 text-lg font-semibold text-stone-900">
                    Installment schedule
                  </h3>

                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[700px] text-left text-sm">
                      <thead className="bg-stone-50 text-xs uppercase text-stone-500">
                        <tr>
                          <th className="px-4 py-3">Number</th>
                          <th className="px-4 py-3">Due date</th>
                          <th className="px-4 py-3">Amount due</th>
                          <th className="px-4 py-3">Paid</th>
                          <th className="px-4 py-3">Balance</th>
                          <th className="px-4 py-3">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(planData.installments || []).map((item) => (
                          <tr
                            key={item._id}
                            className="border-t border-stone-100"
                          >
                            <td className="px-4 py-4">
                              {item.installmentNumber}
                            </td>
                            <td className="px-4 py-4">
                              {item.dueDate
                                ? new Date(item.dueDate).toLocaleDateString("en-GH")
                                : "—"}
                            </td>
                            <td className="px-4 py-4">
                              {money(item.amountDue, item.currency)}
                            </td>
                            <td className="px-4 py-4 text-green-700">
                              {money(item.amountPaid, item.currency)}
                            </td>
                            <td className="px-4 py-4 font-semibold">
                              {money(
                                Math.max(
                                  0,
                                  Number(item.amountDue || 0) -
                                    Number(item.amountPaid || 0)
                                ),
                                item.currency
                              )}
                            </td>
                            <td className="px-4 py-4">
                              {item.status}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            ) : (
              <p className="p-8 text-sm text-stone-500">
                No payment plan is available for this agreement.
              </p>
            )}
          </section>
        )}
      </div>
    </main>
  );
}

export default StaffInstallments;
