import { useState } from "react";
import { useIsStandalone } from "../hooks/useIsStandalone";

const APK_URL = "/SignBridge.apk";

export function DownloadAPKBanner() {
  const isStandalone = useIsStandalone();
  const [dismissed, setDismissed] = useState(
    () => sessionStorage.getItem("apk-banner-dismissed") === "1",
  );

  // Внутри установленного приложения — не показываем
  if (isStandalone || dismissed) return null;

  function dismiss() {
    sessionStorage.setItem("apk-banner-dismissed", "1");
    setDismissed(true);
  }

  return (
    <div style={styles.banner}>
      <div style={styles.content}>
        <span style={styles.icon}>📱</span>
        <div style={styles.text}>
          <strong style={styles.title}>Установите приложение</strong>
          <span style={styles.sub}>Удобнее, чем в браузере</span>
        </div>
      </div>
      <div style={styles.actions}>
        <a href={APK_URL} download style={styles.download}>
          Скачать APK
        </a>
        <button onClick={dismiss} style={styles.close} aria-label="Закрыть">
          ✕
        </button>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  banner: {
    position: "fixed",
    bottom: 0,
    left: 0,
    right: 0,
    background: "linear-gradient(135deg, #6c63ff 0%, #8b84ff 100%)",
    padding: "12px 16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    zIndex: 1000,
    boxShadow: "0 -4px 16px rgba(0,0,0,0.3)",
  },
  content: { display: "flex", alignItems: "center", gap: 12, flex: 1, minWidth: 0 },
  icon: { fontSize: 28 },
  text: { display: "flex", flexDirection: "column", minWidth: 0 },
  title: { color: "#fff", fontSize: 14, fontWeight: 600 },
  sub: { color: "rgba(255,255,255,0.85)", fontSize: 12 },
  actions: { display: "flex", alignItems: "center", gap: 8, flexShrink: 0 },
  download: {
    background: "#fff",
    color: "#5048d6",
    padding: "8px 16px",
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 600,
    textDecoration: "none",
  },
  close: {
    background: "transparent",
    border: "none",
    color: "#fff",
    fontSize: 18,
    width: 30,
    height: 30,
    padding: 0,
  },
};
