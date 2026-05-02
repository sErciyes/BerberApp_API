import type { LoginResponse } from "../types/auth";

const authKey = "berberapp.auth";

export function saveAuth(auth: LoginResponse) {
  localStorage.setItem(authKey, JSON.stringify(auth));
}

export function getAuth(): LoginResponse | null {
  const raw = localStorage.getItem(authKey);

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as LoginResponse;
  } catch {
    clearAuth();
    return null;
  }
}

export function getToken(): string | null {
  return getAuth()?.token ?? null;
}

export function clearAuth() {
  localStorage.removeItem(authKey);
}
