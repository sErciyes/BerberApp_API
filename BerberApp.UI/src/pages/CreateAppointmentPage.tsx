import { CalendarDays, CheckCircle2, Clock3, MapPinned, Scissors } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { createAppointment, getAvailableSlots } from "../api/appointmentApi";
import { getErrorMessage } from "../api/axiosClient";
import { getBarbersByShopId } from "../api/barberApi";
import { getShops } from "../api/shopApi";
import { Button } from "../components/Button";
import { Notice } from "../components/Notice";
import type { Barber } from "../types/barber";
import type { Shop } from "../types/shop";

function formatDateKey(date: Date) {
  return date.toLocaleDateString("en-CA");
}

function getInitials(fullName: string) {
  return fullName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function buildDateOptions() {
  return Array.from({ length: 10 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() + index);

    return {
      key: formatDateKey(date),
      dayLabel: date.toLocaleDateString("tr-TR", { weekday: "short" }),
      dateLabel: date.toLocaleDateString("tr-TR", { day: "2-digit", month: "short" })
    };
  });
}

export function CreateAppointmentPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [shops, setShops] = useState<Shop[]>([]);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [shopId, setShopId] = useState("");
  const [barberId, setBarberId] = useState("");
  const [appointmentDate, setAppointmentDate] = useState(formatDateKey(new Date()));
  const [appointmentTime, setAppointmentTime] = useState("");
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [slotLoading, setSlotLoading] = useState(false);
  const [barbersLoading, setBarbersLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [confirmationOpen, setConfirmationOpen] = useState(false);

  const selectedBarberId = Number(searchParams.get("barberId")) || 0;
  const selectedShopId = Number(searchParams.get("shopId")) || 0;
  const dateOptions = useMemo(() => buildDateOptions(), []);
  const selectedBarber = useMemo(
    () => barbers.find((barber) => barber.id === Number(barberId)) ?? null,
    [barbers, barberId]
  );
  const selectedShop = useMemo(
    () => shops.find((shop) => shop.id === Number(shopId)) ?? null,
    [shops, shopId]
  );

  useEffect(() => {
    getShops()
      .then((response) => {
        const items = response.data ?? [];
        setShops(items);

        if (selectedShopId) {
          setShopId(selectedShopId.toString());
          return;
        }

        if (selectedBarberId) {
          const initialShop = items.find((shop) => shop.id === selectedShopId);
          if (initialShop) {
            setShopId(initialShop.id.toString());
            return;
          }
        }

        setShopId(items[0]?.id.toString() ?? "");
      })
      .catch((err) => setError(getErrorMessage(err)));
  }, []);

  useEffect(() => {
    if (!shopId) {
      setBarbers([]);
      setBarberId("");
      return;
    }

    setBarbersLoading(true);
    setError("");

    getBarbersByShopId(Number(shopId))
      .then((items) => {
        const nextBarbers = items ?? [];
        setBarbers(nextBarbers);

        if (selectedBarberId && nextBarbers.some((barber) => barber.id === selectedBarberId)) {
          setBarberId(selectedBarberId.toString());
        } else {
          setBarberId(nextBarbers[0]?.id.toString() ?? "");
        }
      })
      .catch((err) => {
        setBarbers([]);
        setBarberId("");
        setError(getErrorMessage(err));
      })
      .finally(() => setBarbersLoading(false));
  }, [shopId]);

  useEffect(() => {
    if (!barberId || !appointmentDate) {
      setAvailableSlots([]);
      setAppointmentTime("");
      return;
    }

    setSlotLoading(true);
    getAvailableSlots(Number(barberId), appointmentDate)
      .then((response) => {
        const slots = response.data ?? [];
        setAvailableSlots(slots);
        setAppointmentTime((current) => (current && slots.includes(current) ? current : slots[0] ?? ""));
      })
      .catch((err) => {
        setAvailableSlots([]);
        setAppointmentTime("");
        setError(getErrorMessage(err));
      })
      .finally(() => setSlotLoading(false));
  }, [barberId, appointmentDate]);

  useEffect(() => {
    if (!confirmationOpen) {
      return;
    }

    const timer = window.setTimeout(() => {
      navigate("/appointments/my");
    }, 1800);

    return () => window.clearTimeout(timer);
  }, [confirmationOpen, navigate]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");

    if (!appointmentTime) {
      setError("Lutfen uygun bir saat sec.");
      return;
    }

    try {
      setSubmitting(true);
      await createAppointment({
        barberId: Number(barberId),
        appointmentDate,
        appointmentTime
      });
      setConfirmationOpen(true);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="center-page">
      <div className="page-heading">
        <h1>Yeni randevu</h1>
        <p>Once dukkani sec, sonra o dukkandaki berberlerden biriyle 30 dakikalik uygun bir slot ayarla.</p>
      </div>

      <form className="booking-shell" onSubmit={handleSubmit}>
        <section className="booking-main">
          {error && (
            <Notice type="error" onClose={() => setError("")}>
              {error}
            </Notice>
          )}

          <div className="booking-section">
            <div className="section-heading">
              <h2>Dukkan sec</h2>
              <p>Secilen dukkanin berberleri asagida filtrelenir.</p>
            </div>

            <label className="field booking-shop-field" htmlFor="shopId">
              <span>Dukkanlar</span>
              <select id="shopId" value={shopId} onChange={(event) => setShopId(event.target.value)} required>
                {shops.map((shop) => (
                  <option key={shop.id} value={shop.id}>
                    {shop.name} - {shop.district}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="booking-section">
            <div className="section-heading">
              <h2>Berber sec</h2>
              <p>Sadece secilen dukkandaki berberler gosterilir.</p>
            </div>

            {barbersLoading ? (
              <Notice>Berberler yukleniyor.</Notice>
            ) : barbers.length === 0 ? (
              <Notice type="error">Bu dukkana bagli berber bulunmuyor.</Notice>
            ) : (
              <div className="segmented-control booking-barber-list">
                {barbers.map((barber) => (
                  <button
                    key={barber.id}
                    type="button"
                    className={barberId === barber.id.toString() ? "active" : ""}
                    onClick={() => setBarberId(barber.id.toString())}
                  >
                    <div className="booking-barber-card-head">
                      <div className="booking-barber-avatar">{getInitials(barber.fullName)}</div>
                      <div className="booking-barber-text">
                        <span>{barber.fullName}</span>
                        <small>{barber.specialty || "Genel hizmet"}</small>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="booking-section">
            <div className="section-heading">
              <h2>Tarih sec</h2>
              <p>Yaklasan gunleri kart olarak sec, istersen ileri tarih yaz.</p>
            </div>

            <div className="booking-date-grid">
              {dateOptions.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  className={appointmentDate === item.key ? "booking-date-card active" : "booking-date-card"}
                  onClick={() => setAppointmentDate(item.key)}
                >
                  <strong>{item.dayLabel}</strong>
                  <span>{item.dateLabel}</span>
                </button>
              ))}
            </div>

            <label className="field booking-date-input" htmlFor="appointmentDate">
              <span>Ileri tarih</span>
              <input
                id="appointmentDate"
                type="date"
                min={dateOptions[0]?.key}
                value={appointmentDate}
                onChange={(event) => setAppointmentDate(event.target.value)}
                required
              />
            </label>
          </div>

          <div className="booking-section">
            <div className="section-heading">
              <h2>Saat sec</h2>
              <p>Sadece 30 dakikalik musait slotlar acik gorunur.</p>
            </div>

            {slotLoading ? (
              <Notice>Musait saatler yukleniyor.</Notice>
            ) : availableSlots.length === 0 ? (
              <Notice type="error">Bu tarih icin uygun slot bulunmuyor. Baska bir gun sec.</Notice>
            ) : (
              <div className="booking-slot-grid">
                {availableSlots.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    className={appointmentTime === slot ? "booking-slot active" : "booking-slot"}
                    onClick={() => setAppointmentTime(slot)}
                  >
                    <Clock3 size={16} />
                    {slot}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="booking-actions">
            <Button type="submit" disabled={submitting || !shopId || !barberId || !appointmentDate || !appointmentTime}>
              {submitting ? "Randevu olusturuluyor" : "Randevu olustur"}
            </Button>
          </div>
        </section>

        <aside className="booking-sidebar">
          <div className="booking-preview">
            <div className="section-heading">
              <h2>Randevu Ozeti</h2>
              <p>Kaydetmeden once secimini kontrol et.</p>
            </div>

            <div className="detail-list">
              <div>
                <strong><MapPinned size={16} /> Dukkan</strong>
                <span>{selectedShop?.name || "Secilmedi"}</span>
              </div>
              <div>
                <strong><Scissors size={16} /> Berber</strong>
                <span>{selectedBarber?.fullName ?? "Secilmedi"}</span>
              </div>
              <div>
                <strong>Uzmanlik</strong>
                <span>{selectedBarber?.specialty || "Genel hizmet"}</span>
              </div>
              <div>
                <strong><CalendarDays size={16} /> Tarih</strong>
                <span>{appointmentDate ? new Date(appointmentDate).toLocaleDateString("tr-TR") : "Secilmedi"}</span>
              </div>
              <div>
                <strong><Clock3 size={16} /> Saat</strong>
                <span>{appointmentTime || "Secilmedi"}</span>
              </div>
            </div>
          </div>
        </aside>
      </form>

      {confirmationOpen && (
        <div className="booking-success-overlay">
          <div className="booking-success-card">
            <CheckCircle2 size={46} />
            <h2>Randevun olusturuldu</h2>
            <p>
              {selectedBarber?.fullName || "Secili berber"} icin {appointmentDate ? new Date(appointmentDate).toLocaleDateString("tr-TR") : ""}
              {" "}tarihinde saat {appointmentTime} slotu ayrildi.
            </p>
            <div className="booking-success-actions">
              <Button onClick={() => navigate("/appointments/my")}>Randevularima git</Button>
            </div>
          </div>
        </div>
      )}

      {submitting && !confirmationOpen && (
        <div className="booking-success-overlay">
          <div className="booking-success-card booking-progress-card">
            <Clock3 size={42} />
            <h2>Randevu olusturuluyor</h2>
            <p>Secimin kaydediliyor. Bir iki saniye icinde onay ekrani gorunecek.</p>
          </div>
        </div>
      )}
    </div>
  );
}
