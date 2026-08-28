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
} from "react-icons/fi";

function StaffLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const role = user?.role;

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
    item.roles.includes(role),
  );

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const closeMobileMenu = () => {
    setMobileOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-100">
      {/* TOP BAR */}
      <header className="fixed inset-x-0 top-0 z-50 h-16 border-b border-slate-200 bg-white">
        <div className="flex h-full items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileOpen(!mobileOpen)}
              className="rounded-lg p-2 text-slate-600 transition hover:bg-slate-100 lg:hidden"
              aria-label="Toggle navigation"
            >
              {mobileOpen ? <FiX size={22} /> : <FiMenu size={22} />}
            </button>

            <Link
              to="/"
              className="flex items-center gap-3"
              onClick={closeMobileMenu}
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-sm font-black text-white">
                R
              </div>

              <div className="hidden sm:block">
                <p className="text-sm font-black tracking-tight text-slate-900">
                  RUVASGOD
                </p>

                <p className="text-[9px] font-semibold tracking-[0.25em] text-slate-500">
                  AUTO
                </p>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-slate-900">
                {user?.name}
              </p>

              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                {role?.replace("_", " ")}
              </p>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
            >
              <FiLogOut size={16} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* TOP BAR SPACING */}
      <div className="h-16" />

      {/* DESKTOP SIDEBAR */}
      <aside className="fixed bottom-0 left-0 top-16 z-40 hidden w-64 flex-col border-r border-slate-200 bg-white lg:flex">
        <div className="flex-1 overflow-y-auto px-4 py-6">
          <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
            Operations
          </p>

          <nav className="space-y-1">
            {allowedNavigation.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                      isActive
                        ? "bg-slate-900 text-white shadow-sm"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }`
                  }
                >
                  <Icon size={18} />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>
        </div>

        <div className="border-t border-slate-200 p-4">
          <Link
            to="/"
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
          >
            <FiArrowLeft size={18} />
            Back to website
          </Link>
        </div>
      </aside>

      {/* MOBILE SIDEBAR */}
      {mobileOpen && (
        <div className="fixed inset-0 top-16 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-black/30"
            onClick={closeMobileMenu}
          />

          <aside className="relative flex h-full w-72 flex-col bg-white shadow-xl">
            <div className="flex-1 overflow-y-auto px-4 py-6">
              <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                Operations
              </p>

              <nav className="space-y-1">
                {allowedNavigation.map((item) => {
                  const Icon = item.icon;

                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={closeMobileMenu}
                      className={({ isActive }) =>
                        `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition ${
                          isActive
                            ? "bg-slate-900 text-white"
                            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                        }`
                      }
                    >
                      <Icon size={18} />
                      {item.label}
                    </NavLink>
                  );
                })}
              </nav>
            </div>

            <div className="border-t border-slate-200 p-4">
              <Link
                to="/"
                onClick={closeMobileMenu}
                className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
              >
                <FiArrowLeft size={18} />
                Back to website
              </Link>
            </div>
          </aside>
        </div>
      )}

      {/* MAIN CONTENT */}
      <main className="min-w-0 flex-1 lg:ml-64">
        <Outlet />
      </main>
    </div>
  );
}

export default StaffLayout;