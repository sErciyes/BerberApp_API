import { Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { deleteAppointment, getMyAppointments } from "../api/appointmentApi";
import { getErrorMessage } from "../api/axiosClient";
import { Button } from "../components/Button";
import { Notice } from "../components/Notice";
import { StatusBadge } from "../components/StatusBadge";
import { useAuth } from "../context/AuthContext";
import type { Appointment } from "../types/appointment";

export function MyAppointmentsPage() {
  const { isBarber } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function loadAppointments() {
    const response = await getMyAppointments();
    setAppointments(response.data ?? []);
  }

  useEffect(() => {
    loadAppointments().catch((err) => setError(getErrorMessage(err)));
  }, []);

  async function handleDelete(id: number) {
    setError("");
    setMessage("");

    try {
      await deleteAppointment(id);
      setMessage("Randevu silindi.");
      await loadAppointments();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  const todayKey = new Date().toLocaleDateString("en-CA");
  const todayAppointments = useMemo(
    () =>
      appointments.filter(
        (appointment) =>
          new Date(appointment.appointmentDate).toLocaleDateString("en-CA") === todayKey
      ),
    [appointments, todayKey]
  );
  const futureAppointments = useMemo(
    () =>
      appointments.filter(
        (appointment) =>
          new Date(appointment.appointmentDate).toLocaleDateString("en-CA") > todayKey
      ),
    [appointments, todayKey]
  );
  const pendingCount = useMemo(
    () => appointments.filter((appointment) => appointment.status === "Pending").length,
    [appointments]
  );

  return (
    <div className="center-page">
      <div className="page-heading">
        <h1>{isBarber ? "Randevu Takvimi" : "Randevularım"}</h1>
        <p>
          {isBarber
            ? "Bugün hangi müşterilerin geleceğini ve tüm randevu akışını buradan takip et."
            : "Kendi randevularını takip et."}
        </p>
      </div>

      <div className="account-summary">
        <div className="summary-card">
          <span>{isBarber ? "Bugünkü müşteri" : "Bugünkü randevu"}</span>
          <strong>{todayAppointments.length}</strong>
        </div>
        <div className="summary-card">
          <span>Bekleyen</span>
          <strong>{pendingCount}</strong>
        </div>
        <div className="summary-card">
          <span>Toplam</span>
          <strong>{appointments.length}</strong>
        </div>
      </div>

      {error && <Notice type="error">{error}</Notice>}
      {message && <Notice type="success">{message}</Notice>}

      {appointments.length === 0 ? (
        <Notice>{isBarber ? "Henüz sana ait randevu bulunmuyor." : "Henüz randevun bulunmuyor."}</Notice>
      ) : isBarber ? (
        <div className="account-shell">
          <div className="form-panel">
            <div className="section-heading">
              <h2>Bugün Saat Saat</h2>
              <p>Günü gelen müşteriler burada saat sırasıyla yukarı çıkar.</p>
            </div>

            {todayAppointments.length === 0 ? (
              <Notice>Bugün için planlanmış randevu yok.</Notice>
            ) : (
              <div className="detail-list">
                {todayAppointments.map((appointment) => (
                  <div key={appointment.id}>
                    <div>
                      <strong>{appointment.appointmentTime}</strong>
                      <span>{appointment.userFullName}</span>
                    </div>
                    <div>
                      <strong>{appointment.barberSpecialty || "Genel hizmet"}</strong>
                      <StatusBadge status={appointment.status} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="form-panel">
            <div className="section-heading">
              <h2>İleri Tarihli Randevular</h2>
              <p>Bugün olmayanlar aşağıda tablo halinde kalır.</p>
            </div>

            {futureAppointments.length === 0 ? (
              <Notice>İleri tarihli randevu bulunmuyor.</Notice>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Müşteri</th>
                      <th>Hizmet</th>
                      <th>Tarih</th>
                      <th>Saat</th>
                      <th>Durum</th>
                    </tr>
                  </thead>
                  <tbody>
                    {futureAppointments.map((appointment) => (
                      <tr key={appointment.id}>
                        <td>{appointment.userFullName}</td>
                        <td>{appointment.barberSpecialty || "Genel hizmet"}</td>
                        <td>{new Date(appointment.appointmentDate).toLocaleDateString("tr-TR")}</td>
                        <td>{appointment.appointmentTime}</td>
                        <td><StatusBadge status={appointment.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>{isBarber ? "Müşteri" : "Berber"}</th>
                {isBarber && <th>Hizmet</th>}
                <th>Tarih</th>
                <th>Saat</th>
                <th>Durum</th>
                {!isBarber && <th></th>}
              </tr>
            </thead>
            <tbody>
              {appointments.map((appointment) => (
                <tr key={appointment.id}>
                  <td>{isBarber ? appointment.userFullName : appointment.barberFullName}</td>
                  {isBarber && <td>{appointment.barberSpecialty || "Genel hizmet"}</td>}
                  <td>{new Date(appointment.appointmentDate).toLocaleDateString("tr-TR")}</td>
                  <td>{appointment.appointmentTime}</td>
                  <td><StatusBadge status={appointment.status} /></td>
                  {!isBarber && (
                    <td className="actions-cell">
                      <Button
                        variant="danger"
                        disabled={appointment.status !== "Pending"}
                        onClick={() => handleDelete(appointment.id)}
                        title="Randevuyu sil"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
