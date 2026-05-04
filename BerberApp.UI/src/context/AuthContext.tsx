import { createContext, useContext, useMemo, useState } from "react";
import type { LoginResponse } from "../types/auth";
import { clearAuth, getAuth, saveAuth } from "../utils/tokenStorage";

type AuthContextValue = {
  auth: LoginResponse | null;
  isAdmin: boolean;
  isBarber: boolean;
  signIn: (auth: LoginResponse) => void;
  updateAuth: (changes: Partial<LoginResponse>) => void;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [auth, setAuth] = useState<LoginResponse | null>(() => getAuth());

  const value = useMemo<AuthContextValue>(() => {
    return {
      auth,
      isAdmin: auth?.role === "Admin",
      isBarber: auth?.role === "Barber",
      signIn: (nextAuth) => {
        saveAuth(nextAuth);
        setAuth(nextAuth);
      },
      updateAuth: (changes) => {
        setAuth((current) => {
          if (!current) {
            return current;
          }

          const nextAuth = { ...current, ...changes };
          saveAuth(nextAuth);
          return nextAuth;
        });
      },
      signOut: () => {
        clearAuth();
        setAuth(null);
      }
    };
  }, [auth]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth AuthProvider icinde kullanilmalidir.");
  }

  return context;
}
