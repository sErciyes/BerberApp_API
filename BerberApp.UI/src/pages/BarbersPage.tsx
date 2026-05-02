import { CalendarPlus } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getBarbers } from "../api/barberApi";
import { getErrorMessage } from "../api/axiosClient";
import { Notice } from "../components/Notice";
import { useAuth } from "../context/AuthContext";
import type { Barber } from "../types/barber";

export function BarbersPage() {
  const { auth } = useAuth();
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getBarbers()
      .then((response) => setBarbers(response.data ?? []))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="page-heading row-heading">
        <div>
          <h1>Berberler</h1>
          <p>Musait berberleri gor ve randevu olustur.</p>
        </div>
        {auth && (
          <Link className="btn btn-primary" to="/appointments/new">
            <CalendarPlus size={18} />
            Randevu al
          </Link>
        )}
      </div>

      {error && <Notice type="error">{error}</Notice>}
      {loading && <Notice>Berberler yukleniyor.</Notice>}

      <div className="list-grid">
        {barbers.map((barber) => (
          <article className="item-card" key={barber.id}>
            <div>
              <h2>{barber.fullName}</h2>
              <p>{barber.specialty || "Genel hizmet"}</p>
            </div>
            {auth && <Link to="/appointments/new" className="btn btn-secondary">Sec</Link>}
          </article>
        ))}
      </div>
    </div>
  );
}
