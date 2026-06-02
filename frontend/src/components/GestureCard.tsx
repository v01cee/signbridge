import { Link } from "react-router-dom";
import type { Gesture } from "../types";

interface Props {
  gesture: Gesture;
  categoryName?: string;
}

const HAND_EMOJIS = ["🤟", "✋", "👋", "🤙", "👌", "✌️", "🤞", "🖐️"];
const THUMB_GRADIENTS = [
  "linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)",
  "linear-gradient(135deg, #1a2e1e 0%, #1a4731 100%)",
  "linear-gradient(135deg, #2d1b1b 0%, #5c2626 100%)",
  "linear-gradient(135deg, #1b2535 0%, #1e3a5f 100%)",
  "linear-gradient(135deg, #2b1d35 0%, #4c2a6e 100%)",
];

function getEmoji(id: number) {
  return HAND_EMOJIS[id % HAND_EMOJIS.length];
}
function getGradient(id: number) {
  return THUMB_GRADIENTS[id % THUMB_GRADIENTS.length];
}

export function GestureCard({ gesture, categoryName }: Props) {
  const firstMedia = gesture.media?.[0];
  return (
    <Link to={`/gestures/${gesture.id}`} style={styles.card}>
      <div style={{ ...styles.thumb, background: getGradient(gesture.id) }}>
        {firstMedia?.media_type === "video" ? (
          <video
            src={firstMedia.file_url}
            style={styles.media}
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
          />
        ) : firstMedia?.media_type === "image" || firstMedia?.media_type === "gif" ? (
          <img src={firstMedia.file_url} alt={gesture.title} style={styles.media} />
        ) : (
          <span style={styles.emoji}>{getEmoji(gesture.id)}</span>
        )}
      </div>
      <div style={styles.body}>
        {categoryName && <span style={styles.catBadge}>{categoryName}</span>}
        <p style={styles.title}>{gesture.title}</p>
        {gesture.description && (
          <p style={styles.desc}>{gesture.description}</p>
        )}
      </div>
    </Link>
  );
}

const styles: Record<string, React.CSSProperties> = {
  card: {
    background: "var(--bg-card)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius)",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    transition: "border-color 0.15s, transform 0.15s",
    cursor: "pointer",
  },
  thumb: {
    height: 140,
    background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  emoji: { fontSize: 56 },
  media: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  } as React.CSSProperties,
  body: { padding: "16px" },
  title: {
    fontSize: 16,
    fontWeight: 600,
    color: "var(--text)",
    marginBottom: 6,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  desc: {
    fontSize: 13,
    color: "var(--text-muted)",
    marginBottom: 12,
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
  },
  catBadge: {
    display: "inline-block",
    fontSize: 11,
    fontWeight: 500,
    color: "var(--accent-light)",
    background: "rgba(108,99,255,0.12)",
    border: "1px solid rgba(108,99,255,0.2)",
    borderRadius: 20,
    padding: "2px 8px",
    marginBottom: 8,
    letterSpacing: "0.2px",
  },
};
