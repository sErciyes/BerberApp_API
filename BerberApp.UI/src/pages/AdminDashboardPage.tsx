import { CalendarClock, Scissors, Users } from "lucide-react";
import { Link } from "react-router-dom";

export function AdminDashboardPage() {
  return (
    <div>
      <div className="page-heading">
        <h1>Admin</h1>
        <p>Berber, kullanıcı ve randevu yönetimi.</p>
      </div>

      <div className="admin-grid">
        <Link to="/admin/barbers" className="admin-tile">
          <Scissors size={24} />
          <strong>Berberler</strong>
          <span>CRUD islemleri</span>
        </Link>
        <Link to="/admin/users" className="admin-tile">
          <Users size={24} />
          <strong>Kullanıcılar</strong>
          <span>Rol yönetimi</span>
        </Link>
        <Link to="/admin/appointments" className="admin-tile">
          <CalendarClock size={24} />
          <strong>Randevular</strong>
          <span>Status güncelleme</span>
        </Link>
      </div>
    </div>
  );
}
