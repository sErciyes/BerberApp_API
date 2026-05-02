import { axiosClient } from "./axiosClient";
import type { ApiResponse } from "../types/apiResponse";
import type { User } from "../types/user";

export async function getMe() {
  const response = await axiosClient.get<ApiResponse<User>>("/users/me");
  return response.data;
}

export async function getUsers() {
  const response = await axiosClient.get<ApiResponse<User[]>>("/users");
  return response.data;
}

export async function updateProfile(payload: { fullName: string; email: string }) {
  const response = await axiosClient.put<ApiResponse<User>>("/users/me", payload);
  return response.data;
}

export async function updateUserRole(id: number, role: "User" | "Admin") {
  const response = await axiosClient.patch<ApiResponse<User>>(`/users/${id}/role`, { role });
  return response.data;
}
