import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchGesture } from "../api/gestures";
import { fetchFavorites, addFavorite, removeFavorite } from "../api/favorites";
import { useAuthStore } from "../store/authStore";
import { useIsMobile } from "../hooks/useIsMobile";
import { useCategories } from "../hooks/useCategories";

const HAND_EMOJIS = ["🤟", "✋", "👋", "🤙", "👌", "✌️", "🤞", "🖐️"];
const getEmoji = (id: number) => HAND_EMOJIS[id % HAND_EMOJIS.length];

export function GestureDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { token } = useAuthStore();
  const [mediaIndex, setMediaIndex] = useState(0);
  const isMobile = useIsMobile();
  const { getCategoryName } = useCategories();

  const { data: gesture, isLoading, isError } = useQuery({
    queryKey: ["gesture", id],
    queryFn: () => fetchGesture(Number(id)),
    enabled: !!id,
  });

  const { data: favorites = [] } = useQuery({
    queryKey: ["favorites"],
    queryFn: () => fetchFavorites(token!),
    enabled: !!token,
  });

  const isFavorited = favorites.some((f) => f.gesture_id === Number(id));

  const toggleFavMutation = useMutation({
    mutationFn: () =>
      isFavorited
        ? removeFavorite(Number(id), token!)
        : addFavorite(Number(id), token!),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["favorites"] }),
  });

  if (isLoading) {
    return (
      <main style={styles.main}>
        <div style={styles.spinner}>Загрузка...</div>
      </main>
    );
  }

  if (isError || !gesture) {
    return (
      <main style={styles.main}>
        <div style={styles.error}>
          <p style={{ fontSize: 40, marginBottom: 12 }}>🤔</p>
          <p>Жест не найден</p>
          <button style={styles.backBtn} onClick={() => navigate("/")}>← Назад к словарю</button>
        </div>
      </main>
    );
  }

  const mediaList = gesture.media ?? [];
  const currentMedia = mediaList[mediaIndex] ?? null;

  const categoryName = getCategoryName(gesture.category_id);

  return (
    <main style={{ ...styles.main, padding: isMobile ? "16px 16px 80px" : "32px 24px 64px" }}>
      <Link to="/" style={styles.breadcrumb}>← Словарь</Link>

      <div style={{
        ...styles.card,
        gridTemplateColumns: isMobile ? "1fr" : "340px 1fr",
        gap: isMobile ? 0 : 32,
      }}>
        {/* Медиа-превью */}
        <div style={{ ...styles.preview, minHeight: isMobile ? 220 : 320 }}>
          {currentMedia ? (
            currentMedia.media_type === "video" ? (
              <video
                key={currentMedia.file_url}
                src={currentMedia.file_url}
                controls
                autoPlay
                loop
                muted
                style={styles.mediaEl}
              />
            ) : (
              <img
                src={currentMedia.file_url}
                alt={gesture.title}
                style={styles.mediaEl}
              />
            )
          ) : (
            <>
              <span style={styles.emoji}>{getEmoji(gesture.id)}</span>
              <div style={styles.previewBadge}>нет видео</div>
            </>
          )}

          {/* Переключатель медиа */}
          {mediaList.length > 1 && (
            <div style={styles.mediaDots}>
              {mediaList.map((_, i) => (
                <button
                  key={i}
                  style={{ ...styles.mediaDot, ...(i === mediaIndex ? styles.mediaDotActive : {}) }}
                  onClick={() => setMediaIndex(i)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Инфо */}
        <div style={{ ...styles.info, padding: isMobile ? "24px 20px" : "40px 32px 40px 0" }}>
          <div style={styles.header}>
            <h1 style={{ ...styles.title, fontSize: isMobile ? 22 : 32 }}>{gesture.title}</h1>
            <div style={styles.headerActions}>
              {categoryName && (
                <span style={styles.categoryBadge}>{categoryName}</span>
              )}
              {token && (
                <button
                  style={{
                    ...styles.favBtn,
                    ...(isFavorited ? styles.favBtnActive : {}),
                  }}
                  onClick={() => toggleFavMutation.mutate()}
                  disabled={toggleFavMutation.isPending}
                  title={isFavorited ? "Убрать из избранного" : "В избранное"}
                >
                  {isFavorited ? "★" : "☆"}
                </button>
              )}
            </div>
          </div>

          {gesture.description ? (
            <p style={styles.description}>{gesture.description}</p>
          ) : (
            <p style={styles.noDesc}>Описание отсутствует</p>
          )}

          <div style={{ ...styles.meta, flexWrap: "wrap" as const, gap: isMobile ? 20 : 32 }}>
            <div style={styles.metaItem}>
              <span style={styles.metaLabel}>Создан</span>
              <span style={styles.metaValue}>
                {new Date(gesture.created_at).toLocaleDateString("ru-RU", {
                  day: "numeric", month: "long", year: "numeric",
                })}
              </span>
            </div>
            <div style={styles.metaItem}>
              <span style={styles.metaLabel}>ID</span>
              <span style={styles.metaValue}>#{gesture.id}</span>
            </div>
            {mediaList.length > 0 && (
              <div style={styles.metaItem}>
                <span style={styles.metaLabel}>Медиа</span>
                <span style={styles.metaValue}>{mediaList.length} файл(а)</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  main: { maxWidth: 900, margin: "0 auto", padding: "32px 24px 64px" },
  breadcrumb: { display: "inline-block", marginBottom: 28, fontSize: 14, color: "var(--text-muted)" },
  card: {
    display: "grid",
    gridTemplateColumns: "340px 1fr",
    gap: 32,
    background: "var(--bg-card)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius)",
    overflow: "hidden",
  },
  preview: {
    background: "linear-gradient(145deg, #1e1b4b 0%, #312e81 100%)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    minHeight: 320,
    position: "relative",
  },
  mediaEl: { width: "100%", height: "100%", objectFit: "contain", maxHeight: 320 },
  emoji: { fontSize: 96 },
  previewBadge: {
    position: "absolute",
    bottom: 16,
    fontSize: 12,
    background: "rgba(0,0,0,0.4)",
    borderRadius: 20,
    padding: "4px 12px",
    color: "rgba(255,255,255,0.5)",
  },
  mediaDots: {
    position: "absolute",
    bottom: 12,
    display: "flex",
    gap: 6,
  },
  mediaDot: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    background: "rgba(255,255,255,0.3)",
    border: "none",
    cursor: "pointer",
    padding: 0,
  },
  mediaDotActive: { background: "rgba(255,255,255,0.9)" },
  info: { padding: "40px 32px 40px 0" },
  header: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20 },
  headerActions: { display: "flex", alignItems: "center", gap: 8, flexShrink: 0 },
  title: { fontSize: 32, fontWeight: 700, letterSpacing: "-0.5px", flex: 1, marginRight: 12 },
  categoryBadge: {
    background: "rgba(108,99,255,0.15)",
    border: "1px solid rgba(108,99,255,0.3)",
    borderRadius: 20,
    padding: "4px 12px",
    fontSize: 12,
    color: "var(--accent-light)",
  },
  favBtn: {
    background: "transparent",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-sm)",
    fontSize: 20,
    width: 36,
    height: 36,
    cursor: "pointer",
    color: "var(--text-muted)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  favBtnActive: { color: "#f59e0b", borderColor: "#f59e0b" },
  description: { fontSize: 15, color: "var(--text-muted)", lineHeight: 1.7, marginBottom: 32 },
  noDesc: { fontSize: 14, color: "var(--text-muted)", opacity: 0.5, fontStyle: "italic", marginBottom: 32 },
  meta: { display: "flex", gap: 32, borderTop: "1px solid var(--border)", paddingTop: 24 },
  metaItem: { display: "flex", flexDirection: "column", gap: 4 },
  metaLabel: { fontSize: 12, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" },
  metaValue: { fontSize: 15, fontWeight: 500 },
  spinner: { textAlign: "center", padding: "120px 0", color: "var(--text-muted)" },
  error: { textAlign: "center", padding: "120px 0" },
  backBtn: {
    marginTop: 20,
    background: "var(--bg-card)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-sm)",
    padding: "10px 24px",
    color: "var(--text)",
    fontSize: 14,
    cursor: "pointer",
  },
};
