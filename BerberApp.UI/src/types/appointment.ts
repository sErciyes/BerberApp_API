export type AppointmentStatus = "Pending" | "Approved" | "Cancelled" | "Completed";

export type Appointment = {
  id: number;
  userId: number;
  userFullName: string;
  barberId: number;
  barberFullName: string;
  barberSpecialty: string;
  appointmentDate: string;
  appointmentTime: string;
  status: AppointmentStatus;
};

export type CreateAppointmentRequest = {
  barberId: number;
  appointmentDate: string;
  appointmentTime: string;
};
