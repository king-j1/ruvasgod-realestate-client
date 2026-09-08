
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

function StatCard({ label, value, accent = "default" }) {
  const accents = {
    default: "from-white/10 to-white/[0.03] border-white/10",
    cyan: "from-cyan-400/15 to-cyan-400/[0.03] border-cyan-400/20",
    emerald: "from-emerald-400/15 to-emerald-400/[0.03] border-emerald-400/20",
    amber: "from-amber-400/15 to-amber-400/[0.03] border-amber-400/20",
    red: "from-red-400/15 to-red-400/[0.03] border-red-400/20",
  };

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border bg-gradient-to-br p-5 shadow-2xl shadow-black/10 transition duration-300 hover:-translate-y-1 hover:border-white/20 sm:p-6 ${accents[accent]}`}
    >
      <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-white/[0.03] blur-2xl transition duration-300 group-hover:bg-cyan-400/10" />

      <div className="relative">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
          {label}
        </p>

        <p className="mt-3 text-2xl font-bold tracking-tight text-white sm:text-3xl">
          {value ?? 0}
        </p>
      </div>
    </div>
  );
}

function QuickLink({ to, label }) {
  return (
    <Link
      to={to}
      className="group flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4 text-sm font-semibold text-slate-200 backdrop-blur-sm transition duration-300 hover:-translate-y-0.5 hover:border-cyan-400/30 hover:bg-cyan-400/[0.06] hover:text-white"
    >
      <span>{label}</span>

      <span className="text-slate-500 transition duration-300 group-hover:translate-x-1 group-hover:text-cyan-300">
        →
      </span>
    </Link>
  );
}

function SectionHeader({ eyebrow, title, description }) {
  return (
    <div className="mb-5">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400">
        {eyebrow}
      </p>

      <h2 className="mt-1 text-xl font-bold tracking-tight text-white">
        {title}
      </h2>

      {description && (
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      )}
    </div>
  );
}

function StaffDashboard() {
  const { user } = useAuth();
  const role = user?.role;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState({});

  const canViewOperations = role === "admin" || role === "manager";

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");

        const requests = {};

        if (canViewOperations || role === "vehicle_manager") {
          requests.vehicles = api.get("/vehicles");
        }

        if (canViewOperations || role === "rental" || role === "finance") {
          requests.bookings = api.get("/bookings/admin");
        }

        if (canViewOperations || role === "sales" || role === "finance") {
          requests.sales = api.get("/sales/admin");
        }

        if (canViewOperations) {
          requests.staff = api.get("/staff");
          requests.customers = api.get("/staff/customers");
        }

        const entries = Object.entries(requests);
        const results = await Promise.all(entries.map(([, req]) => req));

        const data = {};
        entries.forEach(([key], index) => {
          data[key] = results[index].data;
        });

        const vehicles = data.vehicles?.vehicles || [];
        const bookings = data.bookings?.bookings || [];
        const sales = data.sales?.sales || [];
        const staff = data.staff?.staff || [];
        const customers = data.customers?.customers || [];

        const paidSaleRevenue = sales
          .filter((sale) => sale.paymentStatus === "paid")
          .reduce((sum, sale) => sum + (sale.salePrice || 0), 0);

        const paidRentalRevenue = bookings
          .filter((booking) => booking.paymentStatus === "paid")
          .reduce((sum, booking) => sum + (booking.totalPrice || 0), 0);

        setStats({
          totalVehicles: vehicles.length,
          availableForSale: vehicles.filter((v) => v.availableForSale).length,
          availableForRent: vehicles.filter((v) => v.availableForRent).length,
          featuredVehicles: vehicles.filter((v) => v.isFeatured).length,

          pendingBookings: bookings.filter((b) => b.status === "pending").length,
          activeRentals: bookings.filter((b) => b.status === "active").length,
          completedRentals: bookings.filter((b) => b.status === "completed")
            .length,

          pendingSales: sales.filter((s) => s.saleStatus === "pending").length,
          completedSales: sales.filter((s) => s.saleStatus === "completed")
            .length,
          salesAwaitingPayment: sales.filter(
            (s) =>
              s.paymentStatus !== "paid" &&
              !["cancelled", "failed"].includes(s.saleStatus),
          ).length,

          pendingPayments:
            bookings.filter((b) =>
              ["unpaid", "pending"].includes(b.paymentStatus),
            ).length +
            sales.filter((s) => ["unpaid", "pending"].includes(s.paymentStatus))
              .length,

          failedPayments:
            bookings.filter((b) => b.paymentStatus === "failed").length +
            sales.filter((s) => s.paymentStatus === "failed").length,

          totalCustomers: customers.length,
          totalStaff: staff.length,

          revenue: paidSaleRevenue + paidRentalRevenue,
        });
      } catch (err) {
        setError(
          err.response?.data?.message || "Failed to load dashboard data.",
        );
      } finally {
        setLoading(false);
      }
    };

    if (role) {
      fetchData();
    }
  }, [role, canViewOperations]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#05080d]">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-white/10 border-t-cyan-400" />
          <p className="text-sm text-slate-500">
            Loading operations dashboard...
          </p>
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
        <div className="mb-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/[0.06] px-3 py-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)]" />
                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-300">
                  Operations Portal
                </span>
              </div>

              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                Good to see you,{" "}
                <span className="text-slate-400">
                  {user?.name?.split(" ")[0] || "there"}.
                </span>
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
                Monitor Ruvasgod Auto operations, vehicles, rentals, sales,
                payments, and team activity from one central workspace.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4 backdrop-blur-sm">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                Current Role
              </p>

              <p className="mt-1 text-sm font-semibold capitalize text-white">
                {role?.replace("_", " ")}
              </p>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-8 rounded-2xl border border-red-400/20 bg-red-400/[0.06] p-4">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-red-400/10 text-sm text-red-300">
                !
              </div>

              <div>
                <p className="text-sm font-semibold text-red-200">
                  Dashboard error
                </p>

                <p className="mt-1 text-sm text-red-300/70">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Admin / Manager */}
        {canViewOperations && (
          <section>
            <SectionHeader
              eyebrow="Command Center"
              title="Business Overview"
              description="A high-level view of the platform's current activity."
            />

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
              <StatCard
                label="Total Customers"
                value={stats.totalCustomers}
                accent="cyan"
              />

              <StatCard
                label="Total Staff"
                value={stats.totalStaff}
                accent="default"
              />

              <StatCard
                label="Total Vehicles"
                value={stats.totalVehicles}
                accent="default"
              />

              <StatCard
                label="Active Rentals"
                value={stats.activeRentals}
                accent="emerald"
              />

              <StatCard
                label="Pending Sales"
                value={stats.pendingSales}
                accent="amber"
              />

              <StatCard
                label="Completed Sales"
                value={stats.completedSales}
                accent="emerald"
              />

              <StatCard
                label="Revenue Paid"
                value={`GHS ${(stats.revenue || 0).toLocaleString()}`}
                accent="cyan"
              />
            </div>
          </section>
        )}

        {/* Sales */}
        {role === "sales" && (
          <section>
            <SectionHeader
              eyebrow="Sales Operations"
              title="Sales Overview"
              description="Track vehicle sales activity and payment readiness."
            />

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <StatCard
                label="Available Vehicles"
                value={stats.availableForSale}
                accent="cyan"
              />

              <StatCard
                label="Pending Sales"
                value={stats.pendingSales}
                accent="amber"
              />

              <StatCard
                label="Completed Sales"
                value={stats.completedSales}
                accent="emerald"
              />

              <StatCard
                label="Awaiting Payment"
                value={stats.salesAwaitingPayment}
                accent="red"
              />
            </div>
          </section>
        )}

        {/* Rental */}
        {role === "rental" && (
          <section>
            <SectionHeader
              eyebrow="Rental Operations"
              title="Rental Overview"
              description="Monitor vehicle availability and rental activity."
            />

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <StatCard
                label="Available Vehicles"
                value={stats.availableForRent}
                accent="cyan"
              />

              <StatCard
                label="Pending Bookings"
                value={stats.pendingBookings}
                accent="amber"
              />

              <StatCard
                label="Active Rentals"
                value={stats.activeRentals}
                accent="emerald"
              />

              <StatCard
                label="Completed Rentals"
                value={stats.completedRentals}
                accent="default"
              />
            </div>
          </section>
        )}

        {/* Finance */}
        {role === "finance" && (
          <section>
            <SectionHeader
              eyebrow="Finance Operations"
              title="Payment Overview"
              description="Monitor payment status and recorded revenue."
            />

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <StatCard
                label="Pending Payments"
                value={stats.pendingPayments}
                accent="amber"
              />

              <StatCard
                label="Paid Sales"
                value={stats.completedSales}
                accent="emerald"
              />

              <StatCard
                label="Paid Rentals"
                value={stats.activeRentals}
                accent="cyan"
              />

              <StatCard
                label="Failed Payments"
                value={stats.failedPayments}
                accent="red"
              />

              <StatCard
                label="Revenue Paid"
                value={`GHS ${(stats.revenue || 0).toLocaleString()}`}
                accent="cyan"
              />
            </div>
          </section>
        )}

        {/* Vehicle Manager */}
        {role === "vehicle_manager" && (
          <section>
            <SectionHeader
              eyebrow="Fleet Operations"
              title="Vehicle Overview"
              description="Monitor the Ruvasgod Auto fleet and availability."
            />

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <StatCard
                label="Total Vehicles"
                value={stats.totalVehicles}
                accent="default"
              />

              <StatCard
                label="Available for Sale"
                value={stats.availableForSale}
                accent="cyan"
              />

              <StatCard
                label="Available for Rent"
                value={stats.availableForRent}
                accent="emerald"
              />

              <StatCard
                label="Featured Vehicles"
                value={stats.featuredVehicles}
                accent="amber"
              />
            </div>
          </section>
        )}

        {/* Quick Access */}
        <section className="mt-12">
          <SectionHeader
            eyebrow="Workspace"
            title="Quick Access"
            description="Jump directly into the area you need to manage."
          />

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {role === "admin" && (
              <QuickLink to="/staff/staff" label="Manage Staff" />
            )}

            {["admin", "manager", "sales", "rental"].includes(role) && (
              <QuickLink to="/staff/customers" label="Customers" />
            )}

            {["admin", "manager", "vehicle_manager"].includes(role) && (
              <QuickLink to="/staff/vehicles" label="Vehicles" />
            )}

            {["admin", "manager", "rental", "finance"].includes(role) && (
              <QuickLink to="/staff/bookings" label="Bookings" />
            )}

            {["admin", "manager", "sales", "finance"].includes(role) && (
              <QuickLink to="/staff/sales" label="Sales" />
            )}

            {["admin", "manager", "finance"].includes(role) && (
              <QuickLink to="/staff/payments" label="Payments" />
            )}
          </div>
        </section>

        {/* Bottom status */}
        <div className="mt-12 border-t border-white/10 pt-6">
          <div className="flex flex-col gap-2 text-xs text-slate-600 sm:flex-row sm:items-center sm:justify-between">
            <p>Ruvasgod Auto · Operations Portal</p>

            <p className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              System workspace active
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StaffDashboard;
