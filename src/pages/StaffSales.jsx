import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

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
      return <span className="text-sm text-slate-400">Read-only</span>;
    }

    const isUpdating = updatingId === sale._id;

    if (sale.saleStatus === "pending") {
      return (
        <>
          <button
            onClick={() => updateStatus(sale._id, "reserved")}
            disabled={isUpdating}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isUpdating ? "Updating..." : "Reserve"}
          </button>

          <button
            onClick={() => updateStatus(sale._id, "cancelled")}
            disabled={isUpdating}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
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
          className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isUpdating ? "Updating..." : "Cancel"}
        </button>
      );
    }

    return (
      <span className="text-sm text-slate-400">
        No further actions available
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <p className="text-slate-600">Loading sales...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-3xl font-bold text-slate-900">Sales Management</h1>

        <p className="mt-2 text-slate-500">
          {canManage
            ? "View and manage vehicle purchase workflow."
            : "View vehicle purchase and payment status."}
        </p>

        {error && (
          <div className="mt-6 rounded-lg bg-red-50 p-4 text-red-600">
            {error}
          </div>
        )}

        {sales.length === 0 ? (
          <div className="mt-8 rounded-2xl bg-white p-8 shadow-sm">
            <p className="text-slate-500">No sales yet.</p>
          </div>
        ) : (
          <div className="mt-8 space-y-4">
            {sales.map((sale) => (
              <div
                key={sale._id}
                className="rounded-2xl bg-white p-6 shadow-sm"
              >
                <div className="grid gap-4 md:grid-cols-4">
                  <div>
                    <p className="text-sm text-slate-500">Customer</p>
                    <p className="font-semibold">{sale.user?.name}</p>
                    <p className="text-sm text-slate-500">{sale.user?.email}</p>
                  </div>

                  <div>
                    <p className="text-sm text-slate-500">Vehicle</p>
                    <p className="font-semibold">
                      {sale.vehicle?.make} {sale.vehicle?.model}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-slate-500">Sale Price</p>
                    <p className="font-semibold">
                      {sale.currency} {sale.salePrice?.toLocaleString()}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-slate-500">Purchased</p>
                    <p className="font-semibold">
                      {sale.createdAt
                        ? new Date(sale.createdAt).toLocaleDateString()
                        : "—"}
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap items-center gap-3 border-t pt-4">
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium">
                    Sale: {sale.saleStatus}
                  </span>

                  <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium">
                    Payment: {sale.paymentStatus}
                  </span>

                  <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium">
                    Ownership: {sale.ownershipStatus?.replace("_", " ")}
                  </span>

                  {renderActions(sale)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default StaffSales;
