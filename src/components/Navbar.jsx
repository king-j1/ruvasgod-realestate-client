import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link
          to="/"
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

        {/* Navigation */}
        <div className="flex items-center gap-6">
          <Link
            to="/"
            className="text-sm font-medium text-slate-600 transition hover:text-slate-950"
          >
            Home
          </Link>

          <Link
            to="/vehicles"
            className="text-sm font-medium text-slate-600 transition hover:text-slate-950"
          >
            Vehicles
          </Link>

          {/* Customer navigation */}
          {user && user.role !== "admin" && (
            <Link
              to="/my-bookings"
              className="text-sm font-medium text-slate-600 transition hover:text-slate-950"
            >
              My Bookings
            </Link>
          )}

          {/* Admin navigation */}
          {user?.role === "admin" && (
            <>
              <Link
                to="/admin"
                className="text-sm font-medium text-slate-600 transition hover:text-slate-950"
              >
                Dashboard
              </Link>

              <Link
                to="/admin/vehicles"
                className="text-sm font-medium text-slate-600 transition hover:text-slate-950"
              >
                Vehicles
              </Link>

              <Link
                to="/admin/bookings"
                className="text-sm font-medium text-slate-600 transition hover:text-slate-950"
              >
                Bookings
              </Link>
            </>
          )}

          {/* Logged out */}
          {!user && (
            <>
              <Link
                to="/login"
                className="text-sm font-semibold text-slate-700 transition hover:text-slate-950"
              >
                Log In
              </Link>

              <Link
                to="/register"
                className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
              >
                Sign Up
              </Link>
            </>
          )}

          {/* Logged in */}
          {user && (
            <div className="flex items-center gap-3">
              <div className="hidden text-right sm:block">
                <p className="text-xs font-semibold text-slate-900">
                  {user.name}
                </p>

                <p className="text-[10px] uppercase tracking-wider text-slate-400">
                  {user.role}
                </p>
              </div>

              <button
                onClick={handleLogout}
                className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-red-300 hover:bg-red-50 hover:text-red-600"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;