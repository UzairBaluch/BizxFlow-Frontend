/**
 * Cookie-aware API + Socket.io: `include` matches backend httpOnly refresh/access cookies.
 * `VITE_FETCH_CREDENTIALS=omit` for Bearer-only debugging.
 */
export function fetchCredentials(): RequestCredentials {
  const v = (import.meta.env.VITE_FETCH_CREDENTIALS as string | undefined)?.trim().toLowerCase();
  if (v === 'omit') return 'omit';
  return 'include';
}
