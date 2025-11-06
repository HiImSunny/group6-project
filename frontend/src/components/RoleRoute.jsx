// frontend/src/components/RoleRoute.jsx
import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

export default function RoleRoute({ allow = [] }) {
  const { user } = useSelector(s => s.auth);
  const role = user?.role || "User";
  if (!user || (allow.length && !allow.includes(role))) {
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
}
