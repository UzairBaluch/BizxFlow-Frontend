import type { AccountType, User } from '@/types/api'

/** Case-insensitive: Manager only. Legacy API `Admin` is treated as Manager. */
export function isManagerRole(role: string | undefined): boolean {
  if (role == null) return false
  const r = role.trim().toLowerCase()
  return r === 'manager' || r === 'admin'
}

/** @deprecated Use `isManagerRole` */
export const isAdminOrManagerRole = isManagerRole

/** Company JWT or Manager user — matches GET /dashboard access. */
export function canAccessDashboard(accountType: AccountType | null, user: User | null): boolean {
  if (accountType === 'company') return true
  if (accountType === 'user' && user != null) {
    return isManagerRole(user.role)
  }
  return false
}

/** Home route after sign-in when no specific `from` path is provided. */
export function defaultHomePath(accountType: AccountType | null, user: User | null): string {
  return canAccessDashboard(accountType, user) ? '/dashboard' : '/tasks'
}

/**
 * Where to send the user right after login.
 * Employees never land on `/dashboard` (bookmark / stale `from` state).
 */
export function resolvePostLoginPath(
  accountType: AccountType,
  user: User | null,
  fromPath: string | undefined
): string {
  const fallback = defaultHomePath(accountType, user)
  if (fromPath == null || fromPath === '' || fromPath === '/login' || fromPath === '/register') {
    return fallback
  }
  if (!canAccessDashboard(accountType, user)) {
    if (fromPath === '/dashboard' || fromPath.startsWith('/dashboard/')) {
      return '/tasks'
    }
  }
  return fromPath
}
