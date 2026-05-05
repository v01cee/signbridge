const BASE = "/api/v1";

export interface FavoriteRecord {
  id: number;
  user_id: number;
  gesture_id: number;
  created_at: string;
}

export async function fetchFavorites(token: string): Promise<FavoriteRecord[]> {
  const res = await fetch(`${BASE}/favorites/`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch favorites");
  return res.json();
}

export async function addFavorite(gesture_id: number, token: string): Promise<FavoriteRecord> {
  const res = await fetch(`${BASE}/favorites/?gesture_id=${gesture_id}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to add favorite");
  return res.json();
}

export async function removeFavorite(gesture_id: number, token: string): Promise<void> {
  const res = await fetch(`${BASE}/favorites/${gesture_id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to remove favorite");
}
