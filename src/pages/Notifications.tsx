import { useAuth } from '@/context/AuthContext'
import { useNotifications } from '@/context/NotificationContext'
import { Card, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Bell } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { InAppNotification } from '@/types/api'
import { cn } from '@/lib/utils'

function formatWhen(iso: string | undefined): string {
  if (iso == null || iso === '') return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(d)
}

function typeLabel(type: string): string {
  return type.replace(/_/g, ' ').toLowerCase().replace(/^\w/, (c) => c.toUpperCase())
}

export function NotificationsPage(): React.ReactElement {
  const { accountType } = useAuth()
  const navigate = useNavigate()
  const { notifications, unreadCount, loading, refresh, markAsRead } = useNotifications()
  const isUser = accountType === 'user'

  function handleOpen(n: InAppNotification): void {
    if (!isUser) return
    const m = n.metadata
    if (m?.taskId) {
      void markAsRead(n._id)
      navigate('/tasks')
      return
    }
    if (m?.leaveId) {
      void markAsRead(n._id)
      navigate('/leave')
      return
    }
    if (m?.announcementId) {
      void markAsRead(n._id)
      navigate('/announcements')
      return
    }
    if (!n.read) void markAsRead(n._id)
  }

  if (!isUser) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--app-border)] text-[var(--app-muted)]">
            <Bell className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-display text-xl font-semibold tracking-tight text-[var(--app-text)]">Notifications</h1>
            <p className="font-body text-sm text-[var(--app-muted)]">Sign in as a team member to see in-app notifications.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--app-border)] text-[var(--app-muted)]">
            <Bell className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-display text-xl font-semibold tracking-tight text-[var(--app-text)]">Notifications</h1>
            <p className="font-body text-sm text-[var(--app-muted)]">
              {unreadCount > 0 ? `${unreadCount} unread · ` : ''}
              Live updates while you&apos;re signed in; history loads from the server.
            </p>
          </div>
        </div>
        <Button type="button" variant="secondary" size="sm" onClick={() => void refresh()} disabled={loading}>
          Refresh
        </Button>
      </div>

      <Card className="p-0 overflow-hidden">
        {loading && notifications.length === 0 ? (
          <div className="flex justify-center py-20">
            <div className="h-9 w-9 animate-spin rounded-full border-2 border-[var(--app-border)] border-t-[var(--app-text)]" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-10 text-center">
            <p className="font-body text-sm text-[var(--app-muted)]">No notifications yet.</p>
          </div>
        ) : (
          <ul className="divide-y divide-[var(--app-border)]">
            {notifications.map((n) => (
              <li key={n._id}>
                <div
                  className={cn(
                    'flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-start sm:justify-between sm:gap-4',
                    !n.read && 'bg-[var(--app-text)]/[0.04]'
                  )}
                >
                  <button
                    type="button"
                    onClick={() => handleOpen(n)}
                    className="min-w-0 flex-1 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--app-text)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--app-card)] rounded-lg -m-1 p-1"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-md bg-[var(--app-border)]/80 px-2 py-0.5 font-body text-[10px] font-semibold uppercase tracking-wide text-[var(--app-muted)]">
                        {typeLabel(n.type)}
                      </span>
                      {!n.read && (
                        <span className="font-body text-[10px] font-semibold uppercase tracking-wide text-[var(--app-text)]">
                          Unread
                        </span>
                      )}
                    </div>
                    <CardTitle className="mt-1.5 text-base">{n.title || 'Notification'}</CardTitle>
                    {n.body ? (
                      <p className="mt-1 font-body text-sm text-[var(--app-muted)]">{n.body}</p>
                    ) : null}
                    {formatWhen(n.createdAt) ? (
                      <p className="mt-2 font-body text-xs text-[var(--app-muted)]">{formatWhen(n.createdAt)}</p>
                    ) : null}
                  </button>
                  <div className="flex shrink-0 flex-wrap gap-2 sm:flex-col sm:items-stretch">
                    {!n.read ? (
                      <Button type="button" variant="secondary" size="sm" onClick={() => void markAsRead(n._id)}>
                        Mark read
                      </Button>
                    ) : null}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
}
