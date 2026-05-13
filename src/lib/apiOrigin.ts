/**
 * HTTP API base (no trailing slash). `src/api/client.ts` appends `/api/v1/users/...`.
 */
const DEFAULT_API = 'https://bizxflow-production.up.railway.app';

function trimBase(raw: string): string {
  return raw.replace(/\/$/, '');
}

const envBase = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim() ?? '';

/**
 * In development, leave `VITE_API_BASE_URL` unset so requests use same-origin `/api/...`
 * and Vite proxies to the real API (avoids browser CORS on preflight).
 * In production builds, set `VITE_API_BASE_URL` to your API origin, or the bundled default below is used.
 */
export const API_ORIGIN =
  envBase.length > 0
    ? trimBase(envBase)
    : import.meta.env.DEV
      ? ''
      : trimBase(DEFAULT_API);

/**
 * Socket.io must connect to **origin** (scheme + host + port). If `VITE_API_BASE_URL`
 * includes a path (e.g. `https://api.example.com/api/v1`), strip it so the default
 * `/socket.io` handshake hits the server root.
 */
export function getSocketOrigin(): string {
  const raw = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim();
  if (raw != null && raw !== '') {
    if (raw.startsWith('/')) {
      if (typeof window !== 'undefined') return window.location.origin;
      return 'http://localhost:5173';
    }
    try {
      const withProtocol = raw.startsWith('http') ? raw : `https://${raw}`;
      return new URL(withProtocol).origin;
    } catch {
      return API_ORIGIN.split('/').slice(0, 3).join('/') || API_ORIGIN;
    }
  }
  if (import.meta.env.DEV) {
    if (typeof window !== 'undefined') return window.location.origin;
    return 'http://localhost:5173';
  }
  try {
    return new URL(DEFAULT_API.startsWith('http') ? DEFAULT_API : `https://${DEFAULT_API}`).origin;
  } catch {
    return trimBase(DEFAULT_API);
  }
}
