import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * Стор геймификации обучения.
 *
 * Хранит прогресс пользователя в режиме «Тренировка»:
 *  - XP и уровень (вычисляется из XP),
 *  - текущую и рекордную серию правильных ответов,
 *  - «освоенность» каждого жеста (mastery 0–5),
 *  - дневную активность для серии дней подряд (streak дней).
 *
 * Сохраняется в localStorage и работает без авторизации —
 * чтобы тренироваться можно было даже в демо-режиме.
 */

/** Сколько XP нужно на каждый следующий уровень (нарастающе). */
export const XP_PER_LEVEL = 100;

/** Максимальная «освоенность» одного жеста. */
export const MAX_MASTERY = 5;

export interface DayLog {
  /** Дата в формате YYYY-MM-DD. */
  date: string;
  /** Сколько правильных ответов в этот день. */
  correct: number;
}

interface ProgressState {
  xp: number;
  totalAnswered: number;
  totalCorrect: number;
  streak: number;
  bestStreak: number;
  /** gestureId → уровень освоения (0..MAX_MASTERY). */
  mastery: Record<number, number>;
  /** Журнал активности по дням (последние 30). */
  days: DayLog[];
  /** Дата последней тренировки YYYY-MM-DD. */
  lastPracticed: string | null;

  /** Зарегистрировать ответ. Возвращает сколько XP начислено. */
  recordAnswer: (gestureId: number, correct: boolean) => number;
  /** Сбросить только текущую серию (например, при выходе из сессии). */
  resetStreak: () => void;
  /** Полный сброс прогресса. */
  reset: () => void;
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Уровень по количеству XP (1-based). */
export function levelFromXp(xp: number): number {
  return Math.floor(xp / XP_PER_LEVEL) + 1;
}

/** XP внутри текущего уровня и сколько до следующего. */
export function levelProgress(xp: number): { inLevel: number; needed: number; pct: number } {
  const inLevel = xp % XP_PER_LEVEL;
  return { inLevel, needed: XP_PER_LEVEL, pct: Math.round((inLevel / XP_PER_LEVEL) * 100) };
}

/** Сколько дней подряд пользователь занимался (по журналу days). */
export function dayStreak(days: DayLog[]): number {
  if (days.length === 0) return 0;
  const dates = new Set(days.filter((d) => d.correct > 0).map((d) => d.date));
  let streak = 0;
  const cursor = new Date();
  // Допускаем, что сегодня ещё могли не позаниматься — стартуем со вчера, если сегодня пусто.
  if (!dates.has(cursor.toISOString().slice(0, 10))) {
    cursor.setDate(cursor.getDate() - 1);
  }
  while (dates.has(cursor.toISOString().slice(0, 10))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      xp: 0,
      totalAnswered: 0,
      totalCorrect: 0,
      streak: 0,
      bestStreak: 0,
      mastery: {},
      days: [],
      lastPracticed: null,

      recordAnswer: (gestureId, correct) => {
        const state = get();
        const date = today();

        // Серия и XP: верный ответ даёт 10 XP + бонус за серию (по 2 за каждый
        // ответ в серии, максимум +20), неверный — обнуляет серию.
        const newStreak = correct ? state.streak + 1 : 0;
        const streakBonus = correct ? Math.min((newStreak - 1) * 2, 20) : 0;
        const gained = correct ? 10 + streakBonus : 0;

        // Mastery: +1 за верный (до MAX), −1 за неверный (не ниже 0).
        const prevMastery = state.mastery[gestureId] ?? 0;
        const nextMastery = correct
          ? Math.min(prevMastery + 1, MAX_MASTERY)
          : Math.max(prevMastery - 1, 0);

        // Журнал дней.
        const days = [...state.days];
        const todayLog = days.find((d) => d.date === date);
        if (todayLog) {
          if (correct) todayLog.correct += 1;
        } else {
          days.push({ date, correct: correct ? 1 : 0 });
        }
        // Держим только последние 30 дней.
        const trimmed = days.slice(-30);

        set({
          xp: state.xp + gained,
          totalAnswered: state.totalAnswered + 1,
          totalCorrect: state.totalCorrect + (correct ? 1 : 0),
          streak: newStreak,
          bestStreak: Math.max(state.bestStreak, newStreak),
          mastery: { ...state.mastery, [gestureId]: nextMastery },
          days: trimmed,
          lastPracticed: date,
        });

        return gained;
      },

      resetStreak: () => set({ streak: 0 }),

      reset: () =>
        set({
          xp: 0,
          totalAnswered: 0,
          totalCorrect: 0,
          streak: 0,
          bestStreak: 0,
          mastery: {},
          days: [],
          lastPracticed: null,
        }),
    }),
    { name: "signbridge-progress" }
  )
);
