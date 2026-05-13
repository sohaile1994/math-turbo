import { createContext, useContext, useState, useEffect } from "react";
import { getSession, saveSession, clearSession } from "../lib/auth";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser]           = useState(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    const session = getSession();
    if (session) setUser(session);
    setAuthReady(true);
  }, []);

  const loginUser = (userData) => {
    saveSession(userData);
    setUser(userData);
  };

  const logoutUser = () => {
    clearSession();
    setUser(null);
  };

  const patchUser = (updates) => {
    const updated = { ...user, ...updates };
    saveSession(updated);
    setUser(updated);
  };

  const isTeacher = user?.role === "teacher";
  const isAdmin   = user?.role === "admin";

  return (
    <AuthContext.Provider value={{ user, authReady, loginUser, logoutUser, patchUser, isTeacher, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
