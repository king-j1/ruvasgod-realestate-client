import { useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  FiCheckCircle,
  FiFileText,
  FiGrid,
  FiHome,
  FiLogOut,
  FiMenu,
  FiUsers,
  FiX,
  FiCalendar,
} from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import LanguageSelect from "./LanguageSelect";

function StaffLayout() {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const role = user?.role;
  const navigationSections = [
    {
      label: t("operations"),
      items: [
        {
          to: "/staff/dashboard",
          label: t("dashboard"),
          icon: FiGrid,
          roles: ["admin", "manager", "sales", "rental", "finance"],
        },
        {
          to: "/staff/properties",
          label: t("properties"),
          icon: FiHome,
          roles: ["admin", "manager"],
        },
        {
          to: "/staff/property-verification",
          label: t("propertyVerification"),
          icon: FiCheckCircle,
          roles: ["admin", "manager"],
        },
      ],
    },
    {
      label: t("customerManagement"),
      items: [
        {
          to: "/staff/customers",
          label: t("customers"),
          icon: FiUsers,
          roles: ["admin", "manager", "sales", "rental"],
        },
        {
          to: "/staff/property-enquiries",
          label: "Property enquiries",
          icon: FiFileText,
          roles: ["admin", "manager", "sales", "rental"],
        },
        {
          to: "/staff/property-viewings",
          label: "Property viewings",
          icon: FiCalendar,
          roles: ["admin", "manager", "property_manager", "sales", "rental"],
        },
      ],
    },
    {
      label: t("propertyManagement"),
      items: [
        {
          to: "/staff/owners",
          label: t("owners"),
          icon: FiFileText,
          roles: ["admin"],
        },
      ],
    },
    {
      label: t("administration"),
      items: [
        {
          to: "/staff/staff",
          label: t("staff"),
          icon: FiUsers,
          roles: ["admin", "manager"],
        },
      ],
    },
  ]
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => item.roles.includes(role)),
    }))
    .filter((section) => section.items.length > 0);

  const signOut = () => {
    logout();
    navigate("/");
  };

  const navClass = ({ isActive }) =>
    `flex min-h-11 items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-semibold transition ${isActive ? "bg-amber-900 text-white" : "text-stone-700 hover:bg-amber-50 hover:text-amber-950"}`;

  return (
    <div className="staff-shell min-h-screen bg-[#fffdf8] text-stone-900">
      <header className="sticky top-0 z-30 border-b border-stone-200 bg-[#fffdf8]/95 backdrop-blur">
        <div className="flex min-h-16 items-center justify-between gap-3 px-4 sm:px-7">
          <div className="flex items-center gap-3">
            <button
              className="flex h-11 w-11 items-center justify-center rounded-lg border border-stone-300 lg:hidden"
              aria-label="Toggle staff navigation"
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen((open) => !open)}
              type="button"
            >
              {mobileOpen ? <FiX /> : <FiMenu />}
            </button>
            <Link className="leading-tight" to="/">
              <span className="block text-sm font-extrabold tracking-wide">
                RUVASGOD
              </span>
              <span className="block text-[10px] font-semibold tracking-[0.16em] text-amber-900">
                REAL ESTATE
              </span>
            </Link>
            <span className="hidden border-s border-stone-300 ps-4 text-xs font-semibold text-stone-500 sm:block">
              {t("workspace")}
            </span>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <LanguageSelect />
            <span className="hidden max-w-40 truncate text-xs font-semibold text-stone-700 sm:inline">
              {user?.name}
            </span>
            <button
              className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-stone-300 px-3 text-xs font-semibold text-stone-700 hover:bg-stone-100"
              onClick={signOut}
              type="button"
            >
              <FiLogOut aria-hidden="true" />
              <span className="hidden sm:inline">{t("signOut")}</span>
            </button>
          </div>
        </div>
      </header>

      <aside className="fixed bottom-0 start-0 top-16 z-20 hidden w-64 border-e border-stone-200 bg-white p-4 lg:block">
        <nav className="space-y-5">
          {navigationSections.map((section) => (
            <section key={section.label}>
              <h2 className="px-3 py-2 text-[10px] font-bold uppercase tracking-[0.16em] text-amber-900">
                {section.label}
              </h2>
              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      className={navClass}
                      end={item.to === "/staff/dashboard"}
                      key={item.to}
                      to={item.to}
                    >
                      <Icon aria-hidden="true" />
                      {item.label}
                    </NavLink>
                  );
                })}
              </div>
            </section>
          ))}
        </nav>
        <Link
          className="mt-8 block rounded-xl px-3.5 py-3 text-sm font-semibold text-stone-600 hover:bg-stone-100"
          to="/"
        >
          ← {t("home")}
        </Link>
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 top-16 z-20 bg-stone-950/25 lg:hidden">
          <button
            aria-label="Close navigation"
            className="absolute inset-0 h-full w-full"
            onClick={() => setMobileOpen(false)}
            type="button"
          />
          <aside className="relative h-full w-[min(85vw,300px)] border-e border-stone-200 bg-white p-4 shadow-xl">
            <nav className="space-y-5">
              {navigationSections.map((section) => (
                <section key={section.label}>
                  <h2 className="px-3 py-2 text-[10px] font-bold uppercase tracking-[0.16em] text-amber-900">
                    {section.label}
                  </h2>
                  <div className="space-y-1">
                    {section.items.map((item) => {
                      const Icon = item.icon;
                      return (
                        <NavLink
                          className={navClass}
                          end={item.to === "/staff/dashboard"}
                          key={item.to}
                          onClick={() => setMobileOpen(false)}
                          to={item.to}
                        >
                          <Icon aria-hidden="true" />
                          {item.label}
                        </NavLink>
                      );
                    })}
                  </div>
                </section>
              ))}
            </nav>
            <Link
              className="mt-8 block rounded-xl px-3.5 py-3 text-sm font-semibold text-stone-600 hover:bg-stone-100"
              onClick={() => setMobileOpen(false)}
              to="/"
            >
              ← {t("home")}
            </Link>
          </aside>
        </div>
      )}

      <main className="min-w-0 lg:ms-64">
        <Outlet />
      </main>
    </div>
  );
}

export default StaffLayout;
