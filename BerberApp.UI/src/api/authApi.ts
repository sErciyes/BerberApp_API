import { axiosClient } from "./axiosClient";
import type { ApiResponse } from "../types/apiResponse";
import type { AuthActionResponse, LoginRequest, LoginResponse, RegisterRequest } from "../types/auth";

export async function login(payload: LoginRequest) {
  const response = await axiosClient.post<ApiResponse<LoginResponse>>("/auth/login", payload);
  return response.data;
}

export async function register(payload: RegisterRequest) {
  const response = await axiosClient.post<ApiResponse<AuthActionResponse>>("/auth/register", payload);
  return response.data;
}

export async function verifyEmail(payload: { email: string; token: string }) {
  const response = await axiosClient.post<ApiResponse<AuthActionResponse>>("/auth/verify-email", payload);
  return response.data;
}

export async function forgotPassword(payload: { email: string }) {
  const response = await axiosClient.post<ApiResponse<AuthActionResponse>>("/auth/forgot-password", payload);
  return response.data;
}

export async function resetPassword(payload: { email: string; token: string; newPassword: string }) {
  const response = await axiosClient.post<ApiResponse<AuthActionResponse>>("/auth/reset-password", payload);
  return response.data;
}

export async function requestPasswordChange(payload: { currentPassword: string; newPassword: string }) {
  const response = await axiosClient.post<ApiResponse<AuthActionResponse>>("/auth/request-password-change", payload);
  return response.data;
}

export async function confirmPasswordChange(payload: { token: string }) {
  const response = await axiosClient.post<ApiResponse<AuthActionResponse>>("/auth/confirm-password-change", payload);
  return response.data;
}
