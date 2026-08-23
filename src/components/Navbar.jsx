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
    <nav className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        
        {/* Logo */}
        <Link
          to="/"
          className="text-xl font-bold text-slate-900"
        >
          RUVASGOD AUTO
        </Link>

        {/* Navigation */}
        <div className="flex items-center gap-5">
          <Link
            to="/"
            className="text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            Home
          </Link>

          <Link
            to="/vehicles"
            className="text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            Vehicles
          </Link>

          {/* Customer navigation */}
          {user && user.role !== "admin" && (
            <Link
              to="/my-bookings"
              className="text-sm font-medium text-slate-600 hover:text-slate-900"
            >
              My Bookings
            </Link>
          )}

          {/* Admin navigation */}
          {user?.role === "admin" && (
            <>
              <Link
                to="/admin"
                className="text-sm font-medium text-slate-600 hover:text-slate-900"
              >
                Dashboard
              </Link>

              <Link
                to="/admin/vehicles"
                className="text-sm font-medium text-slate-600 hover:text-slate-900"
              >
                Manage Vehicles
              </Link>

              <Link
                to="/admin/bookings"
                className="text-sm font-medium text-slate-600 hover:text-slate-900"
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
                className="text-sm font-semibold text-slate-700 hover:text-slate-950"
              >
                Log In
              </Link>

              <Link
                to="/register"
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
              >
                Sign Up
              </Link>
            </>
          )}

          {/* Logged in */}
          {user && (
            <button
              onClick={handleLogout}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;