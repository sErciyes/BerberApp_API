import { axiosClient } from "./axiosClient";
import type { ApiResponse } from "../types/apiResponse";
import type { Shop, ShopRequest } from "../types/shop";

export async function getShops() {
  const response = await axiosClient.get<ApiResponse<Shop[]>>("/shops");
  return response.data;
}

export async function getNearbyShops(latitude: number, longitude: number, radiusKm = 10) {
  const response = await axiosClient.get<ApiResponse<Shop[]>>("/shops/nearby", {
    params: { latitude, longitude, radiusKm }
  });

  return response.data;
}

export async function createShop(payload: ShopRequest) {
  const response = await axiosClient.post<ApiResponse<Shop>>("/shops", payload);
  return response.data;
}

export async function updateShop(id: number, payload: ShopRequest) {
  const response = await axiosClient.put<ApiResponse<Shop>>(`/shops/${id}`, payload);
  return response.data;
}

export async function deleteShop(id: number) {
  await axiosClient.delete(`/shops/${id}`);
}
