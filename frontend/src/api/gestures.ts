import type { Category, Gesture, GestureCreate } from "../types";
import { MOCK_GESTURES, MOCK_CATEGORIES } from "../data/mockGestures";

const BASE = "/api/v1";

export let usingMock = false;

export async function fetchCategories(): Promise<Category[]> {
  try {
    const res = await fetch(`${BASE}/categories/`);
    if (!res.ok) throw new Error();
    return res.json();
  } catch {
    return MOCK_CATEGORIES;
  }
}

export async function fetchGestures(params?: {
  q?: string;
  category_id?: number;
  offset?: number;
  limit?: number;
}): Promise<Gesture[]> {
  try {
    const search = new URLSearchParams();
    if (params?.q) search.set("q", params.q);
    if (params?.category_id) search.set("category_id", String(params.category_id));
    if (params?.offset) search.set("offset", String(params.offset));
    search.set("limit", String(params?.limit ?? 100));

    const res = await fetch(`${BASE}/gestures/?${search}`);
    if (!res.ok) throw new Error();
    usingMock = false;
    return res.json();
  } catch {
    usingMock = true;
    let result = MOCK_GESTURES;
    if (params?.category_id) result = result.filter((g) => g.category_id === params.category_id);
    if (params?.q) result = result.filter((g) => g.title.toLowerCase().includes(params.q!.toLowerCase()));
    return result;
  }
}

export async function fetchGesture(id: number): Promise<Gesture> {
  try {
    const res = await fetch(`${BASE}/gestures/${id}`);
    if (!res.ok) throw new Error();
    return res.json();
  } catch {
    const found = MOCK_GESTURES.find((g) => g.id === id);
    if (!found) throw new Error("Жест не найден");
    return found;
  }
}

export async function createGesture(data: GestureCreate, token?: string): Promise<Gesture> {
  const res = await fetch(`${BASE}/gestures/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Ошибка создания жеста");
  return res.json();
}
