import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

const PLACEHOLDER_IMAGE =
  "https://via.placeholder.com/600x400?text=Ruvasgod+Auto";

const paymentStatusStyles = {
  paid: "bg-green-100 text-green-700",
  pending: "bg-amber-100 text-amber-700",
  unpaid: "bg-amber-100 text-amber-700",
  failed: "bg-red-100 text-red-700",
  refunded: "bg-slate-200 text-slate-700",
};

const saleStatusStyles = {
  completed: "bg-green-100 text-green-700",
  reserved: "bg-blue-100 text-blue-700",
  pending: "bg-amber-100 text-amber-700",
  cancelled: "bg-red-100 text-red-700",
  failed: "bg-red-100 text-red-700",
  refunded: "bg-slate-200 text-slate-700",
};

const ownershipStatusStyles = {
  transferred: "bg-green-100 text-green-700",
  pending_transfer: "bg-blue-100 text-blue-700",
  cancelled: "bg-red-100 text-red-700",
};

function StatusBadge({ label, styleMap, value }) {
  const className = styleMap[value] || "bg-slate-100 text-slate-700";

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${className}`}
    >
      {label}: {value?.replace("_", " ")}
    </span>
  );
}

function MyPurchases() {
  const navigate = useNavigate();

  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSales = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/sales/my-sales");

        setSales(response.data.sales || []);
      } catch (err) {
        setError(
          err.response?.data?.message || "Failed to load your purchases.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchSales();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <p className="text-slate-600">Loading your purchases...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">
            My Purchases
          </h1>

          <p className="mt-2 text-slate-500">
            Track the vehicles you've purchased from Ruvasgod Auto.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg bg-red-50 p-4 text-red-600">
            {error}
          </div>
        )}

        {sales.length === 0 ? (
          <div className="rounded-2xl bg-white p-10 text-center shadow">
            <h2 className="text-2xl font-semibold text-slate-900">
              No purchases yet
            </h2>

            <p className="mt-2 text-slate-500">
              You haven't purchased a vehicle yet.
            </p>

            <button
              onClick={() => navigate("/vehicles")}
              className="mt-6 rounded-lg bg-slate-900 px-6 py-3 font-semibold text-white hover:bg-slate-800"
            >
              Browse Vehicles
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {sales.map((sale) => {
              const vehicle = sale.vehicle;

              const image =
                vehicle?.images?.length > 0
                  ? vehicle.images[0]
                  : PLACEHOLDER_IMAGE;

              return (
                <div
                  key={sale._id}
                  className="overflow-hidden rounded-2xl bg-white shadow"
                >
                  <div className="grid md:grid-cols-[280px_1fr]">
                    <img
                      src={image}
                      alt={`${vehicle?.make || "Vehicle"} ${vehicle?.model || ""}`}
                      className="h-full min-h-[220px] w-full object-cover"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = PLACEHOLDER_IMAGE;
                      }}
                    />

                    <div className="p-6">
                      <div className="flex flex-col justify-between gap-4 sm:flex-row">
                        <div>
                          <h2 className="text-2xl font-bold text-slate-900">
                            {vehicle?.make} {vehicle?.model}
                          </h2>

                          <p className="mt-1 text-slate-500">
                            {vehicle?.year} • {vehicle?.type}
                          </p>
                        </div>

                        <p className="text-2xl font-bold text-slate-900">
                          {sale.currency} {sale.salePrice?.toLocaleString()}
                        </p>
                      </div>

                      <div className="mt-6 flex flex-wrap gap-2">
                        <StatusBadge
                          label="Payment"
                          styleMap={paymentStatusStyles}
                          value={sale.paymentStatus}
                        />

                        <StatusBadge
                          label="Sale"
                          styleMap={saleStatusStyles}
                          value={sale.saleStatus}
                        />

                        <StatusBadge
                          label="Ownership"
                          styleMap={ownershipStatusStyles}
                          value={sale.ownershipStatus}
                        />
                      </div>

                      <div className="mt-6 text-sm text-slate-500">
                        Purchased on{" "}
                        {sale.createdAt
                          ? new Date(sale.createdAt).toLocaleDateString()
                          : "—"}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyPurchases;
