import type { InAppNotification } from '@/types/api'
import { notificationTargetPath } from '@/lib/notificationDeepLink'

/** Unread counts per `Link` `to` path for sidebar badges. */
export function unreadNavBadgeCounts(notifications: InAppNotification[]): Record<string, number> {
  const out: Record<string, number> = {}
  for (const n of notifications) {
    if (n.read) continue
    const p = notificationTargetPath(n)
    if (p == null) continue
    out[p] = (out[p] ?? 0) + 1
  }
  return out
}

export function formatNavBadgeCount(n: number): string {
  if (n <= 0) return ''
  if (n > 99) return '99+'
  return String(n)
}
