import type { AppointmentStatus } from "../types/appointment";

export function StatusBadge({ status }: { status: AppointmentStatus }) {
  return <span className={`status status-${status.toLowerCase()}`}>{status}</span>;
}
