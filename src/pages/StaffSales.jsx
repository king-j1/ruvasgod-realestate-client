
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

function SaleStatusBadge({ status }) {
  const styles = {
    pending: "border-amber-400/20 bg-amber-400/10 text-amber-300",
    reserved: "border-cyan-400/20 bg-cyan-400/10 text-cyan-300",
    completed: "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
    cancelled: "border-red-400/20 bg-red-400/10 text-red-300",
  };

  return (
    <span
      className={`rounded-full border px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] ${
        styles[status] || "border-white/10 bg-white/[0.05] text-slate-400"
      }`}
    >
      {status || "unknown"}
    </span>
  );
}

function PaymentBadge({ status }) {
  const styles = {
    paid: "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
    successful: "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
    pending: "border-amber-400/20 bg-amber-400/10 text-amber-300",
    unpaid: "border-amber-400/20 bg-amber-400/10 text-amber-300",
    failed: "border-red-400/20 bg-red-400/10 text-red-300",
  };

  return (
    <span
      className={`rounded-full border px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] ${
        styles[status] || "border-white/10 bg-white/[0.05] text-slate-400"
      }`}
    >
      {status || "unknown"}
    </span>
  );
}

function OwnershipBadge({ status }) {
  const label = status?.replaceAll("_", " ") || "unknown";

  const isTransferred =
    status === "transferred" ||
    status === "completed" ||
    status === "owned";

  return (
    <span
      className={`rounded-full border px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] ${
        isTransferred
          ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
          : "border-white/10 bg-white/[0.05] text-slate-400"
      }`}
    >
      {label}
    </span>
  );
}

