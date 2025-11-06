// frontend/src/components/ProtectedRoute.jsx
import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

export default function ProtectedRoute() {
  const { accessToken } = useSelector((s) => s.auth);
  if (!accessToken) return <Navigate to="/login" replace />;
  return <Outlet />;
}
