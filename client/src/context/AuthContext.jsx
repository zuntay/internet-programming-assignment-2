import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getCurrentUser, loginUser, registerUser } from "../api/api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("accessToken"));
  const [user, setUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(Boolean(token));

  useEffect(() => {
    async function loadUser() {
      if (!token) {
        setUser(null);
        setLoadingAuth(false);
        return;
      }

      try {
        const currentUser = await getCurrentUser(token);
        setUser(currentUser);
      } catch {
        localStorage.removeItem("accessToken");
        setToken(null);
        setUser(null);
      } finally {
        setLoadingAuth(false);
      }
    }

    loadUser();
  }, [token]);

  async function login(username, password) {
    const data = await loginUser({ username, password });
    localStorage.setItem("accessToken", data.accessToken);
    setToken(data.accessToken);
    setUser(data.user);
    return data.user;
  }

  async function register(username, email, password) {
    const data = await registerUser({ username, email, password });
    localStorage.setItem("accessToken", data.accessToken);
    setToken(data.accessToken);
    setUser(data.user);
    return data.user;
  }

  function logout() {
    localStorage.removeItem("accessToken");
    setToken(null);
    setUser(null);
  }

  const value = useMemo(
    () => ({
      token,
      user,
      loadingAuth,
      isAuthenticated: Boolean(token && user),
      isAdmin: user?.role === "admin",
      login,
      register,
      logout,
    }),
    [token, user, loadingAuth]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}