import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { FiLogOut, FiMenu, FiX } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import LanguageSelect from "./LanguageSelect";

function Navbar() {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const staffRoles = ["admin", "manager", "sales", "rental", "finance"];
  const canAccessStaff = staffRoles.includes(user?.role);
  const closeMenu = () => setMobileOpen(false);

  const handleLogout = () => {
    logout();
    closeMenu();
    navigate("/");
  };

  const linkClass = ({ isActive }) =>
    `rounded-lg px-3 py-2 text-sm font-semibold transition ${isActive ? "text-amber-900" : "text-stone-700 hover:text-amber-900"}`;

  return (
    <header className="sticky top-0 z-50 border-b border-stone-200 bg-[#fffdf8]/95 backdrop-blur">
      <nav className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-7 lg:px-10" aria-label="Main navigation">
        <Link className="flex items-center gap-3" to="/" onClick={closeMenu}>
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-900 text-lg font-bold text-white" aria-hidden="true">R</span>
          <span className="leading-tight">
            <span className="block text-sm font-extrabold tracking-wide text-stone-900">RUVASGOD</span>
            <span className="block text-[10px] font-semibold tracking-[0.16em] text-amber-900">REAL ESTATE</span>
          </span>
        </Link>

        <div className="hidden items-center gap-2 md:flex">
          <NavLink className={linkClass} to="/">{t("home")}</NavLink>
          <NavLink className={linkClass} to="/properties">{t("properties")}</NavLink>
          {canAccessStaff && <Link className={linkClass({ isActive: false })} to="/staff/dashboard">{t("staffPortal")}</Link>}
          {user?.role === "customer" && <Link className={linkClass({ isActive: false })} to="/account">{t("myAccount")}</Link>}
          <LanguageSelect />
          {user ? (
            <div className="ms-2 flex items-center gap-3 border-s border-stone-200 ps-4">
              <span className="max-w-36 truncate text-xs font-medium text-stone-700">{user.name}</span>
              <button className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-stone-300 px-3 text-xs font-semibold text-stone-700 hover:bg-stone-100" onClick={handleLogout} type="button">
                <FiLogOut aria-hidden="true" /> {t("signOut")}
              </button>
            </div>
          ) : (
            <>
              <Link className={linkClass({ isActive: false })} to="/login">{t("signIn")}</Link>
              <Link className="button-primary rounded-lg px-4 py-2.5 text-sm font-bold" to="/register">{t("createAccount")}</Link>
            </>
          )}
        </div>

        <button className="flex h-11 w-11 items-center justify-center rounded-lg border border-stone-300 text-stone-800 md:hidden" type="button" aria-label={mobileOpen ? "Close menu" : "Open menu"} aria-expanded={mobileOpen} onClick={() => setMobileOpen((open) => !open)}>
          {mobileOpen ? <FiX size={20} /> : <FiMenu size={20} />}
        </button>
      </nav>

      {mobileOpen && (
        <div className="border-t border-stone-200 bg-[#fffdf8] p-4 md:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-1">
            <NavLink className={linkClass} onClick={closeMenu} to="/">{t("home")}</NavLink>
            <NavLink className={linkClass} onClick={closeMenu} to="/properties">{t("properties")}</NavLink>
            {canAccessStaff && <Link className={linkClass({ isActive: false })} onClick={closeMenu} to="/staff/dashboard">{t("staffPortal")}</Link>}
            {user?.role === "customer" && <Link className={linkClass({ isActive: false })} onClick={closeMenu} to="/account">{t("myAccount")}</Link>}
            <div className="my-2 flex flex-wrap items-center justify-between gap-3 border-y border-stone-200 py-3">
              <LanguageSelect />
              {user && <span className="max-w-40 truncate text-xs text-stone-600">{user.name}</span>}
            </div>
            {user ? (
              <button className="flex min-h-11 items-center gap-2 rounded-lg px-3 text-start text-sm font-semibold text-stone-700 hover:bg-stone-100" onClick={handleLogout} type="button"><FiLogOut aria-hidden="true" /> {t("signOut")}</button>
            ) : (
              <>
                <Link className={linkClass({ isActive: false })} onClick={closeMenu} to="/login">{t("signIn")}</Link>
                <Link className="button-primary mt-2 rounded-lg px-4 py-3 text-center text-sm font-bold" onClick={closeMenu} to="/register">{t("createAccount")}</Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

export default Navbar;
