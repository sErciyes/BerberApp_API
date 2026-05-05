import { Compass, ExternalLink, MapPin, Navigation, Store } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { getNearbyShops, getShops } from "../api/shopApi";
import { getErrorMessage } from "../api/axiosClient";
import { Button } from "../components/Button";
import { Notice } from "../components/Notice";
import type { Shop } from "../types/shop";

type MarkerPosition = {
  left: number;
  top: number;
};

export function ShopsPage() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [locating, setLocating] = useState(false);
  const [locationLabel, setLocationLabel] = useState("Tum dukkanlar");

  useEffect(() => {
    getShops()
      .then((response) => {
        const items = response.data ?? [];
        setShops(items);
        setSelectedShop(items[0] ?? null);
      })
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  async function handleUseLocation() {
    if (!navigator.geolocation) {
      setError("Tarayici konum bilgisini desteklemiyor.");
      return;
    }

    setLocating(true);
    setError("");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const response = await getNearbyShops(position.coords.latitude, position.coords.longitude, 25);
          const items = response.data ?? [];
          setShops(items);
          setSelectedShop(items[0] ?? null);
          setLocationLabel("Konumuna gore yakin dukkanlar");
        } catch (err) {
          setError(getErrorMessage(err));
        } finally {
          setLocating(false);
        }
      },
      () => {
        setError("Konum izni alinamadi. Dukkanlar tum liste olarak gosteriliyor.");
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  const markerPositions = useMemo(() => {
    return createMarkerPositions(shops);
  }, [shops]);

  return (
    <div>
      <div className="page-heading row-heading">
        <div>
          <h1>Dukkanlar</h1>
          <p>Harita uzerinden yakin dukkanlari kesfet ve berberlerini incele.</p>
        </div>
        <Button onClick={handleUseLocation} disabled={locating}>
          <Navigation size={18} />
          {locating ? "Konum aliniyor" : "Konumuma gore ara"}
        </Button>
      </div>

      {error && <Notice type="error">{error}</Notice>}
      {loading && <Notice>Dukkanlar yukleniyor.</Notice>}

      <div className="shops-shell">
        <aside className="shop-list-panel">
          <div className="panel-title">
            <Compass size={18} />
            <span>{locationLabel}</span>
          </div>

          {shops.length === 0 && (
            <div className="empty-chat">
              <Store size={26} />
              <span>Henuz dukkan kaydi yok.</span>
            </div>
          )}

          {shops.map((shop) => (
            <button
              className={selectedShop?.id === shop.id ? "shop-list-item active" : "shop-list-item"}
              key={shop.id}
              type="button"
              onClick={() => setSelectedShop(shop)}
            >
              <strong>{shop.name}</strong>
              <span>{shop.district}, {shop.city}</span>
              <small>{shop.barberCount} berber {shop.distanceKm != null ? `- ${shop.distanceKm} km` : ""}</small>
            </button>
          ))}
        </aside>

        <section className="map-panel">
          <div className="map-canvas" aria-label="Dukkan haritasi">
            <div className="map-grid" />
            {shops.map((shop) => {
              const position = markerPositions.get(shop.id) ?? { left: 50, top: 50 };

              return (
                <button
                  className={selectedShop?.id === shop.id ? "map-marker active" : "map-marker"}
                  key={shop.id}
                  style={{ left: `${position.left}%`, top: `${position.top}%` }}
                  type="button"
                  title={shop.name}
                  onClick={() => setSelectedShop(shop)}
                >
                  <MapPin size={20} />
                </button>
              );
            })}
          </div>

          {selectedShop && (
            <article className="shop-detail-card">
              <div>
                <span className="muted">Secili dukkan</span>
                <h2>{selectedShop.name}</h2>
                <p>{selectedShop.address}</p>
              </div>
              <div className="shop-meta">
                <span>{selectedShop.district}, {selectedShop.city}</span>
                <span>{selectedShop.barberCount} berber</span>
                {selectedShop.distanceKm != null && <span>{selectedShop.distanceKm} km uzaklikta</span>}
              </div>
              <a
                className="btn btn-secondary"
                href={`https://www.openstreetmap.org/?mlat=${selectedShop.latitude}&mlon=${selectedShop.longitude}#map=17/${selectedShop.latitude}/${selectedShop.longitude}`}
                target="_blank"
                rel="noreferrer"
              >
                <ExternalLink size={17} />
                Haritada ac
              </a>
            </article>
          )}
        </section>
      </div>
    </div>
  );
}

function createMarkerPositions(shops: Shop[]) {
  const positions = new Map<number, MarkerPosition>();

  if (shops.length === 0) {
    return positions;
  }

  const latitudes = shops.map((shop) => shop.latitude);
  const longitudes = shops.map((shop) => shop.longitude);
  const minLatitude = Math.min(...latitudes);
  const maxLatitude = Math.max(...latitudes);
  const minLongitude = Math.min(...longitudes);
  const maxLongitude = Math.max(...longitudes);
  const latitudeRange = maxLatitude - minLatitude || 1;
  const longitudeRange = maxLongitude - minLongitude || 1;

  for (const shop of shops) {
    positions.set(shop.id, {
      left: 8 + ((shop.longitude - minLongitude) / longitudeRange) * 84,
      top: 92 - ((shop.latitude - minLatitude) / latitudeRange) * 84
    });
  }

  return positions;
}
