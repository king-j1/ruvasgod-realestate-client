
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import { FiMenu, FiX, FiLogOut } from "react-icons/fi";
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

  const navClass = ({ isActive }) =>
    `text-sm font-semibold transition ${
      isActive
        ? "text-slate-950"
        : "text-slate-600 hover:text-slate-950"
    }`;

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between">
          {/* LOGO */}
          <Link
            to="/"
            onClick={closeMobileMenu}
            className="flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-sm font-black text-white">
              R
            </div>

            <div>
              <p className="text-lg font-black tracking-tight text-slate-900">
                RUVASGOD
              </p>

              <p className="text-[10px] font-semibold tracking-[0.25em] text-slate-500">
                AUTO
              </p>
            </div>
          </Link>

          {/* DESKTOP NAVIGATION */}
          <div className="hidden items-center gap-6 lg:flex">
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

                <NavLink to="/staff/dashboard" className={navClass}>
                  Staff Portal
                </NavLink>
              </>
            )}

            {/* STAFF */}
            {user &&
              [
                "manager",
                "sales",
                "rental",
                "finance",
                "vehicle_manager",
              ].includes(user.role) && (
                <NavLink to="/staff/dashboard" className={navClass}>
                  Staff Portal
                </NavLink>
              )}

            {/* LOGGED OUT */}
            {!user && (
              <>
                <NavLink to="/login" className={navClass}>
                  Log In
                </NavLink>

                <Link
                  to="/register"
                  className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
                >
                  Sign Up
                </Link>
              </>
            )}

            {/* LOGGED IN */}
            {user && (
              <div className="flex items-center gap-3 border-l border-slate-200 pl-4">
                <div className="text-right">
                  <p className="max-w-32 truncate text-xs font-semibold text-slate-900">
                    {user.name}
                  </p>

                  <p className="text-[10px] uppercase tracking-wider text-slate-400">
                    {user.role}
                  </p>
                </div>

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-red-300 hover:bg-red-50 hover:text-red-600"
                >
                  <FiLogOut size={16} />
                  Logout
                </button>
              </div>
            )}
          </div>

          {/* MOBILE MENU BUTTON */}
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-700 transition hover:bg-slate-100 lg:hidden"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <FiX size={22} /> : <FiMenu size={22} />}
          </button>
        </div>
      </div>

      {/* MOBILE MENU */}
      {mobileOpen && (
        <div className="border-t border-slate-200 bg-white lg:hidden">
          <div className="mx-auto max-w-7xl space-y-1 px-4 py-4 sm:px-6">
            <NavLink
              to="/"
              end
              onClick={closeMobileMenu}
              className={({ isActive }) =>
                `block rounded-xl px-4 py-3 text-sm font-semibold ${
                  isActive
                    ? "bg-slate-900 text-white"
                    : "text-slate-700 hover:bg-slate-100"
                }`
              }
            >
              Home
            </NavLink>

            <NavLink
              to="/vehicles"
              onClick={closeMobileMenu}
              className={({ isActive }) =>
                `block rounded-xl px-4 py-3 text-sm font-semibold ${
                  isActive
                    ? "bg-slate-900 text-white"
                    : "text-slate-700 hover:bg-slate-100"
                }`
              }
            >
              Vehicles
            </NavLink>

            {/* CUSTOMER MOBILE */}
            {user?.role === "customer" && (
              <>
                <NavLink
                  to="/my-bookings"
                  onClick={closeMobileMenu}
                  className={navClass}
                >
                  My Bookings
                </NavLink>

                <NavLink
                  to="/my-purchases"
                  onClick={closeMobileMenu}
                  className={navClass}
                >
                  My Purchases
                </NavLink>
              </>
            )}

            {/* ADMIN MOBILE */}
            {user?.role === "admin" && (
              <>
                <NavLink
                  to="/admin"
                  onClick={closeMobileMenu}
                  className={navClass}
                >
                  Dashboard
                </NavLink>

                <NavLink
                  to="/staff/dashboard"
                  onClick={closeMobileMenu}
                  className={navClass}
                >
                  Staff Portal
                </NavLink>
              </>
            )}

            {/* STAFF MOBILE */}
            {user &&
              [
                "manager",
                "sales",
                "rental",
                "finance",
                "vehicle_manager",
              ].includes(user.role) && (
                <NavLink
                  to="/staff/dashboard"
                  onClick={closeMobileMenu}
                  className={navClass}
                >
                  Staff Portal
                </NavLink>
              )}

            {/* MOBILE AUTH */}
            <div className="mt-3 border-t border-slate-200 pt-3">
              {!user ? (
                <div className="space-y-2">
                  <Link
                    to="/login"
                    onClick={closeMobileMenu}
                    className="block rounded-xl border border-slate-200 px-4 py-3 text-center text-sm font-semibold text-slate-700"
                  >
                    Log In
                  </Link>

                  <Link
                    to="/register"
                    onClick={closeMobileMenu}
                    className="block rounded-xl bg-slate-900 px-4 py-3 text-center text-sm font-semibold text-white"
                  >
                    Sign Up
                  </Link>
                </div>
              ) : (
                <>
                  <div className="mb-3 rounded-xl bg-slate-50 px-4 py-3">
                    <p className="font-semibold text-slate-900">
                      {user.name}
                    </p>

                    <p className="mt-1 text-xs uppercase tracking-wider text-slate-500">
                      {user.role}
                    </p>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600"
                  >
                    <FiLogOut size={17} />
                    Logout
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
