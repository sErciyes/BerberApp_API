import { Navigate, Route, Routes } from "react-router-dom";
import { AdminRoute } from "./components/AdminRoute";
import { Layout } from "./components/Layout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AdminAppointmentsPage } from "./pages/AdminAppointmentsPage";
import { AdminBarbersPage } from "./pages/AdminBarbersPage";
import { AdminDashboardPage } from "./pages/AdminDashboardPage";
import { AdminUsersPage } from "./pages/AdminUsersPage";
import { BarbersPage } from "./pages/BarbersPage";
import { CreateAppointmentPage } from "./pages/CreateAppointmentPage";
import { ForgotPasswordPage } from "./pages/ForgotPasswordPage";
import { LoginPage } from "./pages/LoginPage";
import { MyAppointmentsPage } from "./pages/MyAppointmentsPage";
import { ProfilePage } from "./pages/ProfilePage";
import { RegisterPage } from "./pages/RegisterPage";

export function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Navigate to="/barbers" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/barbers" element={<BarbersPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/appointments/my" element={<MyAppointmentsPage />} />
          <Route path="/appointments/new" element={<CreateAppointmentPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>

        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/admin/barbers" element={<AdminBarbersPage />} />
          <Route path="/admin/users" element={<AdminUsersPage />} />
          <Route path="/admin/appointments" element={<AdminAppointmentsPage />} />
        </Route>
      </Route>
    </Routes>
  );
}
