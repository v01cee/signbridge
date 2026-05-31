import { apiFetch, apiJson } from './client';
import type { FavoriteRecord } from '../types';

export async function fetchFavorites(token: string): Promise<FavoriteRecord[]> {
  return apiJson<FavoriteRecord[]>('/favorites/', { method: 'GET' }, token);
}

export async function addFavorite(
  gesture_id: number,
  token: string,
): Promise<FavoriteRecord> {
  return apiJson<FavoriteRecord>(
    `/favorites/?gesture_id=${encodeURIComponent(gesture_id)}`,
    { method: 'POST' },
    token,
  );
}

export async function removeFavorite(gesture_id: number, token: string): Promise<void> {
  await apiFetch(`/favorites/${gesture_id}`, { method: 'DELETE' }, token);
}
