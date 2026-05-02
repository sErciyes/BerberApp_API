import { useEffect, useState } from "react";
import { getAllAppointments, updateAppointmentStatus } from "../api/appointmentApi";
import { getErrorMessage } from "../api/axiosClient";
import { Notice } from "../components/Notice";
import { StatusBadge } from "../components/StatusBadge";
import type { Appointment, AppointmentStatus } from "../types/appointment";

const statuses: AppointmentStatus[] = ["Pending", "Approved", "Cancelled", "Completed"];

export function AdminAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function loadAppointments() {
    const response = await getAllAppointments();
    setAppointments(response.data ?? []);
  }

  useEffect(() => {
    loadAppointments().catch((err) => setError(getErrorMessage(err)));
  }, []);

  async function handleStatusChange(id: number, status: AppointmentStatus) {
    setError("");
    setMessage("");

    try {
      await updateAppointmentStatus(id, status);
      setMessage("Randevu durumu guncellendi.");
      await loadAppointments();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  return (
    <div>
      <div className="page-heading">
        <h1>Randevu yonetimi</h1>
        <p>Admin tum randevularin durumunu guncelleyebilir.</p>
      </div>

      {error && <Notice type="error">{error}</Notice>}
      {message && <Notice type="success">{message}</Notice>}

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Kullanici</th>
              <th>Berber</th>
              <th>Tarih</th>
              <th>Saat</th>
              <th>Durum</th>
              <th>Guncelle</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((appointment) => (
              <tr key={appointment.id}>
                <td>{appointment.userFullName}</td>
                <td>{appointment.barberFullName}</td>
                <td>{new Date(appointment.appointmentDate).toLocaleDateString("tr-TR")}</td>
                <td>{appointment.appointmentTime}</td>
                <td><StatusBadge status={appointment.status} /></td>
                <td>
                  <select value={appointment.status} onChange={(e) => handleStatusChange(appointment.id, e.target.value as AppointmentStatus)}>
                    {statuses.map((status) => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
