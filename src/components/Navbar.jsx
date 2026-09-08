
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  FiMenu,
  FiX,
  FiLogOut,
  FiChevronRight,
  FiUser,
} from "react-icons/fi";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const closeMobileMenu = () => {
    setMobileOpen(false);
  };

  const handleLogout = () => {
    closeMobileMenu();
    logout();
    navigate("/");
  };

  const staffRoles = [
    "manager",
    "sales",
    "rental",
    "finance",
    "vehicle_manager",
  ];

  const isStaff =
    user && staffRoles.includes(user.role);

  const navClass = ({ isActive }) =>
    `relative py-2 text-[13px] font-semibold tracking-wide transition ${
      isActive
        ? "text-white"
        : "text-slate-400 hover:text-white"
    }`;

  const mobileNavClass = ({ isActive }) =>
    `flex items-center justify-between rounded-2xl px-4 py-3.5 text-sm font-semibold transition ${
      isActive
        ? "bg-white text-slate-950"
        : "text-slate-300 hover:bg-white/5 hover:text-white"
    }`;

  return (
    <nav className="sticky top-0 z-50 border-b border-white/10 bg-[#05070a]/90 text-white backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-[76px] items-center justify-between">

          {/* BRAND */}
          <Link
            to="/"
            onClick={closeMobileMenu}
            className="group flex items-center gap-3"
          >
            <div className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl border border-white/15 bg-white/[0.06] shadow-lg transition duration-300 group-hover:border-cyan-400/40 group-hover:bg-white/10">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/20 via-transparent to-blue-500/20 opacity-70" />

              <span className="relative text-sm font-black tracking-tight text-white">
                R
              </span>
            </div>

            <div className="leading-none">
              <p className="text-[17px] font-black tracking-[0.08em] text-white">
                RUVASGOD
              </p>

              <p className="mt-1 text-[9px] font-semibold tracking-[0.38em] text-cyan-400">
                AUTO
              </p>
            </div>
          </Link>

          {/* DESKTOP NAVIGATION */}
          <div className="hidden items-center gap-7 lg:flex">

            <NavLink to="/" end className={navClass}>
              Home
            </NavLink>

            <NavLink to="/vehicles" className={navClass}>
              Vehicles
            </NavLink>

            {/* CUSTOMER */}
            {user?.role === "customer" && (
              <>
                <NavLink to="/my-bookings" className={navClass}>
                  My Bookings
                </NavLink>

                <NavLink to="/my-purchases" className={navClass}>
                  My Purchases
                </NavLink>
              </>
            )}

            {/* ADMIN */}
            {user?.role === "admin" && (
              <>
                <NavLink to="/admin" end className={navClass}>
                  Dashboard
                </NavLink>

                <NavLink
                  to="/staff/dashboard"
                  className={navClass}
                >
                  Staff Portal
                </NavLink>
              </>
            )}

            {/* STAFF */}
            {isStaff && (
              <NavLink
                to="/staff/dashboard"
                className={navClass}
              >
                Staff Portal
              </NavLink>
            )}

            {/* GUEST */}
            {!user && (
              <>
                <NavLink to="/login" className={navClass}>
                  Log In
                </NavLink>

                <Link
                  to="/register"
                  className="group relative overflow-hidden rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-slate-950 transition duration-300 hover:bg-cyan-300"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    Get Started
                    <FiChevronRight
                      size={15}
                      className="transition-transform duration-300 group-hover:translate-x-0.5"
                    />
                  </span>
                </Link>
              </>
            )}

            {/* LOGGED IN */}
            {user && (
              <div className="flex items-center gap-3 border-l border-white/10 pl-5">

                <div className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.06]">
                  <FiUser
                    size={15}
                    className="text-cyan-400"
                  />
                </div>

                <div className="max-w-[130px]">
                  <p className="truncate text-xs font-semibold text-white">
                    {user.name}
                  </p>

                  <p className="mt-0.5 text-[9px] uppercase tracking-[0.16em] text-slate-500">
                    {user.role}
                  </p>
                </div>

                <button
                  onClick={handleLogout}
                  className="ml-1 flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-xs font-semibold text-slate-300 transition hover:border-red-400/30 hover:bg-red-500/10 hover:text-red-400"
                >
                  <FiLogOut size={15} />
                  Logout
                </button>
              </div>
            )}
          </div>

          {/* MOBILE BUTTON */}
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-slate-200 transition hover:border-white/20 hover:bg-white/[0.08] lg:hidden"
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? (
              <FiX size={21} />
            ) : (
              <FiMenu size={21} />
            )}
          </button>
        </div>
      </div>

      {/* MOBILE MENU */}
      {mobileOpen && (
        <div className="border-t border-white/10 bg-[#05070a] lg:hidden">
          <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6">

            <div className="mb-5 rounded-2xl border border-white/10 bg-white/[0.03] p-2">

              <NavLink
                to="/"
                end
                onClick={closeMobileMenu}
                className={mobileNavClass}
              >
                <span>Home</span>
                <FiChevronRight size={16} />
              </NavLink>

              <NavLink
                to="/vehicles"
                onClick={closeMobileMenu}
                className={mobileNavClass}
              >
                <span>Vehicles</span>
                <FiChevronRight size={16} />
              </NavLink>

              {/* CUSTOMER */}
              {user?.role === "customer" && (
                <>
                  <NavLink
                    to="/my-bookings"
                    onClick={closeMobileMenu}
                    className={mobileNavClass}
                  >
                    <span>My Bookings</span>
                    <FiChevronRight size={16} />
                  </NavLink>

                  <NavLink
                    to="/my-purchases"
                    onClick={closeMobileMenu}
                    className={mobileNavClass}
                  >
                    <span>My Purchases</span>
                    <FiChevronRight size={16} />
                  </NavLink>
                </>
              )}

              {/* ADMIN */}
              {user?.role === "admin" && (
                <>
                  <NavLink
                    to="/admin"
                    end
                    onClick={closeMobileMenu}
                    className={mobileNavClass}
                  >
                    <span>Dashboard</span>
                    <FiChevronRight size={16} />
                  </NavLink>

                  <NavLink
                    to="/staff/dashboard"
                    onClick={closeMobileMenu}
                    className={mobileNavClass}
                  >
                    <span>Staff Portal</span>
                    <FiChevronRight size={16} />
                  </NavLink>
                </>
              )}

              {/* STAFF */}
              {isStaff && (
                <NavLink
                  to="/staff/dashboard"
                  onClick={closeMobileMenu}
                  className={mobileNavClass}
                >
                  <span>Staff Portal</span>
                  <FiChevronRight size={16} />
                </NavLink>
              )}
            </div>

            {/* MOBILE AUTH */}
            <div className="border-t border-white/10 pt-5">

              {!user ? (
                <div className="grid gap-2 sm:grid-cols-2">

                  <Link
                    to="/login"
                    onClick={closeMobileMenu}
                    className="flex items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3.5 text-sm font-semibold text-slate-200 transition hover:bg-white/[0.08]"
                  >
                    Log In
                  </Link>

                  <Link
                    to="/register"
                    onClick={closeMobileMenu}
                    className="flex items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3.5 text-sm font-bold text-slate-950 transition hover:bg-cyan-300"
                  >
                    Get Started
                    <FiChevronRight size={16} />
                  </Link>

                </div>
              ) : (
                <div className="space-y-3">

                  <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4">

                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.06]">
                      <FiUser
                        size={17}
                        className="text-cyan-400"
                      />
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-white">
                        {user.name}
                      </p>

                      <p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-slate-500">
                        {user.role}
                      </p>
                    </div>

                  </div>

                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3.5 text-sm font-semibold text-red-400 transition hover:bg-red-500/15"
                  >
                    <FiLogOut size={17} />
                    Logout
                  </button>

                </div>
              )}
            </div>

          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
