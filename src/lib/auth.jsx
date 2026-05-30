import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api, tokenStore } from "./api";

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [username, setUsername] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const token = tokenStore.get();
    if (!token) { setChecking(false); return; }
    api
      .me()
      .then((res) => setUsername(res?.admin?.username || "admin"))
      .catch(() => { tokenStore.clear(); setUsername(null); })
      .finally(() => setChecking(false));
  }, []);

  const login = useCallback(async (u, p) => {
    const res = await api.login(u, p);
    tokenStore.set(res.token);
    setUsername(res.username);
    return res;
  }, []);

  const logout = useCallback(() => {
    tokenStore.clear();
    setUsername(null);
  }, []);

  return (
    <AuthCtx.Provider value={{ username, isAuthed: !!username, checking, login, logout }}>
      {children}
    </AuthCtx.Provider>
  );
}

export const useAuth = () => useContext(AuthCtx);

/* ---------------- Toast ---------------- */
const ToastCtx = createContext(null);

export function ToastProvider({ children }) {
  const [msg, setMsg] = useState(null);
  const show = useCallback((m) => {
    setMsg(m);
    window.clearTimeout(show._t);
    show._t = window.setTimeout(() => setMsg(null), 2200);
  }, []);
  return (
    <ToastCtx.Provider value={show}>
      {children}
      {msg && <div className="toast">{msg}</div>}
    </ToastCtx.Provider>
  );
}

export const useToast = () => useContext(ToastCtx);
