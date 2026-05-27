import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { fetchFavorites } from "../api/favorites";
import { fetchGesture } from "../api/gestures";
import { useAuthStore } from "../store/authStore";
import { GestureCard } from "../components/GestureCard";
import { useCategories } from "../hooks/useCategories";

function FavoriteGestureCard({ gestureId }: { gestureId: number }) {
  const { getCategoryName } = useCategories();
  const { data: gesture } = useQuery({
    queryKey: ["gesture", gestureId],
    queryFn: () => fetchGesture(gestureId),
  });

  if (!gesture) {
    return <div style={styles.skeletonCard} />;
  }

  const categoryName = getCategoryName(gesture.category_id) ?? undefined;
  return <GestureCard gesture={gesture} categoryName={categoryName} />;
}

export function FavoritesPage() {
  const { token, user } = useAuthStore();

  const { data: favorites = [], isLoading } = useQuery({
    queryKey: ["favorites"],
    queryFn: () => fetchFavorites(token!),
    enabled: !!token,
  });

  if (!token || !user) {
    return (
      <main style={styles.main}>
        <div style={styles.empty}>
          <p style={{ fontSize: 48, marginBottom: 16 }}>🔒</p>
          <p style={styles.emptyTitle}>Войдите в аккаунт</p>
          <p style={styles.emptySub}>Чтобы сохранять жесты в избранное, нужно авторизоваться</p>
          <Link to="/login" style={styles.loginBtn}>Войти</Link>
        </div>
      </main>
    );
  }

  return (
    <main style={styles.main}>
      <div style={styles.header}>
        <h1 style={styles.title}>Избранное</h1>
        {!isLoading && (
          <span style={styles.count}>{favorites.length}</span>
        )}
      </div>

      {isLoading && (
        <div style={styles.grid}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} style={styles.skeletonCard} />
          ))}
        </div>
      )}

      {!isLoading && favorites.length === 0 && (
        <div style={styles.empty}>
          <p style={{ fontSize: 48, marginBottom: 16 }}>☆</p>
          <p style={styles.emptyTitle}>Пока пусто</p>
          <p style={styles.emptySub}>Открывайте жесты и нажимайте ☆, чтобы добавить в избранное</p>
          <Link to="/" style={styles.loginBtn}>Перейти к словарю</Link>
        </div>
      )}

      {!isLoading && favorites.length > 0 && (
        <div style={styles.grid}>
          {favorites.map((fav) => (
            <FavoriteGestureCard key={fav.id} gestureId={fav.gesture_id} />
          ))}
        </div>
      )}
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  main: { maxWidth: 1200, margin: "0 auto", padding: "40px 24px 64px" },
  header: { display: "flex", alignItems: "center", gap: 14, marginBottom: 32 },
  title: { fontSize: 28, fontWeight: 700, letterSpacing: "-0.5px" },
  count: {
    background: "var(--accent)",
    color: "#fff",
    borderRadius: 20,
    padding: "3px 12px",
    fontSize: 14,
    fontWeight: 600,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
    gap: 16,
  },
  skeletonCard: {
    height: 220,
    borderRadius: "var(--radius)",
    background: "var(--bg-card)",
    opacity: 0.6,
  },
  empty: {
    textAlign: "center",
    padding: "80px 0",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 8,
  },
  emptyTitle: { fontSize: 20, fontWeight: 600, marginBottom: 4 },
  emptySub: { fontSize: 14, color: "var(--text-muted)", maxWidth: 320 },
  loginBtn: {
    marginTop: 16,
    display: "inline-block",
    background: "var(--accent)",
    color: "#fff",
    borderRadius: "var(--radius-sm)",
    padding: "10px 28px",
    fontWeight: 600,
    fontSize: 14,
  },
};
