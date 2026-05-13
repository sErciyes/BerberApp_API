import { CalendarPlus, MapPinned, MessageCircle, Scissors } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getBarbersByShopId } from "../api/barberApi";
import { getErrorMessage } from "../api/axiosClient";
import { createConversation } from "../api/chatApi";
import { getShops } from "../api/shopApi";
import { Notice } from "../components/Notice";
import { useAuth } from "../context/AuthContext";
import type { Barber } from "../types/barber";
import type { Shop } from "../types/shop";

function getInitials(fullName: string) {
  return fullName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function getGradient(fullName: string) {
  const gradients = [
    "linear-gradient(135deg, #f59e0b 0%, #ec4899 42%, #4f46e5 100%)",
    "linear-gradient(135deg, #0ea5e9 0%, #2563eb 42%, #7c3aed 100%)",
    "linear-gradient(135deg, #22c55e 0%, #14b8a6 42%, #0ea5e9 100%)",
    "linear-gradient(135deg, #fb7185 0%, #a855f7 42%, #3b82f6 100%)"
  ];
  const hash = fullName.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return gradients[hash % gradients.length];
}

function renderBarberAvatar(barber: Barber) {
  if (barber.profileImageUrl) {
    return <img className="barber-avatar-image" src={barber.profileImageUrl} alt={barber.fullName} />;
  }

  return getInitials(barber.fullName);
}

export function BarbersPage() {
  const { auth } = useAuth();
  const [shops, setShops] = useState<Shop[]>([]);
  const [selectedShopId, setSelectedShopId] = useState("");
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [barbersLoading, setBarbersLoading] = useState(false);
  const [startingChatId, setStartingChatId] = useState<number | null>(null);

  const selectedShop = useMemo(
    () => shops.find((shop) => shop.id === Number(selectedShopId)) ?? null,
    [shops, selectedShopId]
  );

  useEffect(() => {
    getShops()
      .then((response) => {
        const items = response.data ?? [];
        setShops(items);
        setSelectedShopId(items[0]?.id.toString() ?? "");
      })
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedShopId) {
      setBarbers([]);
      return;
    }

    setBarbersLoading(true);
    setError("");

    getBarbersByShopId(Number(selectedShopId))
      .then((items) => setBarbers(items ?? []))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setBarbersLoading(false));
  }, [selectedShopId]);

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
    <div className="center-page">
      <div className="page-heading row-heading">
        <div>
          <h1>Berberler</h1>
          <p>Dukkan secerek o subedeki berberleri daha duzenli ve dogal bir akisla incele.</p>
        </div>
        {auth && (
          <Link className="btn btn-primary" to="/appointments/new">
            <CalendarPlus size={18} />
            Randevu al
          </Link>
        )}
      </div>

      <div className="barber-browser-shell">
        <section className="barber-browser-header">
          <div className="section-heading">
            <h2>Dukkan filtresi</h2>
            <p>Tum sistem yerine secilen dukkandaki berberler gosterilir.</p>
          </div>

          <label className="field barber-shop-filter" htmlFor="barberShopId">
            <span>Dukkan</span>
            <select
              id="barberShopId"
              value={selectedShopId}
              onChange={(event) => setSelectedShopId(event.target.value)}
            >
              {shops.map((shop) => (
                <option key={shop.id} value={shop.id}>
                  {shop.name} - {shop.district}
                </option>
              ))}
            </select>
          </label>
        </section>

        {error && <Notice type="error">{error}</Notice>}
        {loading && <Notice>Dukkanlar yukleniyor.</Notice>}
        {barbersLoading && <Notice>Berberler yukleniyor.</Notice>}

        {selectedShop && (
          <section className="barber-shop-hero">
            <div>
              <span className="muted">Secili dukkan</span>
              <h2>{selectedShop.name}</h2>
              <p>{selectedShop.district}, {selectedShop.city}</p>
            </div>
            <div className="barber-shop-meta">
              <span><MapPinned size={15} /> {selectedShop.address}</span>
              <span><Scissors size={15} /> {barbers.length} berber</span>
            </div>
          </section>
        )}

        <div className="barber-card-grid">
          {barbers.map((barber) => (
            <article className="barber-showcase-card" key={barber.id}>
              <div className="barber-cover" style={{ backgroundImage: getGradient(barber.fullName) }} />

              <div className="barber-avatar-stack">
                <div className="barber-avatar barber-avatar-large">{renderBarberAvatar(barber)}</div>
                <div>
                  <strong>{barber.fullName}</strong>
                  <span>{barber.specialty || "Genel hizmet"}</span>
                </div>
              </div>

              <div className="barber-showcase-body">
                <div className="barber-pill-row">
                  <span className="status-chip success">{barber.shopName || "Dukkan bilgisi yok"}</span>
                  <span className="status-chip warning">{barber.specialty || "Genel hizmet"}</span>
                </div>

                <div className="barber-showcase-copy">
                  <p>Bu berber sadece secili dukkan baglaminda gosterilir ve randevu akisi o sube icin devam eder.</p>
                </div>

                {auth && (
                  <div className="barber-showcase-actions">
                    <Link
                      to={`/appointments/new?shopId=${barber.shopId ?? ""}&barberId=${barber.id}`}
                      className="btn btn-primary"
                    >
                      Randevu al
                    </Link>
                    <button
                      className="btn btn-ghost"
                      type="button"
                      onClick={() => handleStartChat(barber.id)}
                      disabled={startingChatId === barber.id}
                    >
                      <MessageCircle size={17} />
                    </button>
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>

        {!loading && !barbersLoading && barbers.length === 0 && (
          <Notice>Bu dukkana bagli aktif berber bulunmuyor.</Notice>
        )}
      </div>
    </div>
  );
}
