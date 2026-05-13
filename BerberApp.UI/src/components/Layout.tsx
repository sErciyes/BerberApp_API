import { CalendarCheck, LogOut, MapPinned, MessageCircle, Moon, Scissors, Shield, Sun, UserRound } from "lucide-react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { Button } from "./Button";

export function Layout() {
  const navigate = useNavigate();
  const { auth, isAdmin, isBarber, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();

  function handleLogout() {
    signOut();
    navigate("/login");
  }

  function renderUserAvatar() {
    if (auth?.profileImageUrl) {
      return <img className="topbar-avatar-image" src={auth.profileImageUrl} alt={auth.fullName} />;
    }

    return <UserRound size={18} />;
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
          <NavLink to="/shops">
            <MapPinned size={18} />
            Dukkanlar
          </NavLink>
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
              <NavLink to="/messages">
                <MessageCircle size={18} />
                Mesajlar
              </NavLink>
              <NavLink to="/profile">
                <UserRound size={18} />
                Profil
              </NavLink>
            </>
          )}
          {isAdmin && (
            <>
              <NavLink to="/admin">
                <Shield size={18} />
                Admin
              </NavLink>
              <NavLink to="/admin/messages">
                <MessageCircle size={18} />
                Admin Mesaj
              </NavLink>
            </>
          )}
        </nav>

        <div className="sidebar-summary">
          <span>Backend</span>
          <strong>ASP.NET Core API</strong>
          <small>JWT + Role-based auth</small>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div>
            <span className="muted">Workspace</span>
            <strong>Berber Randevu Yonetimi</strong>
          </div>
          {auth ? (
            <div className="user-chip">
              <div className="topbar-avatar">
                {renderUserAvatar()}
              </div>
              <span>{auth.fullName}</span>
              <small>{auth.role}</small>
              <Button variant="ghost" onClick={toggleTheme} title={theme === "dark" ? "Aydinlik mod" : "Karanlik mod"}>
                {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
              </Button>
              <Button variant="ghost" onClick={handleLogout} title="Cikis yap">
                <LogOut size={17} />
              </Button>
            </div>
          ) : (
            <div className="auth-links">
              <Button variant="ghost" onClick={toggleTheme} title={theme === "dark" ? "Aydinlik mod" : "Karanlik mod"}>
                {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
              </Button>
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
