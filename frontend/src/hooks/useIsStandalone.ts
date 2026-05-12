import { useState, useEffect } from "react";

/**
 * Определяет, открыто ли приложение в standalone-режиме
 * (т.е. установлено как PWA или TWA на Android).
 *
 * Используется, чтобы прятать баннер "Скачать APK" внутри
 * уже установленного приложения.
 */
export function useIsStandalone(): boolean {
  const [isStandalone, setIsStandalone] = useState(() => detectStandalone());

  useEffect(() => {
    const mq = window.matchMedia("(display-mode: standalone)");
    const handler = () => setIsStandalone(detectStandalone());
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return isStandalone;
}

function detectStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    // iOS Safari
    (window.navigator as { standalone?: boolean }).standalone === true ||
    // Android TWA
    document.referrer.startsWith("android-app://")
  );
}
