import { Compass, Navigation, Plus } from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { getBarbersByShopId } from "../api/barberApi";
import { getErrorMessage } from "../api/axiosClient";
import { getNearbyShops, getShops } from "../api/shopApi";
import { Button } from "../components/Button";
import { Notice } from "../components/Notice";
import type { Barber } from "../types/barber";
import type { Shop } from "../types/shop";

type Position = {
  lat: number;
  lng: number;
};

const DEFAULT_CENTER: Position = {
  lat: 41.015,
  lng: 28.979
};

export function ShopsPage() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [locating, setLocating] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [locationLabel, setLocationLabel] = useState("Tüm dükkanlar");
  const [position, setPosition] = useState<Position | null>(null);

  const mapElementRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const routeLineRef = useRef<L.Polyline | null>(null);

  const userIcon = L.divIcon({
    className: "user-location",
    html: `
      <div class="user-pin">
        <div class="user-pin-head"></div>
        <div class="user-pin-tail"></div>
      </div>
    `,
    iconSize: [28, 36],
    iconAnchor: [14, 34],
    popupAnchor: [0, -28]
  });

  const shopIcon = L.divIcon({
    className: "shop-location",
    html: `
      <div class="shop-pin">
        <div class="shop-pin-head">
          <span class="shop-pin-glyph">✂</span>
        </div>
        <div class="shop-pin-tail"></div>
      </div>
    `,
    iconSize: [30, 38],
    iconAnchor: [15, 36],
    popupAnchor: [0, -30]
  });

  useEffect(() => {
    if (!mapElementRef.current || mapRef.current) {
      return;
    }

    mapRef.current = L.map(mapElementRef.current, {
      center: [DEFAULT_CENTER.lat, DEFAULT_CENTER.lng],
      zoom: 11,
      zoomControl: false
    });

    L.control.zoom({ position: "bottomright" }).addTo(mapRef.current);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap"
    }).addTo(mapRef.current);

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

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

  useEffect(() => {
    const map = mapRef.current;

    if (!map) {
      return;
    }

    markersRef.current.forEach((marker) => marker.remove());

    markersRef.current = shops.map((shop) => {
      const marker = L.marker([shop.latitude, shop.longitude], {
        icon: shopIcon
      })
        .addTo(map)
        .bindPopup(`<strong>${escapeHtml(shop.name)}</strong>`);

      marker.on("click", () => {
        void openShopModal(shop);
      });

      return marker;
    });

    if (shops.length > 0) {
      const bounds = L.latLngBounds(shops.map((shop) => [shop.latitude, shop.longitude] as [number, number]));
      map.fitBounds(bounds, { padding: [42, 42], maxZoom: 13 });
    } else {
      map.setView([DEFAULT_CENTER.lat, DEFAULT_CENTER.lng], 11);
    }
  }, [shops]);

  useEffect(() => {
    if (!position || !mapRef.current) {
      return;
    }

    if (userMarkerRef.current) {
      userMarkerRef.current.setLatLng([position.lat, position.lng]);
    } else {
      userMarkerRef.current = L.marker([position.lat, position.lng], {
        icon: userIcon,
        zIndexOffset: 1000
      })
        .addTo(mapRef.current)
        .bindPopup("Buradasın");
    }
  }, [position]);

  async function openShopModal(shop: Shop) {
    setSelectedShop(shop);
    setModalOpen(true);
    setError("");

    if (mapRef.current) {
      mapRef.current.flyTo([shop.latitude, shop.longitude], 14, { duration: 0.45 });
    }

    if (position) {
      void drawRoute(position, {
        lat: shop.latitude,
        lng: shop.longitude
      });
    } else if (routeLineRef.current) {
      routeLineRef.current.remove();
      routeLineRef.current = null;
    }

    try {
      const items = await getBarbersByShopId(shop.id);
      setBarbers(items ?? []);
    } catch (err) {
      setBarbers([]);
      setError(getErrorMessage(err));
    }
  }

  async function drawRoute(from: Position, to: Position) {
    if (!mapRef.current) {
      return;
    }

    try {
      const url = `https://router.project-osrm.org/route/v1/driving/${from.lng},${from.lat};${to.lng},${to.lat}?overview=full&geometries=geojson`;
      const response = await fetch(url);

      if (!response.ok) {
        return;
      }

      const data = await response.json();
      const route = data.routes?.[0];

      if (!route) {
        return;
      }

      const coordinates = route.geometry.coordinates.map((coordinate: number[]) => [coordinate[1], coordinate[0]] as [number, number]);

      routeLineRef.current?.remove();
      routeLineRef.current = L.polyline(coordinates, {
        color: "#2f80ed",
        weight: 5,
        opacity: 0.9
      }).addTo(mapRef.current);
    } catch {
      // Route is a nice-to-have; keep the page usable if OSRM is unavailable.
    }
  }

  function handleUseLocation() {
    if (!navigator.geolocation) {
      setError("Tarayıcı konum bilgisini desteklemiyor.");
      return;
    }

    setLocating(true);
    setError("");

    navigator.geolocation.getCurrentPosition(
      async (geoPosition) => {
        const nextPosition = {
          lat: geoPosition.coords.latitude,
          lng: geoPosition.coords.longitude
        };

        setPosition(nextPosition);
        mapRef.current?.flyTo([nextPosition.lat, nextPosition.lng], 13);

        try {
          const response = await getNearbyShops(nextPosition.lat, nextPosition.lng, 25);
          const items = response.data ?? [];

          setShops(items);
          setSelectedShop(items[0] ?? null);
          setLocationLabel("Konumuna göre yakın dükkanlar");

          if (items[0]) {
            void openShopModal(items[0]);
          }
        } catch (err) {
          setError(getErrorMessage(err));
        } finally {
          setLocating(false);
        }
      },
      () => {
        setError("Konum alınamadı. Tüm dükkanlar listelenmeye devam ediyor.");
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  return (
    <div>
      <div className="page-heading row-heading">
        <div>
          <h1>Dükkanlar</h1>
          <p>Harita üzerinden yakın dükkanları keşfet ve berberlerini incele.</p>
        </div>

        <Button onClick={handleUseLocation} disabled={locating}>
          <Navigation size={18} />
          {locating ? "Konum alınıyor" : "Konumuma göre ara"}
        </Button>
      </div>

      {error && <Notice type="error">{error}</Notice>}
      {loading && <Notice>Dükkanlar yükleniyor.</Notice>}

      <div className="shops-shell">
        <aside className="shop-list-panel">
          <div className="panel-title">
            <Compass size={18} />
            <span>{locationLabel}</span>
          </div>

          {shops.length === 0 && !loading && (
            <div className="empty-chat">
              <span>Listelenecek dükkan bulunamadı.</span>
            </div>
          )}

          {shops.map((shop) => (
            <button
              className={selectedShop?.id === shop.id ? "shop-list-item active" : "shop-list-item"}
              key={shop.id}
              type="button"
              onClick={() => {
                void openShopModal(shop);
              }}
            >
              <strong>{shop.name}</strong>
              <span>{shop.district}, {shop.city}</span>
              <small>{shop.barberCount} berber{shop.distanceKm != null ? ` - ${shop.distanceKm} km` : ""}</small>
            </button>
          ))}
        </aside>

        <section className="map-panel">
          <div className="map-canvas real-map" ref={mapElementRef} aria-label="Dükkan haritası" />
        </section>
      </div>

      {modalOpen && selectedShop && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>{selectedShop.name}</h2>
            <p>{selectedShop.address}</p>

            <div className="barber-grid">
              {barbers.length === 0 && <p>Bu dükkana bağlı berber henüz eklenmemiş.</p>}

              {barbers.map((barber) => (
                <div className="barber-card" key={barber.id}>
                  <div>
                    <strong>{barber.fullName}</strong>
                    <p>{barber.specialty || "Genel hizmet"}</p>
                  </div>
                  <Link className="btn btn-secondary" to={`/appointments/new?shopId=${selectedShop.id}&barberId=${barber.id}`}>
                    <Plus size={16} />
                  </Link>
                </div>
              ))}
            </div>

            <button className="btn btn-secondary" onClick={() => setModalOpen(false)} type="button">
              Kapat
            </button>
          </div>
        </div>
      )}
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
