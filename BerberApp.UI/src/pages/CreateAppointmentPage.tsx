import { useEffect, useState } from "react";
import { createAppointment } from "../api/appointmentApi";
import { getErrorMessage } from "../api/axiosClient";
import { getBarbers } from "../api/barberApi";
import { Button } from "../components/Button";
import { FormField } from "../components/FormField";
import { Notice } from "../components/Notice";
import type { Barber } from "../types/barber";

export function CreateAppointmentPage() {
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [barberId, setBarberId] = useState("");
  const [appointmentDate, setAppointmentDate] = useState("");
  const [appointmentTime, setAppointmentTime] = useState("09:00");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    getBarbers()
      .then((response) => {
        const items = response.data ?? [];
        setBarbers(items);
        setBarberId(items[0]?.id.toString() ?? "");
      })
      .catch((err) => setError(getErrorMessage(err)));
  }, []);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setMessage("");

    try {
      await createAppointment({
        barberId: Number(barberId),
        appointmentDate,
        appointmentTime
      });
      setMessage("Randevu olusturuldu.");
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  return (
    <div className="narrow-page">
      <div className="page-heading">
        <h1>Yeni randevu</h1>
        <p>Randevular 09:00-17:30 arasinda, 30 dakikalik slotlarla olusturulur.</p>
      </div>

      <form className="form-panel" onSubmit={handleSubmit}>
        {error && <Notice type="error">{error}</Notice>}
        {message && <Notice type="success">{message}</Notice>}

        <label className="field">
          <span>Berber</span>
          <select value={barberId} onChange={(e) => setBarberId(e.target.value)} required>
            {barbers.map((barber) => (
              <option key={barber.id} value={barber.id}>
                {barber.fullName} - {barber.specialty || "Genel hizmet"}
              </option>
            ))}
          </select>
        </label>

        <FormField label="Tarih" type="date" value={appointmentDate} onChange={(e) => setAppointmentDate(e.target.value)} required />
        <FormField label="Saat" type="time" step={1800} min="09:00" max="17:30" value={appointmentTime} onChange={(e) => setAppointmentTime(e.target.value)} required />
        <Button type="submit">Randevu olustur</Button>
      </form>
    </div>
  );
}
