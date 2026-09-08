
import { NavLink, Outlet, Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

import {
  FiGrid,
  FiUsers,
  FiTruck,
  FiCalendar,
  FiShoppingBag,
  FiCreditCard,
  FiUserCheck,
  FiArrowLeft,
  FiLogOut,
  FiMenu,
  FiX,
  FiChevronRight,
  FiShield,
} from "react-icons/fi";

function StaffLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const role = user?.role;

  // IMPORTANT:
  // Keep these permissions exactly aligned with the existing system.
  const navigation = [
    {
      label: "Dashboard",
      to: "/staff/dashboard",
      icon: FiGrid,
      roles: [
        "admin",
        "manager",
        "sales",
        "rental",
        "finance",
        "vehicle_manager",
      ],
    },
    {
      label: "Customers",
      to: "/staff/customers",
      icon: FiUsers,
      roles: ["admin", "manager", "sales", "rental"],
    },
    {
      label: "Vehicles",
      to: "/staff/vehicles",
      icon: FiTruck,
      roles: ["admin", "manager", "vehicle_manager"],
    },
    {
      label: "Bookings",
      to: "/staff/bookings",
      icon: FiCalendar,
      roles: ["admin", "manager", "rental", "finance"],
    },
    {
      label: "Sales",
      to: "/staff/sales",
      icon: FiShoppingBag,
      roles: ["admin", "manager", "sales", "finance"],
    },
    {
      label: "Payments",
      to: "/staff/payments",
      icon: FiCreditCard,
      roles: ["admin", "manager", "finance"],
    },
    {
      label: "Staff",
      to: "/staff/staff",
      icon: FiUserCheck,
      roles: ["admin", "manager"],
    },
  ];

  const allowedNavigation = navigation.filter((item) =>
    item.roles.includes(role)
  );

  const handleLogout = () => {
    closeMobileMenu();
    logout();
    navigate("/");
  };

  const closeMobileMenu = () => {
    setMobileOpen(false);
  };

  const formattedRole = role
    ? role.replace(/_/g, " ")
    : "Staff";

  return (
    <div className="min-h-screen bg-[#05070a] text-white">

      {/* =====================================================
          TOP BAR
      ====================================================== */}
      <header className="fixed inset-x-0 top-0 z-50 h-[72px] border-b border-white/10 bg-[#05070a]/95 backdrop-blur-xl">

        <div className="flex h-full items-center justify-between px-4 sm:px-6">

          {/* LEFT */}
          <div className="flex items-center gap-3">

            {/* Mobile menu */}
            <button
              type="button"
              onClick={() => setMobileOpen(!mobileOpen)}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-slate-300 transition hover:bg-white/[0.08] lg:hidden"
              aria-label="Toggle navigation"
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? (
                <FiX size={20} />
              ) : (
                <FiMenu size={20} />
              )}
            </button>

            {/* Logo */}
            <Link
              to="/"
              className="group flex items-center gap-3"
              onClick={closeMobileMenu}
            >
              <div className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-white/[0.06]">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/20 via-transparent to-blue-500/20" />

                <span className="relative text-sm font-black text-white">
                  R
                </span>
              </div>

              <div className="hidden leading-none sm:block">
                <p className="text-[15px] font-black tracking-[0.08em] text-white">
                  RUVASGOD
                </p>

                <p className="mt-1 text-[8px] font-semibold tracking-[0.38em] text-cyan-400">
                  AUTO
                </p>
              </div>
            </Link>

            {/* Portal label */}
            <div className="ml-2 hidden items-center gap-2 border-l border-white/10 pl-4 md:flex">
              <FiShield
                size={14}
                className="text-cyan-400"
              />

              <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500">
                Operations Portal
              </span>
            </div>
          </div>

          {/* RIGHT */}
          <div className="flex items-center gap-3 sm:gap-4">

            {/* User */}
            <div className="hidden items-center gap-3 sm:flex">

              <div className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.05]">
                <span className="text-xs font-bold text-cyan-400">
                  {user?.name?.charAt(0)?.toUpperCase() || "R"}
                </span>
              </div>

              <div className="max-w-[150px] text-right">
                <p className="truncate text-xs font-semibold text-white">
                  {user?.name}
                </p>

                <p className="mt-0.5 text-[9px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                  {formattedRole}
                </p>
              </div>
            </div>

            {/* Logout */}
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-xs font-semibold text-slate-300 transition hover:border-red-400/30 hover:bg-red-500/10 hover:text-red-400"
            >
              <FiLogOut size={15} />
              <span className="hidden sm:inline">
                Logout
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* TOP BAR SPACING */}
      <div className="h-[72px]" />

      {/* =====================================================
          DESKTOP SIDEBAR
      ====================================================== */}
      <aside className="fixed bottom-0 left-0 top-[72px] z-40 hidden w-64 flex-col border-r border-white/10 bg-[#080b0f] lg:flex">

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto px-4 py-7">

          <div className="mb-5 px-3">
            <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-cyan-400">
              Operations
            </p>

            <p className="mt-2 text-xs text-slate-600">
              Manage your business
            </p>
          </div>

          <nav className="space-y-1.5">

            {allowedNavigation.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `group relative flex items-center gap-3 overflow-hidden rounded-xl px-3.5 py-3 text-sm font-semibold transition ${
                      isActive
                        ? "bg-white text-slate-950 shadow-lg"
                        : "text-slate-400 hover:bg-white/[0.05] hover:text-white"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <span className="absolute left-0 top-1/2 h-6 w-0.5 -translate-y-1/2 rounded-full bg-cyan-400" />
                      )}

                      <Icon
                        size={18}
                        className={
                          isActive
                            ? "text-slate-950"
                            : "text-slate-500 group-hover:text-cyan-400"
                        }
                      />

                      <span className="flex-1">
                        {item.label}
                      </span>

                      {isActive && (
                        <FiChevronRight size={15} />
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Bottom */}
        <div className="border-t border-white/10 p-4">

          <Link
            to="/"
            className="group flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-semibold text-slate-500 transition hover:bg-white/[0.05] hover:text-white"
          >
            <FiArrowLeft
              size={18}
              className="transition-transform group-hover:-translate-x-0.5"
            />

            Back to website
          </Link>
        </div>
      </aside>

      {/* =====================================================
          MOBILE SIDEBAR
      ====================================================== */}
      {mobileOpen && (
        <div className="fixed inset-0 top-[72px] z-40 lg:hidden">

          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={closeMobileMenu}
          />

          {/* Sidebar */}
          <aside className="relative flex h-full w-[290px] flex-col border-r border-white/10 bg-[#080b0f] shadow-2xl">

            <div className="flex-1 overflow-y-auto px-4 py-7">

              {/* Mobile user */}
              <div className="mb-7 rounded-2xl border border-white/10 bg-white/[0.04] p-4">

                <div className="flex items-center gap-3">

                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.06]">
                    <span className="text-sm font-bold text-cyan-400">
                      {user?.name?.charAt(0)?.toUpperCase() || "R"}
                    </span>
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-white">
                      {user?.name}
                    </p>

                    <p className="mt-1 text-[9px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                      {formattedRole}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mb-4 px-3">
                <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-cyan-400">
                  Operations
                </p>
              </div>

              <nav className="space-y-1.5">

                {allowedNavigation.map((item) => {
                  const Icon = item.icon;

                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={closeMobileMenu}
                      className={({ isActive }) =>
                        `flex items-center gap-3 rounded-xl px-3.5 py-3.5 text-sm font-semibold transition ${
                          isActive
                            ? "bg-white text-slate-950"
                            : "text-slate-400 hover:bg-white/[0.05] hover:text-white"
                        }`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <Icon
                            size={18}
                            className={
                              isActive
                                ? "text-slate-950"
                                : "text-slate-500"
                            }
                          />

                          <span className="flex-1">
                            {item.label}
                          </span>

                          {isActive && (
                            <FiChevronRight size={15} />
                          )}
                        </>
                      )}
                    </NavLink>
                  );
                })}
              </nav>
            </div>

            {/* Mobile bottom */}
            <div className="space-y-2 border-t border-white/10 p-4">

              <Link
                to="/"
                onClick={closeMobileMenu}
                className="flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-semibold text-slate-500 transition hover:bg-white/[0.05] hover:text-white"
              >
                <FiArrowLeft size={18} />
                Back to website
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-400 transition hover:bg-red-500/15"
              >
                <FiLogOut size={17} />
                Logout
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* =====================================================
          MAIN CONTENT
      ====================================================== */}
      <main className="min-w-0 flex-1 lg:ml-64">
        <Outlet />
      </main>
    </div>
  );
}

export default StaffLayout;
