import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ALL_STAFF_ROLES = [
  "admin",
  "manager",
  "sales",
  "rental",
  "finance",
  "vehicle_manager",
];

function StaffRoute({ children, roles }) {
  const { user, token } = useAuth();

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  const allowedRoles = roles || ALL_STAFF_ROLES;

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default StaffRoute;
