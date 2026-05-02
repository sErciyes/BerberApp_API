import { CalendarCheck, LogOut, Scissors, Shield, UserRound } from "lucide-react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Button } from "./Button";

export function Layout() {
  const navigate = useNavigate();
  const { auth, isAdmin, signOut } = useAuth();

  function handleLogout() {
    signOut();
    navigate("/login");
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">B</div>
          <div>
            <strong>BerberApp</strong>
            <span>Randevu paneli</span>
          </div>
        </div>

        <nav className="nav">
          <NavLink to="/barbers">
            <Scissors size={18} />
            Berberler
          </NavLink>
          {auth && (
            <>
              <NavLink to="/appointments/my">
                <CalendarCheck size={18} />
                Randevularim
              </NavLink>
              <NavLink to="/profile">
                <UserRound size={18} />
                Profil
              </NavLink>
            </>
          )}
          {isAdmin && (
            <NavLink to="/admin">
              <Shield size={18} />
              Admin
            </NavLink>
          )}
        </nav>
      </aside>

      <main className="main">
        <header className="topbar">
          <div>
            <span className="muted">API</span>
            <strong>http://localhost:5159/api</strong>
          </div>
          {auth ? (
            <div className="user-chip">
              <span>{auth.fullName}</span>
              <small>{auth.role}</small>
              <Button variant="ghost" onClick={handleLogout} title="Cikis yap">
                <LogOut size={17} />
              </Button>
            </div>
          ) : (
            <div className="auth-links">
              <NavLink to="/login">Login</NavLink>
              <NavLink to="/register">Register</NavLink>
            </div>
          )}
        </header>

        <section className="content">
          <Outlet />
        </section>
      </main>
    </div>
  );
}
