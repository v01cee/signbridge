import { apiFetch, apiJson, BASE_URL } from './client';
import type { User } from '../types';

export async function login(email: string, password: string): Promise<string> {
  const body = new URLSearchParams({ username: email, password });
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Ошибка входа');
  }
  const data = await res.json();
  return data.access_token as string;
}

export async function register(
  email: string,
  username: string,
  password: string,
): Promise<User> {
  return apiJson<User>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, username, password }),
  });
}

export async function fetchMe(token: string): Promise<User> {
  const res = await apiFetch('/auth/me', {}, token);
  return res.json() as Promise<User>;
}
