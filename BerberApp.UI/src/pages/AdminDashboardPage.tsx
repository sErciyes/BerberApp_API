import { CalendarClock, Scissors, Users } from "lucide-react";
import { Link } from "react-router-dom";

export function AdminDashboardPage() {
  return (
    <div>
      <div className="page-heading">
        <h1>Admin</h1>
        <p>Berber, kullanici ve randevu yonetimi.</p>
      </div>

      <div className="admin-grid">
        <Link to="/admin/barbers" className="admin-tile">
          <Scissors size={24} />
          <strong>Berberler</strong>
          <span>CRUD islemleri</span>
        </Link>
        <Link to="/admin/users" className="admin-tile">
          <Users size={24} />
          <strong>Kullanicilar</strong>
          <span>Rol yonetimi</span>
        </Link>
        <Link to="/admin/appointments" className="admin-tile">
          <CalendarClock size={24} />
          <strong>Randevular</strong>
          <span>Status guncelleme</span>
        </Link>
      </div>
    </div>
  );
}
