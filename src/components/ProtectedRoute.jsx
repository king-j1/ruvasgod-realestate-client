import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import SessionRestoreNotice from "./SessionRestoreNotice";

function ProtectedRoute({ children, adminOnly = false, roles }) {
  const { user, token, isRestoring, restoreError, retrySessionRestore, logout } = useAuth();

  if (isRestoring) {
    return (
      <main className="flex min-h-[50vh] items-center justify-center bg-[#fffdf8] px-5">
        <p className="text-sm font-medium text-stone-600" role="status">Restoring your secure session…</p>
      </main>
    );
  }

  if (restoreError) {
    return <SessionRestoreNotice message={restoreError} onRetry={retrySessionRestore} onSignOut={logout} />;
  }

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  const allowedRoles = roles || (adminOnly ? ["admin"] : null);
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    const destination = ["admin", "manager", "sales", "rental", "finance"].includes(user.role)
      ? "/staff/dashboard"
      : "/";
    return <Navigate to={destination} replace />;
  }

  return children;
}

export default ProtectedRoute;