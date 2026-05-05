import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { fetchGestures, fetchCategories, usingMock } from "../api/gestures";
import { MOCK_CATEGORIES } from "../data/mockGestures";
import { GestureCard } from "../components/GestureCard";
import { SearchBar } from "../components/SearchBar";
import { useIsMobile } from "../hooks/useIsMobile";

export function HomePage() {
  const [search, setSearch] = useState("");
  const [activeCat, setActiveCat] = useState<number | null>(null);
  const isMobile = useIsMobile();

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  const { data: filtered = [], isLoading } = useQuery({
    queryKey: ["gestures", search, activeCat],
    queryFn: () => fetchGestures({ q: search || undefined, category_id: activeCat ?? undefined }),
    staleTime: 10_000,
  });

  return (
    <main style={{ ...styles.main, padding: isMobile ? "0 16px 48px" : "0 24px 64px" }}>
      {/* Hero */}
      <section style={{ ...styles.hero, padding: isMobile ? "28px 0 20px" : "64px 0 40px" }}>
        <h1 style={{ ...styles.heroTitle, fontSize: isMobile ? 26 : 42 }}>Словарь языка жестов</h1>
        <p style={styles.heroSub}>Изучайте жесты, создавайте словарь и делитесь знаниями</p>
        <SearchBar value={search} onChange={setSearch} />
      </section>

      {/* Demo banner */}
      {usingMock && !isLoading && (
        <div style={styles.demoBanner}>
          <span style={styles.demoDot} />
          Демо-режим — backend не подключён, отображаются примеры жестов
        </div>
      )}

      {/* Category tabs */}
      <div style={styles.tabs}>
        <button
          style={{ ...styles.tab, ...(activeCat === null ? styles.tabActive : {}) }}
          onClick={() => setActiveCat(null)}
        >
          Все
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            style={{ ...styles.tab, ...(activeCat === cat.id ? styles.tabActive : {}) }}
            onClick={() => setActiveCat(activeCat === cat.id ? null : cat.id)}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Content */}
      <section>
        <div style={styles.sectionHead}>
          <h2 style={styles.sectionTitle}>
            {search ? `Результаты: «${search}»` : activeCat
              ? categories.find((c) => c.id === activeCat)?.name
              : "Все жесты"}
          </h2>
          <span style={styles.count}>{isLoading ? "…" : filtered.length}</span>
        </div>

        {isLoading && <LoadingSkeleton />}

        {!isLoading && filtered.length === 0 && (
          <div style={styles.empty}>
            <p style={{ fontSize: 48, marginBottom: 16 }}>🤷</p>
            <p style={{ color: "var(--text-muted)" }}>Ничего не найдено</p>
            {search && (
              <button style={styles.clearBtn} onClick={() => setSearch("")}>
                Сбросить поиск
              </button>
            )}
            {!search && (
              <Link to="/create" style={styles.createBtn}>
                Добавить первый жест
              </Link>
            )}
          </div>
        )}

        {!isLoading && filtered.length > 0 && (
          <div style={styles.grid}>
            {filtered.map((g) => (
              <GestureCard key={g.id} gesture={g} categoryName={
                MOCK_CATEGORIES.find((c) => c.id === g.category_id)?.name
              } />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

function LoadingSkeleton() {
  return (
    <div style={styles.grid}>
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} style={styles.skeleton} />
      ))}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  main: { maxWidth: 1200, margin: "0 auto", padding: "0 24px 64px" },
  hero: {
    padding: "64px 0 40px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 16,
    textAlign: "center",
  },
  heroTitle: {
    fontSize: 42,
    fontWeight: 700,
    letterSpacing: "-1px",
    background: "linear-gradient(135deg, #fff 30%, var(--accent-light))",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  heroSub: { fontSize: 16, color: "var(--text-muted)", marginBottom: 8 },
  demoBanner: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginBottom: 24,
    padding: "10px 16px",
    background: "rgba(108,99,255,0.08)",
    border: "1px solid rgba(108,99,255,0.2)",
    borderRadius: "var(--radius-sm)",
    fontSize: 13,
    color: "var(--text-muted)",
  },
  demoDot: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    background: "var(--accent)",
    flexShrink: 0,
  },
  tabs: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap" as const,
    marginBottom: 28,
  },
  tab: {
    padding: "6px 16px",
    borderRadius: 20,
    border: "1px solid var(--border)",
    background: "transparent",
    color: "var(--text-muted)",
    fontSize: 13,
    fontWeight: 500,
    cursor: "pointer",
    transition: "all 0.15s",
  },
  tabActive: {
    background: "var(--accent)",
    borderColor: "var(--accent)",
    color: "#fff",
  },
  sectionHead: { display: "flex", alignItems: "center", gap: 12, marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 600 },
  count: {
    background: "var(--bg-card)",
    border: "1px solid var(--border)",
    borderRadius: 20,
    padding: "2px 10px",
    fontSize: 13,
    color: "var(--text-muted)",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
    gap: 12,
  },
  skeleton: {
    height: 220,
    borderRadius: "var(--radius)",
    background: "var(--bg-card)",
    opacity: 0.6,
  },
  empty: { textAlign: "center", padding: "80px 0" },
  clearBtn: {
    marginTop: 16,
    background: "var(--bg-card)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-sm)",
    padding: "8px 20px",
    color: "var(--text)",
    fontSize: 14,
  },
  createBtn: {
    display: "inline-block",
    marginTop: 16,
    background: "var(--accent)",
    borderRadius: "var(--radius-sm)",
    padding: "10px 24px",
    color: "#fff",
    fontWeight: 600,
    fontSize: 14,
  },
};