function StaffSales() {
  const { user } = useAuth();
  const canManage = ["admin", "manager", "sales"].includes(user?.role);

  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  const fetchSales = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/sales/admin");

      setSales(response.data.sales || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch sales.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSales();
  }, []);

  const updateStatus = async (id, saleStatus) => {
    try {
      setUpdatingId(id);

      await api.put(`/sales/admin/${id}/status`, { saleStatus });

      await fetchSales();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update sale.");
    } finally {
      setUpdatingId(null);
    }
  };

  const renderActions = (sale) => {
    if (!canManage) {
      return (
        <span className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-semibold text-slate-500">
          Read-only
        </span>
      );
    }

    const isUpdating = updatingId === sale._id;

    if (sale.saleStatus === "pending") {
      return (
        <>
          <button
            onClick={() => updateStatus(sale._id, "reserved")}
            disabled={isUpdating}
            className="rounded-xl border border-cyan-400/20 bg-cyan-400/[0.08] px-4 py-2 text-xs font-semibold text-cyan-300 transition hover:border-cyan-400/40 hover:bg-cyan-400/[0.12] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isUpdating ? "Updating..." : "Reserve"}
          </button>

          <button
            onClick={() => updateStatus(sale._id, "cancelled")}
            disabled={isUpdating}
            className="rounded-xl border border-red-400/15 bg-red-400/[0.05] px-4 py-2 text-xs font-semibold text-red-300 transition hover:border-red-400/30 hover:bg-red-400/[0.1] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isUpdating ? "Updating..." : "Cancel"}
          </button>
        </>
      );
    }

    if (sale.saleStatus === "reserved") {
      return (
        <button
          onClick={() => updateStatus(sale._id, "cancelled")}
          disabled={isUpdating}
          className="rounded-xl border border-red-400/15 bg-red-400/[0.05] px-4 py-2 text-xs font-semibold text-red-300 transition hover:border-red-400/30 hover:bg-red-400/[0.1] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isUpdating ? "Updating..." : "Cancel"}
        </button>
      );
    }

    return (
      <span className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-semibold text-slate-600">
        No further actions
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#05080d]">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-white/10 border-t-cyan-400" />
          <p className="text-sm text-slate-500">Loading sales...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#05080d] px-4 py-8 text-white sm:px-6 lg:px-8">
      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-cyan-500/10 blur-[120px]" />
        <div className="absolute -right-40 top-20 h-96 w-96 rounded-full bg-blue-500/10 blur-[120px]" />
        <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-indigo-500/5 blur-[120px]" />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.04),transparent_35%)]" />
      </div>

      <div className="relative mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/[0.06] px-3 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)]" />

            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-300">
              Sales Operations
            </span>
          </div>

          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                Sales Management
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
                {canManage
                  ? "Manage vehicle purchase reservations, customer payments, and sales workflow."
                  : "Monitor vehicle purchases, payments, and ownership status."}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4 backdrop-blur-sm">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                Total Sales
              </p>

              <p className="mt-1 text-lg font-bold text-white">
                {sales.length}
                <span className="ml-1 text-sm font-medium text-slate-500">
                  records
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-2xl border border-red-400/20 bg-red-400/[0.06] p-4">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-red-400/10 text-sm text-red-300">
                !
              </div>

              <div>
                <p className="text-sm font-semibold text-red-200">
                  Unable to load sales
                </p>

                <p className="mt-1 text-sm text-red-300/70">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Sales */}
        {sales.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-12 text-center shadow-2xl shadow-black/20">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04]">
              <svg
                width="26"
                height="26"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                className="text-slate-500"
              >
                <path d="M3 7h18v13H3z" />
                <path d="M6 7V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2" />
                <path d="M8 12h8M8 16h5" />
              </svg>
            </div>

            <p className="mt-5 text-sm font-semibold text-white">
              No sales yet
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Vehicle purchase activity will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {sales.map((sale) => {
              const isUpdating = updatingId === sale._id;

              return (
                <div
                  key={sale._id}
                  className={`group overflow-hidden rounded-2xl border bg-white/[0.03] shadow-2xl shadow-black/20 transition duration-300 ${
                    isUpdating
                      ? "border-cyan-400/20"
                      : "border-white/10 hover:border-white/20"
                  }`}
                >
                  <div className="p-5 sm:p-6">
                    {/* Top section */}
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="flex items-start gap-4">
                        {/* Customer avatar */}
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-400/[0.06] text-sm font-bold text-cyan-300">
                          {sale.user?.name?.charAt(0)?.toUpperCase() || "?"}
                        </div>

                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-600">
                            Customer
                          </p>

                          <p className="mt-1 font-semibold text-white">
                            {sale.user?.name || "Unknown customer"}
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            {sale.user?.email || "No email available"}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <SaleStatusBadge status={sale.saleStatus} />
                        <PaymentBadge status={sale.paymentStatus} />
                        <OwnershipBadge status={sale.ownershipStatus} />
                      </div>
                    </div>

                    {/* Sale details */}
                    <div className="mt-6 grid gap-4 border-t border-white/[0.06] pt-5 sm:grid-cols-2 lg:grid-cols-4">
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-600">
                          Vehicle
                        </p>

                        <p className="mt-2 font-semibold text-slate-200">
                          {sale.vehicle?.make || "Unknown"}{" "}
                          {sale.vehicle?.model || ""}
                        </p>

                        {sale.vehicle?.year && (
                          <p className="mt-1 text-xs text-slate-600">
                            {sale.vehicle.year}
                          </p>
                        )}
                      </div>

                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-600">
                          Sale Price
                        </p>

                        <p className="mt-2 text-lg font-bold text-white">
                          {sale.currency || "GHS"}{" "}
                          {Number(sale.salePrice || 0).toLocaleString()}
                        </p>

                        <p className="mt-1 text-xs text-slate-600">
                          Vehicle purchase value
                        </p>
                      </div>

                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-600">
                          Purchase Date
                        </p>

                        <p className="mt-2 font-semibold text-slate-200">
                          {sale.createdAt
                            ? new Date(sale.createdAt).toLocaleDateString()
                            : "—"}
                        </p>

                        <p className="mt-1 text-xs text-slate-600">
                          Sale record created
                        </p>
                      </div>

                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-600">
                          Payment
                        </p>

                        <p className="mt-2 font-semibold capitalize text-slate-300">
                          {sale.paymentStatus || "Unknown"}
                        </p>

                        <p className="mt-1 text-xs text-slate-600">
                          Transaction status
                        </p>
                      </div>
                    </div>

                    {/* Workflow */}
                    <div className="mt-6 border-t border-white/[0.06] pt-5">
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                        <div className="mr-auto">
                          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-600">
                            Sales Workflow
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            {sale.saleStatus === "pending"
                              ? "Awaiting reservation decision."
                              : sale.saleStatus === "reserved"
                                ? "Vehicle reserved for this customer."
                                : sale.saleStatus === "cancelled"
                                  ? "Sale has been cancelled."
                                  : "Sale workflow completed."}
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          {renderActions(sale)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer status */}
        <div className="mt-10 border-t border-white/10 pt-5">
          <div className="flex flex-col gap-2 text-xs text-slate-600 sm:flex-row sm:items-center sm:justify-between">
            <p>Ruvasgod Auto · Sales Operations</p>

            <p className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Sales workspace active
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StaffSales;
