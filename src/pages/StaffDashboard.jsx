import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

function StatCard({ label, value }) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
    </div>
  );
}

function QuickLink({ to, label }) {
  return (
    <Link
      to={to}
      className="rounded-xl border border-slate-200 bg-white px-5 py-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-emerald-300 hover:text-emerald-700"
    >
      {label}
    </Link>
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
          completedRentals: bookings.filter((b) => b.status === "completed").length,

          pendingSales: sales.filter((s) => s.saleStatus === "pending").length,
          completedSales: sales.filter((s) => s.saleStatus === "completed").length,
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
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <p className="text-slate-600">Loading staff dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">
            Staff Dashboard
          </h1>

          <p className="mt-2 text-slate-500">
            Welcome back, {user?.name}.{" "}
            <span className="capitalize">{role?.replace("_", " ")}</span>{" "}
            overview.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg bg-red-50 p-4 text-red-600">
            {error}
          </div>
        )}

        {canViewOperations && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            <StatCard label="Total Customers" value={stats.totalCustomers} />
            <StatCard label="Total Staff" value={stats.totalStaff} />
            <StatCard label="Total Vehicles" value={stats.totalVehicles} />
            <StatCard label="Active Rentals" value={stats.activeRentals} />
            <StatCard label="Pending Sales" value={stats.pendingSales} />
            <StatCard label="Completed Sales" value={stats.completedSales} />
            <StatCard
              label="Revenue (Paid)"
              value={`GHS ${(stats.revenue || 0).toLocaleString()}`}
            />
          </div>
        )}

        {role === "sales" && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatCard label="Available Vehicles" value={stats.availableForSale} />
            <StatCard label="Pending Sales" value={stats.pendingSales} />
            <StatCard label="Completed Sales" value={stats.completedSales} />
            <StatCard
              label="Awaiting Payment"
              value={stats.salesAwaitingPayment}
            />
          </div>
        )}

        {role === "rental" && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatCard label="Available Vehicles" value={stats.availableForRent} />
            <StatCard label="Pending Bookings" value={stats.pendingBookings} />
            <StatCard label="Active Rentals" value={stats.activeRentals} />
            <StatCard label="Completed Rentals" value={stats.completedRentals} />
          </div>
        )}

        {role === "finance" && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatCard label="Pending Payments" value={stats.pendingPayments} />
            <StatCard label="Paid Sales" value={stats.completedSales} />
            <StatCard label="Paid Rentals" value={stats.activeRentals} />
            <StatCard label="Failed Payments" value={stats.failedPayments} />
            <StatCard
              label="Revenue (Paid)"
              value={`GHS ${(stats.revenue || 0).toLocaleString()}`}
            />
          </div>
        )}

        {role === "vehicle_manager" && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatCard label="Total Vehicles" value={stats.totalVehicles} />
            <StatCard label="Available for Sale" value={stats.availableForSale} />
            <StatCard label="Available for Rent" value={stats.availableForRent} />
            <StatCard label="Featured Vehicles" value={stats.featuredVehicles} />
          </div>
        )}

        <div className="mt-10">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">
            Quick Access
          </h2>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {(role === "admin") && (
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
        </div>
      </div>
    </div>
  );
}

export default StaffDashboard;
