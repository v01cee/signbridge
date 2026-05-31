import { apiJson } from './client';
import type { Gesture } from '../types';

interface FetchGesturesParams {
  q?: string;
  category_id?: number | null;
  limit?: number;
}

export async function fetchGestures(params: FetchGesturesParams = {}): Promise<Gesture[]> {
  const { q, category_id, limit = 100 } = params;
  const search = new URLSearchParams();
  if (q && q.trim().length > 0) search.set('q', q.trim());
  if (category_id !== undefined && category_id !== null) {
    search.set('category_id', String(category_id));
  }
  search.set('limit', String(limit));
  const qs = search.toString();
  return apiJson<Gesture[]>(`/gestures/${qs ? `?${qs}` : ''}`);
}

export async function fetchGesture(id: number): Promise<Gesture> {
  return apiJson<Gesture>(`/gestures/${id}`);
}
