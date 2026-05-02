import { Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { deleteAppointment, getMyAppointments } from "../api/appointmentApi";
import { getErrorMessage } from "../api/axiosClient";
import { Button } from "../components/Button";
import { Notice } from "../components/Notice";
import { StatusBadge } from "../components/StatusBadge";
import type { Appointment } from "../types/appointment";

export function MyAppointmentsPage() {
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

  return (
    <div>
      <div className="page-heading">
        <h1>Randevularim</h1>
        <p>Kendi randevularini takip et.</p>
      </div>

      {error && <Notice type="error">{error}</Notice>}
      {message && <Notice type="success">{message}</Notice>}

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Berber</th>
              <th>Tarih</th>
              <th>Saat</th>
              <th>Durum</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((appointment) => (
              <tr key={appointment.id}>
                <td>{appointment.barberFullName}</td>
                <td>{new Date(appointment.appointmentDate).toLocaleDateString("tr-TR")}</td>
                <td>{appointment.appointmentTime}</td>
                <td><StatusBadge status={appointment.status} /></td>
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
