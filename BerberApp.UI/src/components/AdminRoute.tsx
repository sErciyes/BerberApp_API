import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function AdminRoute() {
  const { auth, isAdmin } = useAuth();

  if (!auth) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/barbers" replace />;
  }

  return <Outlet />;
}
