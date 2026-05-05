// Замени IP на свой локальный (ipconfig → IPv4)
// Для Android-эмулятора: http://10.0.2.2:8000
// Для реального устройства: http://192.168.X.X:8000
export const BASE_URL = 'http://10.0.2.2:8000/api/v1';

export async function apiFetch(
  path: string,
  options: RequestInit = {},
  token?: string | null,
): Promise<Response> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return fetch(`${BASE_URL}${path}`, { ...options, headers });
}
