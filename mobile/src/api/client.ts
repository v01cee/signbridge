export const BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  'https://signbridge.duckdns.org/api/v1';

export class ApiError extends Error {
  status: number;
  detail: unknown;
  constructor(message: string, status: number, detail?: unknown) {
    super(message);
    this.status = status;
    this.detail = detail;
  }
}

export async function apiFetch(
  path: string,
  options: RequestInit = {},
  token?: string | null,
): Promise<Response> {
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };
  if (!headers['Content-Type'] && options.body && typeof options.body === 'string' && !headers['__skip_json']) {
    // default JSON content type unless caller already set one
    if (!Object.keys(headers).some(k => k.toLowerCase() === 'content-type')) {
      headers['Content-Type'] = 'application/json';
    }
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  if (!res.ok) {
    let detail: unknown = undefined;
    let message = `Request failed: ${res.status}`;
    try {
      const data = await res.clone().json();
      detail = (data as { detail?: unknown })?.detail ?? data;
      if (typeof detail === 'string') message = detail;
    } catch {
      // not JSON
    }
    throw new ApiError(message, res.status, detail);
  }
  return res;
}

export async function apiJson<T>(
  path: string,
  options: RequestInit = {},
  token?: string | null,
): Promise<T> {
  const res = await apiFetch(path, options, token);
  return res.json() as Promise<T>;
}
