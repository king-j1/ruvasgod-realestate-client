import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function AdminDashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-slate-900 text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <h1 className="text-2xl font-bold">Ruvasgod Auto</h1>
            <p className="text-sm text-slate-400">Admin Dashboard</p>
          </div>

          <button
            onClick={logout}
            className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-900"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-10">
        <h2 className="text-3xl font-bold text-slate-900">
          Welcome, {user?.name}
        </h2>

        <p className="mt-2 text-slate-500">
          Manage your vehicles and customer bookings.
        </p>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <Link
            to="/admin/vehicles"
            className="rounded-2xl bg-white p-8 shadow-sm transition hover:shadow-lg"
          >
            <h3 className="text-xl font-bold text-slate-900">
              Manage Vehicles
            </h3>

            <p className="mt-2 text-slate-500">
              Add, edit and remove rental vehicles.
            </p>
          </Link>

          <Link
            to="/admin/bookings"
            className="rounded-2xl bg-white p-8 shadow-sm transition hover:shadow-lg"
          >
            <h3 className="text-xl font-bold text-slate-900">
              Manage Bookings
            </h3>

            <p className="mt-2 text-slate-500">
              View and update customer bookings.
            </p>
          </Link>
        </div>
      </main>
    </div>
  );
}

export default AdminDashboard;