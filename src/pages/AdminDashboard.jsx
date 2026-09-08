
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function AdminDashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#05080d] text-white">
      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-cyan-500/10 blur-[120px]" />
        <div className="absolute -right-40 top-20 h-96 w-96 rounded-full bg-blue-500/10 blur-[120px]" />
        <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-indigo-500/5 blur-[120px]" />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.04),transparent_35%)]" />
      </div>

      {/* Header */}
      <header className="relative border-b border-white/[0.08] bg-black/20 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            {/* Brand mark */}
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/[0.06] shadow-[0_0_30px_rgba(34,211,238,0.08)]">
              <span className="text-sm font-black tracking-tight text-cyan-300">
                RA
              </span>
            </div>

            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-400">
                Ruvasgod Auto
              </p>

              <h1 className="mt-0.5 text-sm font-bold text-white sm:text-base">
                Admin Control Center
              </h1>
            </div>
          </div>

          <button
            onClick={logout}
            className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-xs font-semibold text-slate-300 transition hover:border-red-400/20 hover:bg-red-400/[0.06] hover:text-red-300"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        {/* Welcome */}
        <section>
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/[0.06] px-3 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)]" />

            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-300">
              Administrator Access
            </span>
          </div>

          <h2 className="max-w-4xl text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Welcome back,
            <span className="block bg-gradient-to-r from-white via-slate-200 to-cyan-300 bg-clip-text text-transparent">
              {user?.name || "Administrator"}
            </span>
          </h2>

          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-500 sm:text-base">
            Manage the Ruvasgod Auto fleet and oversee customer rental
            operations from one central control center.
          </p>
        </section>

        {/* Control center */}
        <section className="mt-10">
          <div className="mb-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-400">
              Management
            </p>

            <h3 className="mt-1 text-xl font-bold text-white sm:text-2xl">
              Core Operations
            </h3>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            {/* Vehicles */}
            <Link
              to="/admin/vehicles"
              className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-7 shadow-2xl shadow-black/20 transition duration-300 hover:-translate-y-1 hover:border-cyan-400/20 hover:bg-white/[0.05] sm:p-8"
            >
              <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-cyan-400/5 blur-3xl transition duration-500 group-hover:bg-cyan-400/10" />

              <div className="relative">
                <div className="flex items-start justify-between">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/[0.06]">
                    <svg
                      width="26"
                      height="26"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      className="text-cyan-300"
                    >
                      <path d="M5 17h14" />
                      <path d="M6 17l1-5h10l1 5" />
                      <path d="M8 12l1.5-4h5L16 12" />
                      <circle cx="8" cy="17" r="1.5" />
                      <circle cx="16" cy="17" r="1.5" />
                    </svg>
                  </div>

                  <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-slate-500 transition group-hover:border-cyan-400/20 group-hover:text-cyan-300">
                    →
                  </span>
                </div>

                <p className="mt-7 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-600">
                  Fleet Management
                </p>

                <h4 className="mt-2 text-2xl font-bold text-white">
                  Manage Vehicles
                </h4>

                <p className="mt-3 max-w-lg text-sm leading-6 text-slate-500">
                  Add, edit, manage pricing, update availability, and maintain
                  the Ruvasgod Auto vehicle fleet.
                </p>

                <div className="mt-6 flex items-center gap-2 text-xs font-semibold text-cyan-300">
                  Open Fleet Management
                  <span className="transition-transform duration-300 group-hover:translate-x-1">
                    →
                  </span>
                </div>
              </div>
            </Link>

            {/* Bookings */}
            <Link
              to="/admin/bookings"
              className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-7 shadow-2xl shadow-black/20 transition duration-300 hover:-translate-y-1 hover:border-blue-400/20 hover:bg-white/[0.05] sm:p-8"
            >
              <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-blue-400/5 blur-3xl transition duration-500 group-hover:bg-blue-400/10" />

              <div className="relative">
                <div className="flex items-start justify-between">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-400/20 bg-blue-400/[0.06]">
                    <svg
                      width="26"
                      height="26"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      className="text-blue-300"
                    >
                      <rect x="3" y="5" width="18" height="16" rx="2" />
                      <path d="M16 3v4M8 3v4M3 10h18" />
                      <path d="M8 14h3M8 17h6" />
                    </svg>
                  </div>

                  <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-slate-500 transition group-hover:border-blue-400/20 group-hover:text-blue-300">
                    →
                  </span>
                </div>

                <p className="mt-7 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-600">
                  Rental Operations
                </p>

                <h4 className="mt-2 text-2xl font-bold text-white">
                  Manage Bookings
                </h4>

                <p className="mt-3 max-w-lg text-sm leading-6 text-slate-500">
                  Review customer reservations, manage booking status, and
                  oversee the rental lifecycle.
                </p>

                <div className="mt-6 flex items-center gap-2 text-xs font-semibold text-blue-300">
                  Open Booking Management
                  <span className="transition-transform duration-300 group-hover:translate-x-1">
                    →
                  </span>
                </div>
              </div>
            </Link>
          </div>
        </section>

        {/* Admin philosophy */}
        <section className="mt-10 rounded-3xl border border-white/10 bg-white/[0.025] p-6 sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-600">
                Admin Workspace
              </p>

              <h3 className="mt-2 text-lg font-bold text-white">
                Centralized control for Ruvasgod Auto
              </h3>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Use the dedicated Staff Operations Portal for day-to-day
                operational workflows and role-based staff management.
              </p>
            </div>

            <Link
              to="/staff/dashboard"
              className="inline-flex shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] px-5 py-3 text-xs font-semibold text-slate-300 transition hover:border-cyan-400/20 hover:bg-cyan-400/[0.06] hover:text-cyan-300"
            >
              Open Staff Operations
              <span className="ml-2">→</span>
            </Link>
          </div>
        </section>

        {/* Footer status */}
        <div className="mt-12 border-t border-white/10 pt-5">
          <div className="flex flex-col gap-2 text-xs text-slate-600 sm:flex-row sm:items-center sm:justify-between">
            <p>Ruvasgod Auto · Administration</p>

            <p className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.7)]" />
              Admin workspace active
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default AdminDashboard;
