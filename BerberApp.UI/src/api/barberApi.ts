import { axiosClient } from "./axiosClient";
import type { ApiResponse } from "../types/apiResponse";
import type { Barber, BarberRequest } from "../types/barber";

export async function getBarbers() {
  const response = await axiosClient.get<ApiResponse<Barber[]>>(
    "/barbers"
  );

  return response.data;
}

export async function getBarbersByShopId(shopId: number) {
  const response = await axiosClient.get<ApiResponse<Barber[]>>(
    `/shops/${shopId}/barbers`
  );

  return response.data.data;
}

export async function createBarber(payload: BarberRequest) {
  const response = await axiosClient.post<ApiResponse<Barber>>(
    "/barbers",
    payload
  );

  return response.data;
}

export async function updateBarber(id: number, payload: BarberRequest) {
  const response = await axiosClient.put<ApiResponse<Barber>>(
    `/barbers/${id}`,
    payload
  );

  return response.data;
}

export async function deleteBarber(id: number) {
  await axiosClient.delete(`/barbers/${id}`);
}