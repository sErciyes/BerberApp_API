import { axiosClient } from "./axiosClient";
import type { ApiResponse } from "../types/apiResponse";
import type { Appointment, AppointmentStatus, CreateAppointmentRequest } from "../types/appointment";

export async function getMyAppointments() {
  const response = await axiosClient.get<ApiResponse<Appointment[]>>("/appointments/my");
  return response.data;
}

export async function getAvailableSlots(barberId: number, date: string) {
  const response = await axiosClient.get<ApiResponse<string[]>>("/appointments/available-slots", {
    params: { barberId, date }
  });
  return response.data;
}

export async function getAllAppointments() {
  const response = await axiosClient.get<ApiResponse<Appointment[]>>("/appointments");
  return response.data;
}

export async function createAppointment(payload: CreateAppointmentRequest) {
  const response = await axiosClient.post<ApiResponse<Appointment>>("/appointments", payload);
  return response.data;
}

export async function updateAppointmentStatus(id: number, status: AppointmentStatus) {
  const response = await axiosClient.patch<ApiResponse<Appointment>>(`/appointments/${id}/status`, { status });
  return response.data;
}

export async function deleteAppointment(id: number) {
  await axiosClient.delete(`/appointments/${id}`);
}
