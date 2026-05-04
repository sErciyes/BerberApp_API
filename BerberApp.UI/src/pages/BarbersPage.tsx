import { CalendarPlus, MessageCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getBarbers } from "../api/barberApi";
import { getErrorMessage } from "../api/axiosClient";
import { createConversation } from "../api/chatApi";
import { Notice } from "../components/Notice";
import { useAuth } from "../context/AuthContext";
import type { Barber } from "../types/barber";

export function BarbersPage() {
  const { auth } = useAuth();
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [startingChatId, setStartingChatId] = useState<number | null>(null);

  useEffect(() => {
    getBarbers()
      .then((response) => setBarbers(response.data ?? []))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  async function handleStartChat(barberId: number) {
    setStartingChatId(barberId);
    setError("");

    try {
      await createConversation(barberId);
      window.location.href = "/messages";
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setStartingChatId(null);
    }
  }

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
            {auth && (
              <div className="card-actions">
                <Link to="/appointments/new" className="btn btn-secondary">Sec</Link>
                <button className="btn btn-ghost" type="button" onClick={() => handleStartChat(barber.id)} disabled={startingChatId === barber.id}>
                  <MessageCircle size={17} />
                </button>
              </div>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}
