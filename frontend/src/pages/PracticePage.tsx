import { useMemo, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchGestures, usingMock } from "../api/gestures";
import { useCategories } from "../hooks/useCategories";
import { useIsMobile } from "../hooks/useIsMobile";
import { useProgressStore, dayStreak, MAX_MASTERY } from "../store/progressStore";
import type { Gesture } from "../types";

const SESSION_SIZE = 10;
const HAND_EMOJIS = ["🤟", "✋", "👋", "🤙", "👌", "✌️", "🤞", "🖐️"];
const emojiFor = (id: number) => HAND_EMOJIS[id % HAND_EMOJIS.length];

type Mode = "quiz" | "cards";
type Phase = "setup" | "play" | "result";

interface QuizQuestion {
  gesture: Gesture;
  options: string[]; // 4 варианта названий
}

/** Перемешать массив (Fisher–Yates, без мутации исходника). */
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function PracticePage() {
  const isMobile = useIsMobile();
  const { categories, getCategoryName } = useCategories();
  const progress = useProgressStore();

  const [mode, setMode] = useState<Mode>("quiz");
  const [phase, setPhase] = useState<Phase>("setup");
  const [catFilter, setCatFilter] = useState<number | null>(null);

  const { data: pool = [], isLoading } = useQuery({
    queryKey: ["practice-gestures", catFilter],
    queryFn: () => fetchGestures({ category_id: catFilter ?? undefined, limit: 200 }),
    staleTime: 60_000,
  });

  // Для викторины нужно минимум 4 жеста (3 неверных варианта + 1 верный).
  const enoughForQuiz = pool.length >= 4;

  // ── Состояние активной сессии ──
  const [queue, setQueue] = useState<QuizQuestion[]>([]);
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<string | null>(null); // выбранный вариант (quiz)
  const [revealed, setRevealed] = useState(false); // карточка перевёрнута (cards)
  const [sessionCorrect, setSessionCorrect] = useState(0);
  const [floatMsg, setFloatMsg] = useState<string | null>(null);

  const accuracy =
    progress.totalAnswered > 0
      ? Math.round((progress.totalCorrect / progress.totalAnswered) * 100)
      : 0;
  const days = dayStreak(progress.days);

  function buildQueue(): QuizQuestion[] {
    const titles = pool.map((g) => g.title);
    // Приоритет — менее освоенным жестам (mastery ниже идёт раньше).
    const ordered = shuffle(pool).sort(
      (a, b) => (progress.mastery[a.id] ?? 0) - (progress.mastery[b.id] ?? 0)
    );
    const chosen = ordered.slice(0, SESSION_SIZE);
    return chosen.map((gesture) => {
      const distractors = shuffle(titles.filter((t) => t !== gesture.title)).slice(0, 3);
      return { gesture, options: shuffle([gesture.title, ...distractors]) };
    });
  }

  function startSession() {
    const q = buildQueue();
    setQueue(q);
    setIdx(0);
    setPicked(null);
    setRevealed(false);
    setSessionCorrect(0);
    setPhase("play");
  }

  // Авто-скрытие всплывающей подсказки серии.
  useEffect(() => {
    if (floatMsg == null) return;
    const t = setTimeout(() => setFloatMsg(null), 900);
    return () => clearTimeout(t);
  }, [floatMsg]);

  const current = queue[idx];

  function commitAnswer(correct: boolean) {
    if (!current) return;
    const newStreak = progress.recordAnswer(current.gesture.id, correct);
    if (correct) {
      setSessionCorrect((c) => c + 1);
      setFloatMsg(newStreak >= 2 ? `Верно! 🔥 ${newStreak}` : "Верно!");
    }
  }

  function handlePick(option: string) {
    if (picked) return; // уже ответили
    setPicked(option);
    commitAnswer(option === current.gesture.title);
  }

  function handleSelfRate(known: boolean) {
    commitAnswer(known);
    next();
  }

  function next() {
    if (idx + 1 >= queue.length) {
      setPhase("result");
    } else {
      setIdx((i) => i + 1);
      setPicked(null);
      setRevealed(false);
    }
  }

  // ───────────────────────── РЕНДЕР ─────────────────────────

  const pad = isMobile ? "16px 16px 64px" : "32px 24px 64px";

  return (
    <main style={{ ...styles.main, padding: pad }}>
      {/* HUD прогресса — всегда виден */}
      <div style={styles.hud}>
        <div style={styles.hudBlock} title="Текущая серия правильных ответов">
          <span style={styles.hudValue}>🔥 {progress.streak}</span>
          <span style={styles.hudLabel}>Серия</span>
        </div>
        <div style={styles.hudDivider} />
        <div style={styles.hudBlock} title="Доля правильных ответов за всё время">
          <span style={styles.hudValue}>{accuracy}%</span>
          <span style={styles.hudLabel}>Точность</span>
        </div>
        <div style={styles.hudDivider} />
        <div style={styles.hudBlock} title="Дней подряд с тренировками">
          <span style={styles.hudValue}>{days}</span>
          <span style={styles.hudLabel}>Дней подряд</span>
        </div>
      </div>

      {/* ── SETUP ── */}
      {phase === "setup" && (
        <>
          <section style={styles.hero}>
            <h1 style={{ ...styles.title, fontSize: isMobile ? 26 : 38 }}>Тренировка жестов</h1>
            <p style={styles.sub}>
              Закрепляйте жесты в игровой форме: отвечайте на вопросы, держите серию
              и повышайте уровень освоения каждого жеста.
            </p>
          </section>

          {usingMock && (
            <div style={styles.demo}>
              <span style={styles.demoDot} /> Демо-режим — тренируемся на примерах жестов
            </div>
          )}

          {/* Выбор режима */}
          <div style={styles.modeRow}>
            <button
              style={{ ...styles.modeCard, ...(mode === "quiz" ? styles.modeCardActive : {}) }}
              onClick={() => setMode("quiz")}
            >
              <span style={styles.modeEmoji}>🎯</span>
              <span style={styles.modeName}>Викторина</span>
              <span style={styles.modeDesc}>Угадай жест по описанию из 4 вариантов</span>
            </button>
            <button
              style={{ ...styles.modeCard, ...(mode === "cards" ? styles.modeCardActive : {}) }}
              onClick={() => setMode("cards")}
            >
              <span style={styles.modeEmoji}>🃏</span>
              <span style={styles.modeName}>Карточки</span>
              <span style={styles.modeDesc}>Вспомни описание и оцени себя сам</span>
            </button>
          </div>

          {/* Фильтр по категории */}
          <div style={styles.catRow}>
            <button
              style={{ ...styles.chip, ...(catFilter === null ? styles.chipActive : {}) }}
              onClick={() => setCatFilter(null)}
            >
              Все жесты
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                style={{ ...styles.chip, ...(catFilter === c.id ? styles.chipActive : {}) }}
                onClick={() => setCatFilter(catFilter === c.id ? null : c.id)}
              >
                {c.name}
              </button>
            ))}
          </div>

          {/* Статистика */}
          <div style={styles.statRow}>
            <Stat label="Точность" value={`${accuracy}%`} />
            <Stat label="Серия" value={String(progress.streak)} />
            <Stat label="Рекорд серии" value={String(progress.bestStreak)} />
            <Stat label="Ответов" value={String(progress.totalAnswered)} />
          </div>

          <button
            style={{
              ...styles.startBtn,
              ...(mode === "quiz" && !enoughForQuiz ? styles.startBtnDisabled : {}),
            }}
            disabled={isLoading || pool.length === 0 || (mode === "quiz" && !enoughForQuiz)}
            onClick={startSession}
          >
            {isLoading
              ? "Загрузка…"
              : pool.length === 0
              ? "Нет жестов для тренировки"
              : mode === "quiz" && !enoughForQuiz
              ? "Нужно минимум 4 жеста"
              : `Начать · ${Math.min(SESSION_SIZE, pool.length)} вопросов`}
          </button>

          {progress.totalAnswered > 0 && (
            <button style={styles.resetLink} onClick={() => progress.reset()}>
              Сбросить весь прогресс
            </button>
          )}
        </>
      )}

      {/* ── PLAY ── */}
      {phase === "play" && current && (
        <section style={styles.playWrap}>
          {/* Прогресс по сессии */}
          <div style={styles.sessionBar}>
            <span style={styles.sessionStep}>
              Вопрос {idx + 1} / {queue.length}
            </span>
            <span style={styles.sessionStreak}>🔥 {progress.streak}</span>
          </div>
          <div style={styles.sessionProgressOuter}>
            <div
              style={{ ...styles.sessionProgressInner, width: `${(idx / queue.length) * 100}%` }}
            />
          </div>

          {/* Карточка-превью */}
          <div style={styles.preview}>
            <span style={styles.previewEmoji}>{emojiFor(current.gesture.id)}</span>
            {getCategoryName(current.gesture.category_id) && (
              <span style={styles.previewCat}>{getCategoryName(current.gesture.category_id)}</span>
            )}
          </div>

          {/* QUIZ MODE */}
          {mode === "quiz" && (
            <>
              <p style={styles.prompt}>
                {current.gesture.description || "Какой это жест?"}
              </p>
              <div style={styles.options}>
                {current.options.map((opt) => {
                  const isCorrect = opt === current.gesture.title;
                  const isPicked = opt === picked;
                  let optStyle: React.CSSProperties = styles.option;
                  if (picked) {
                    if (isCorrect) optStyle = { ...styles.option, ...styles.optionCorrect };
                    else if (isPicked) optStyle = { ...styles.option, ...styles.optionWrong };
                    else optStyle = { ...styles.option, ...styles.optionDim };
                  }
                  return (
                    <button
                      key={opt}
                      style={optStyle}
                      onClick={() => handlePick(opt)}
                      disabled={!!picked}
                    >
                      {opt}
                      {picked && isCorrect && <span style={styles.mark}>✓</span>}
                      {picked && isPicked && !isCorrect && <span style={styles.mark}>✕</span>}
                    </button>
                  );
                })}
              </div>

              {picked && (
                <div style={styles.feedbackRow}>
                  <span
                    style={{
                      ...styles.feedback,
                      color: picked === current.gesture.title ? "var(--success)" : "var(--error)",
                    }}
                  >
                    {picked === current.gesture.title ? "Верно!" : `Это «${current.gesture.title}»`}
                  </span>
                  <button style={styles.nextBtn} onClick={next}>
                    {idx + 1 >= queue.length ? "Результаты →" : "Дальше →"}
                  </button>
                </div>
              )}
            </>
          )}

          {/* CARDS MODE */}
          {mode === "cards" && (
            <>
              <h2 style={styles.cardTitle}>{current.gesture.title}</h2>
              {!revealed ? (
                <button style={styles.revealBtn} onClick={() => setRevealed(true)}>
                  Показать описание
                </button>
              ) : (
                <>
                  <p style={styles.cardDesc}>
                    {current.gesture.description || "Описание отсутствует."}
                  </p>
                  <p style={styles.selfQuestion}>Вспомнили жест?</p>
                  <div style={styles.selfRow}>
                    <button
                      style={{ ...styles.selfBtn, ...styles.selfNo }}
                      onClick={() => handleSelfRate(false)}
                    >
                      Не вспомнил
                    </button>
                    <button
                      style={{ ...styles.selfBtn, ...styles.selfYes }}
                      onClick={() => handleSelfRate(true)}
                    >
                      Вспомнил ✓
                    </button>
                  </div>
                </>
              )}
            </>
          )}

          {/* Мастерство текущего жеста */}
          <MasteryStars value={progress.mastery[current.gesture.id] ?? 0} />

          {/* Всплывающая подсказка серии */}
          {floatMsg != null && <div style={styles.floatMsg}>{floatMsg}</div>}

          <button style={styles.quitLink} onClick={() => setPhase("setup")}>
            Завершить тренировку
          </button>
        </section>
      )}

      {/* ── RESULT ── */}
      {phase === "result" && (
        <section style={styles.resultWrap}>
          <span style={styles.resultEmoji}>
            {sessionCorrect === queue.length ? "🏆" : sessionCorrect >= queue.length / 2 ? "🎉" : "💪"}
          </span>
          <h1 style={styles.resultTitle}>
            {sessionCorrect} из {queue.length}
          </h1>
          <p style={styles.resultSub}>
            {sessionCorrect === queue.length
              ? "Идеально! Все жесты угаданы."
              : sessionCorrect >= queue.length / 2
              ? "Хороший результат, продолжайте в том же духе!"
              : "Неплохо для начала — повторите ещё раз."}
          </p>

          <div style={styles.resultStats}>
            <Stat label="Точность" value={`${Math.round((sessionCorrect / queue.length) * 100)}%`} />
            <Stat label="Рекорд серии" value={String(progress.bestStreak)} />
            <Stat label="Серия дней" value={String(days)} />
          </div>

          <div style={styles.resultBtns}>
            <button style={styles.startBtn} onClick={startSession}>
              Ещё раз
            </button>
            <button style={styles.secondaryBtn} onClick={() => setPhase("setup")}>
              К настройкам
            </button>
          </div>
          <Link to="/" style={styles.quitLink}>
            ← В словарь
          </Link>
        </section>
      )}
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div style={styles.stat}>
      <span style={styles.statValue}>{value}</span>
      <span style={styles.statLabel}>{label}</span>
    </div>
  );
}

