/**
 * Central API base URL — reads from env var so it works in production too.
 * In dev, Vite proxy forwards /api → localhost:8000
 */
export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export async function apiFetch(path: string, options?: RequestInit) {
  const url = path.startsWith('http') ? path : `${API_BASE}${path}`;
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const detail = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(detail?.detail || `HTTP ${res.status}`);
  }
  return res.json();
}
