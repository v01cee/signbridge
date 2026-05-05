import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login, getMe } from "../api/auth";
import { useAuthStore } from "../store/authStore";

export function LoginPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const token = await login(email, password);
      const user = await getMe(token);
      setAuth(token, user);
      navigate("/");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Ошибка входа");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.wrap}>
      <div style={styles.card}>
        <h1 style={styles.title}>Вход</h1>
        <form onSubmit={handleSubmit} style={styles.form}>
          <label style={styles.label}>
            Email
            <input
              style={styles.input}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
          </label>
          <label style={styles.label}>
            Пароль
            <input
              style={styles.input}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
          {error && <p style={styles.error}>{error}</p>}
          <button style={styles.btn} type="submit" disabled={loading}>
            {loading ? "Входим..." : "Войти"}
          </button>
        </form>
        <p style={styles.foot}>
          Нет аккаунта?{" "}
          <Link to="/register" style={styles.link}>
            Зарегистрироваться
          </Link>
        </p>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrap: {
    minHeight: "calc(100vh - 64px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  card: {
    background: "var(--bg-card)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius)",
    padding: "40px 36px",
    width: "100%",
    maxWidth: 400,
  },
  title: { fontSize: 24, fontWeight: 700, marginBottom: 28 },
  form: { display: "flex", flexDirection: "column", gap: 20 },
  label: { display: "flex", flexDirection: "column", gap: 6, fontSize: 14, color: "var(--text-muted)" },
  input: {
    background: "var(--bg)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-sm)",
    padding: "10px 14px",
    color: "var(--text)",
    fontSize: 15,
    outline: "none",
  },
  error: { color: "var(--error)", fontSize: 13 },
  btn: {
    background: "var(--accent)",
    color: "#fff",
    border: "none",
    borderRadius: "var(--radius-sm)",
    padding: "12px",
    fontSize: 15,
    fontWeight: 600,
  },
  foot: { marginTop: 20, fontSize: 14, color: "var(--text-muted)", textAlign: "center" },
  link: { color: "var(--accent-light)" },
};