function MasteryStars({ value }: { value: number }) {
  return (
    <div style={styles.mastery} title={`Освоение: ${value} / ${MAX_MASTERY}`}>
      {Array.from({ length: MAX_MASTERY }).map((_, i) => (
        <span key={i} style={{ opacity: i < value ? 1 : 0.22, fontSize: 16 }}>
          ⭐
        </span>
      ))}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  main: { maxWidth: 720, margin: "0 auto" },

  // HUD
  hud: {
    display: "flex",
    alignItems: "center",
    gap: 16,
    background: "var(--bg-card)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius)",
    padding: "14px 18px",
    marginBottom: 28,
  },
  hudBlock: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2 },
  hudValue: { fontSize: 20, fontWeight: 700, color: "var(--accent-light)" },
  hudLabel: { fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" },
  hudDivider: { width: 1, alignSelf: "stretch", background: "var(--border)" },

  // Setup
  hero: { textAlign: "center", marginBottom: 28 },
  title: {
    fontWeight: 700,
    letterSpacing: "-1px",
    background: "linear-gradient(135deg, #fff 30%, var(--accent-light))",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  sub: { fontSize: 15, color: "var(--text-muted)", maxWidth: 460, margin: "10px auto 0", lineHeight: 1.6 },
  demo: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginBottom: 20,
    padding: "10px 16px",
    background: "rgba(108,99,255,0.08)",
    border: "1px solid rgba(108,99,255,0.2)",
    borderRadius: "var(--radius-sm)",
    fontSize: 13,
    color: "var(--text-muted)",
  },
  demoDot: { width: 8, height: 8, borderRadius: "50%", background: "var(--accent)", flexShrink: 0 },

  modeRow: { display: "flex", gap: 12, marginBottom: 24 },
  modeCard: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 6,
    padding: "20px 14px",
    background: "var(--bg-card)",
    borderWidth: 2,
    borderStyle: "solid",
    borderColor: "var(--border)",
    borderRadius: "var(--radius)",
    color: "var(--text)",
    textAlign: "center",
    transition: "border-color 0.15s, transform 0.1s",
  },
  modeCardActive: { borderColor: "var(--accent)", background: "var(--bg-card-hover)" },
  modeEmoji: { fontSize: 30 },
  modeName: { fontSize: 16, fontWeight: 600 },
  modeDesc: { fontSize: 12, color: "var(--text-muted)", lineHeight: 1.4 },

  catRow: { display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 24, justifyContent: "center" },
  chip: {
    padding: "6px 14px",
    borderRadius: 20,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "var(--border)",
    background: "transparent",
    color: "var(--text-muted)",
    fontSize: 13,
    fontWeight: 500,
  },
  chipActive: { background: "var(--accent)", borderColor: "var(--accent)", color: "#fff" },

  statRow: { display: "flex", gap: 10, marginBottom: 24, flexWrap: "wrap" },
  stat: {
    flex: 1,
    minWidth: 70,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 4,
    padding: "14px 8px",
    background: "var(--bg-card)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-sm)",
  },
  statValue: { fontSize: 20, fontWeight: 700 },
  statLabel: { fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.4px" },

  startBtn: {
    width: "100%",
    padding: "16px",
    background: "var(--accent)",
    border: "none",
    borderRadius: "var(--radius)",
    color: "#fff",
    fontSize: 16,
    fontWeight: 600,
  },
  startBtnDisabled: { opacity: 0.5, cursor: "not-allowed" },
  resetLink: {
    display: "block",
    margin: "16px auto 0",
    background: "transparent",
    border: "none",
    color: "var(--text-muted)",
    fontSize: 13,
    textDecoration: "underline",
  },

  // Play
  playWrap: { display: "flex", flexDirection: "column", position: "relative" },
  sessionBar: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  sessionStep: { fontSize: 13, color: "var(--text-muted)" },
  sessionStreak: { fontSize: 14, fontWeight: 600 },
  sessionProgressOuter: {
    height: 6,
    background: "var(--bg-card)",
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 24,
  },
  sessionProgressInner: {
    height: "100%",
    background: "var(--accent)",
    transition: "width 0.3s ease",
  },
  preview: {
    background: "linear-gradient(145deg, #1e1b4b 0%, #312e81 100%)",
    borderRadius: "var(--radius)",
    minHeight: 130,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginBottom: 20,
    position: "relative",
  },
  previewEmoji: { fontSize: 64 },
  previewCat: {
    position: "absolute",
    top: 12,
    right: 12,
    background: "rgba(0,0,0,0.3)",
    borderRadius: 20,
    padding: "4px 12px",
    fontSize: 12,
    color: "rgba(255,255,255,0.7)",
  },
  prompt: {
    fontSize: 17,
    lineHeight: 1.6,
    textAlign: "center",
    color: "var(--text)",
    marginBottom: 24,
    minHeight: 60,
  },
  options: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },
  option: {
    position: "relative",
    padding: "16px",
    background: "var(--bg-card)",
    borderWidth: 2,
    borderStyle: "solid",
    borderColor: "var(--border)",
    borderRadius: "var(--radius)",
    color: "var(--text)",
    fontSize: 15,
    fontWeight: 500,
    transition: "all 0.15s",
  },
  optionCorrect: { borderColor: "var(--success)", background: "rgba(76,175,130,0.12)", color: "var(--success)" },
  optionWrong: { borderColor: "var(--error)", background: "rgba(240,80,110,0.12)", color: "var(--error)" },
  optionDim: { opacity: 0.45 },
  mark: { position: "absolute", top: 8, right: 12, fontSize: 14, fontWeight: 700 },

  feedbackRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 20,
    gap: 12,
  },
  feedback: { fontSize: 15, fontWeight: 600 },
  nextBtn: {
    padding: "12px 24px",
    background: "var(--accent)",
    border: "none",
    borderRadius: "var(--radius-sm)",
    color: "#fff",
    fontSize: 15,
    fontWeight: 600,
  },

  cardTitle: { fontSize: 28, fontWeight: 700, textAlign: "center", marginBottom: 24 },
  revealBtn: {
    width: "100%",
    padding: "16px",
    background: "var(--bg-card)",
    border: "2px dashed var(--border)",
    borderRadius: "var(--radius)",
    color: "var(--text-muted)",
    fontSize: 15,
    fontWeight: 500,
  },
  cardDesc: {
    fontSize: 16,
    lineHeight: 1.7,
    color: "var(--text-muted)",
    textAlign: "center",
    padding: "0 8px",
    marginBottom: 20,
  },
  selfQuestion: { textAlign: "center", fontSize: 14, color: "var(--text-muted)", marginBottom: 12 },
  selfRow: { display: "flex", gap: 12 },
  selfBtn: { flex: 1, padding: "16px", borderRadius: "var(--radius)", fontSize: 15, fontWeight: 600, borderWidth: 2, borderStyle: "solid", borderColor: "transparent" },
  selfNo: { background: "rgba(240,80,110,0.1)", borderColor: "var(--error)", color: "var(--error)" },
  selfYes: { background: "rgba(76,175,130,0.1)", borderColor: "var(--success)", color: "var(--success)" },

  mastery: { display: "flex", justifyContent: "center", gap: 4, marginTop: 24 },

  floatMsg: {
    position: "absolute",
    top: 100,
    left: "50%",
    transform: "translateX(-50%)",
    fontSize: 20,
    fontWeight: 800,
    color: "var(--success)",
    textShadow: "0 2px 12px rgba(76,175,130,0.55)",
    animation: "floatUp 0.9s ease-out forwards",
    pointerEvents: "none",
    whiteSpace: "nowrap",
  },

  quitLink: {
    display: "block",
    textAlign: "center",
    margin: "24px auto 0",
    background: "transparent",
    border: "none",
    color: "var(--text-muted)",
    fontSize: 13,
    textDecoration: "underline",
  },

  // Result
  resultWrap: { textAlign: "center", paddingTop: 20 },
  resultEmoji: { fontSize: 72, display: "block", marginBottom: 8 },
  resultTitle: { fontSize: 36, fontWeight: 700, marginBottom: 8 },
  resultSub: { fontSize: 15, color: "var(--text-muted)", marginBottom: 28 },
  resultStats: { display: "flex", gap: 10, marginBottom: 28 },
  resultBtns: { display: "flex", gap: 12 },
  secondaryBtn: {
    flex: 1,
    padding: "16px",
    background: "var(--bg-card)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius)",
    color: "var(--text)",
    fontSize: 16,
    fontWeight: 600,
  },
};
