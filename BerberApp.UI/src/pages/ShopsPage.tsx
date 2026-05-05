import { Compass, ExternalLink, MapPin, Navigation, Store } from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useRef, useState } from "react";
import { getNearbyShops, getShops } from "../api/shopApi";
import { getErrorMessage } from "../api/axiosClient";
import { Button } from "../components/Button";
import { Notice } from "../components/Notice";
import type { Shop } from "../types/shop";

export function ShopsPage() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [locating, setLocating] = useState(false);
  const [locationLabel, setLocationLabel] = useState("Tum dukkanlar");
  const mapElementRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

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

  useEffect(() => {
    if (!mapElementRef.current || mapRef.current) {
      return;
    }

    mapRef.current = L.map(mapElementRef.current, {
      center: [41.015, 28.979],
      zoom: 11,
      zoomControl: false
    });

    L.control.zoom({ position: "bottomright" }).addTo(mapRef.current);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(mapRef.current);

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;

    if (!map) {
      return;
    }

    for (const marker of markersRef.current) {
      marker.remove();
    }

    markersRef.current = shops.map((shop) => {
      const marker = L.marker([shop.latitude, shop.longitude], {
        title: shop.name
      })
        .addTo(map)
        .bindPopup(`<strong>${escapeHtml(shop.name)}</strong><br>${escapeHtml(shop.district)}, ${escapeHtml(shop.city)}`);

      marker.on("click", () => setSelectedShop(shop));
      return marker;
    });

    if (shops.length > 0) {
      const bounds = L.latLngBounds(shops.map((shop) => [shop.latitude, shop.longitude]));
      map.fitBounds(bounds, { padding: [42, 42], maxZoom: 14 });
    }
  }, [shops]);

  useEffect(() => {
    if (selectedShop && mapRef.current) {
      mapRef.current.flyTo([selectedShop.latitude, selectedShop.longitude], Math.max(mapRef.current.getZoom(), 13), {
        duration: 0.45
      });
    }
  }, [selectedShop]);

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
          <div className="map-canvas real-map" ref={mapElementRef} aria-label="Dukkan haritasi" />

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

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
