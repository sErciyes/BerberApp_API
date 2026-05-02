import { axiosClient } from "./axiosClient";
import type { ApiResponse } from "../types/apiResponse";
import type { LoginRequest, LoginResponse, RegisterRequest } from "../types/auth";

export async function login(payload: LoginRequest) {
  const response = await axiosClient.post<ApiResponse<LoginResponse>>("/auth/login", payload);
  return response.data;
}

export async function register(payload: RegisterRequest) {
  const response = await axiosClient.post<ApiResponse<string>>("/auth/register", payload);
  return response.data;
}
