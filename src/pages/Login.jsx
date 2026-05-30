import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../lib/auth";
import { Field, ErrorBanner } from "../components/ui";

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await login(username.trim(), password);
      nav("/", { replace: true });
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-wrap">
      <form className="auth-card" onSubmit={submit}>
        <span className="dot" style={{ width: 12, height: 12, background: "#0a0a0a", display: "inline-block" }} />
        <h1>Portfolio Admin</h1>
        <p>Sign in to manage your portfolio content.</p>

        <ErrorBanner>{error}</ErrorBanner>

        <Field label="Username">
          <input type="text" autoFocus value={username}
            onChange={(e) => setUsername(e.target.value)} autoComplete="username" />
        </Field>
        <Field label="Password">
          <input type="password" value={password}
            onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
        </Field>

        <button className="btn primary full" type="submit" disabled={busy || !username || !password}>
          {busy ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}
