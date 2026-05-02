import { createContext, useContext, useMemo, useState } from "react";
import type { LoginResponse } from "../types/auth";
import { clearAuth, getAuth, saveAuth } from "../utils/tokenStorage";

type AuthContextValue = {
  auth: LoginResponse | null;
  isAdmin: boolean;
  signIn: (auth: LoginResponse) => void;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [auth, setAuth] = useState<LoginResponse | null>(() => getAuth());

  const value = useMemo<AuthContextValue>(() => {
    return {
      auth,
      isAdmin: auth?.role === "Admin",
      signIn: (nextAuth) => {
        saveAuth(nextAuth);
        setAuth(nextAuth);
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
