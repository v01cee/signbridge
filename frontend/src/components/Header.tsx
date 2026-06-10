import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { useIsMobile } from "../hooks/useIsMobile";

export function Header() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const isMobile = useIsMobile();
  const [menuOpen, setMenuOpen] = useState(false);

  function handleLogout() {
    logout();
    navigate("/");
    setMenuOpen(false);
  }

  const activeLink = (path: string) =>
    pathname === path ? { ...styles.link, ...styles.linkActive } : styles.link;

  return (
    <header style={styles.header}>
      <div style={{ ...styles.inner, padding: isMobile ? "0 16px" : "0 24px", height: isMobile ? 56 : 64 }}>
        {/* Лого */}
        <Link to="/" style={styles.logo} onClick={() => setMenuOpen(false)}>
          <span style={{ fontSize: isMobile ? 22 : 24 }}>🤟</span>
          {!isMobile && <span style={styles.logoText}>Sign<strong>Bridge</strong></span>}
          {isMobile && <span style={{ ...styles.logoText, fontSize: 17 }}>Sign<strong>Bridge</strong></span>}
        </Link>

        {/* Десктоп навигация */}
        {!isMobile && (
          <nav style={styles.nav}>
            <Link to="/" style={activeLink("/")}>Словарь</Link>
            <Link to="/practice" style={activeLink("/practice")}>🎯 Тренировка</Link>
            {user ? (
              <>
                <Link to="/favorites" style={activeLink("/favorites")}>★ Избранное</Link>
                <Link to="/create" style={activeLink("/create")}>+ Добавить жест</Link>
                <span style={styles.username}>{user.username}</span>
                <button style={styles.logoutBtn} onClick={handleLogout}>Выйти</button>
              </>
            ) : (
              <>
                <Link to="/login" style={activeLink("/login")}>Войти</Link>
                <Link to="/register" style={styles.registerBtn}>Регистрация</Link>
              </>
            )}
          </nav>
        )}

        {/* Мобильная кнопка бургер */}
        {isMobile && (
          <button style={styles.burger} onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? "✕" : "☰"}
          </button>
        )}
      </div>

      {/* Мобильное меню */}
      {isMobile && menuOpen && (
        <div style={styles.mobileMenu}>
          <Link to="/" style={styles.mobileLink} onClick={() => setMenuOpen(false)}>📖 Словарь</Link>
          <Link to="/practice" style={styles.mobileLink} onClick={() => setMenuOpen(false)}>🎯 Тренировка</Link>
          {user ? (
            <>
              <Link to="/favorites" style={styles.mobileLink} onClick={() => setMenuOpen(false)}>★ Избранное</Link>
              <Link to="/create" style={styles.mobileLink} onClick={() => setMenuOpen(false)}>+ Добавить жест</Link>
              <div style={styles.mobileDivider} />
              <span style={styles.mobileUser}>👤 {user.username}</span>
              <button style={styles.mobileLogout} onClick={handleLogout}>Выйти</button>
            </>
          ) : (
            <>
              <Link to="/login" style={styles.mobileLink} onClick={() => setMenuOpen(false)}>Войти</Link>
              <Link to="/register" style={{ ...styles.mobileLink, color: "var(--accent)" }} onClick={() => setMenuOpen(false)}>Регистрация</Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}

const styles: Record<string, React.CSSProperties> = {
  header: {
    background: "#13151f",
    borderBottom: "1px solid var(--border)",
    position: "sticky",
    top: 0,
    zIndex: 100,
  },
  inner: {
    maxWidth: 1200,
    margin: "0 auto",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  logo: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    fontSize: 20,
    color: "var(--text)",
  },
  logoText: { fontWeight: 400, letterSpacing: "-0.3px" },
  nav: { display: "flex", alignItems: "center", gap: 8 },
  link: {
    padding: "6px 16px",
    borderRadius: "var(--radius-sm)",
    fontSize: 14,
    fontWeight: 500,
    color: "var(--text-muted)",
    transition: "color 0.15s, background 0.15s",
  },
  linkActive: {
    color: "var(--text)",
    background: "var(--bg-card)",
  },
  username: {
    fontSize: 14,
    color: "var(--text-muted)",
    padding: "6px 12px",
  },
  logoutBtn: {
    padding: "6px 14px",
    borderRadius: "var(--radius-sm)",
    border: "1px solid var(--border)",
    background: "transparent",
    color: "var(--text-muted)",
    fontSize: 14,
    fontWeight: 500,
  },
  registerBtn: {
    padding: "6px 16px",
    borderRadius: "var(--radius-sm)",
    background: "var(--accent)",
    color: "#fff",
    fontSize: 14,
    fontWeight: 600,
  },
  burger: {
    background: "transparent",
    border: "none",
    color: "var(--text)",
    fontSize: 22,
    padding: "6px 8px",
    lineHeight: 1,
  },
  mobileMenu: {
    background: "#13151f",
    borderTop: "1px solid var(--border)",
    display: "flex",
    flexDirection: "column",
    padding: "8px 0 16px",
  },
  mobileLink: {
    padding: "14px 20px",
    fontSize: 16,
    color: "var(--text)",
    borderBottom: "1px solid rgba(255,255,255,0.04)",
  },
  mobileDivider: {
    height: 1,
    background: "var(--border)",
    margin: "8px 0",
  },
  mobileUser: {
    padding: "12px 20px",
    fontSize: 14,
    color: "var(--text-muted)",
  },
  mobileLogout: {
    margin: "8px 20px 0",
    padding: "12px 0",
    borderRadius: "var(--radius-sm)",
    border: "1px solid var(--border)",
    background: "transparent",
    color: "var(--text-muted)",
    fontSize: 15,
    fontWeight: 500,
    textAlign: "center",
  },
};
