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
    const auth = JSON.parse(raw) as LoginResponse;

    if (!auth.token || isTokenExpired(auth.token)) {
      clearAuth();
      return null;
    }

    return auth;
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

export function isTokenExpired(token: string) {
  try {
    const [, payload] = token.split(".");

    if (!payload) {
      return true;
    }

    const decoded = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/"))) as { exp?: number };

    if (!decoded.exp) {
      return true;
    }

    return decoded.exp * 1000 <= Date.now();
  } catch {
    return true;
  }
}
