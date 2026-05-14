import axios from "axios";
import type { ApiResponse } from "../types/apiResponse";
import { getToken } from "../utils/tokenStorage";

const baseURL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5159/api";

export const axiosClient = axios.create({
  baseURL
});

axiosClient.interceptors.request.use((config) => {
  const token = getToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export function getErrorMessage(error: unknown) {
  if (axios.isAxiosError<ApiResponse<unknown>>(error)) {
    const response = error.response?.data;

    if (response?.errors?.length) {
      return response.errors.join(" ");
    }

    if (response?.message) {
      return response.message;
    }
  }

  return "Beklenmeyen bir hata oluştu.";
}
