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
        <h1>{isBarber ? "Randevu Takvimi" : "Randevularim"}</h1>
        <p>
          {isBarber
            ? "Bugun hangi musterilerin gelecegini ve tum randevu akisini buradan takip et."
            : "Kendi randevularini takip et."}
        </p>
      </div>

      <div className="account-summary">
        <div className="summary-card">
          <span>{isBarber ? "Bugunku musteri" : "Bugunku randevu"}</span>
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
        <Notice>{isBarber ? "Henuz sana ait randevu bulunmuyor." : "Henuz randevun bulunmuyor."}</Notice>
      ) : isBarber ? (
        <div className="account-shell">
          <div className="form-panel">
            <div className="section-heading">
              <h2>Bugun Saat Saat</h2>
              <p>Gunu gelen musteriler burada saat sirasiyla yukari cikar.</p>
            </div>

            {todayAppointments.length === 0 ? (
              <Notice>Bugun icin planlanmis randevu yok.</Notice>
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
              <h2>Ileri Tarihli Randevular</h2>
              <p>Bugun olmayanlar asagida tablo halinde kalir.</p>
            </div>

            {futureAppointments.length === 0 ? (
              <Notice>Ileri tarihli randevu bulunmuyor.</Notice>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Musteri</th>
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
                <th>{isBarber ? "Musteri" : "Berber"}</th>
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
