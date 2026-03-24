import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Bell } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useNotifications } from '@/context/NotificationContext'
import type { InAppNotification } from '@/types/api'
import { cn } from '@/lib/utils'

const DROPDOWN_LIMIT = 12

function formatWhen(iso: string | undefined): string {
  if (iso == null || iso === '') return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }).format(d)
}

export type NotificationBellProps = {
  /** Merged onto the icon button (e.g. `rounded-none` when grouped with theme toggle). */
  buttonClassName?: string
}

export function NotificationBell({ buttonClassName }: NotificationBellProps): React.ReactElement | null {
  const { user, company } = useAuth()
  const navigate = useNavigate()
  const { notifications, unreadCount, markAsRead } = useNotifications()
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  const close = useCallback(() => setOpen(false), [])

  useEffect(() => {
    if (!open) return
    function onDocMouseDown(e: MouseEvent): void {
      if (rootRef.current?.contains(e.target as Node)) return
      setOpen(false)
    }
    function onKey(e: KeyboardEvent): void {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDocMouseDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDocMouseDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const handleItemClick = useCallback(
    (n: InAppNotification): void => {
      const m = n.metadata
      if (m?.taskId) {
        void markAsRead(n._id)
        close()
        navigate('/tasks')
        return
      }
      if (m?.leaveId) {
        void markAsRead(n._id)
        close()
        navigate('/leave')
        return
      }
      if (m?.announcementId) {
        void markAsRead(n._id)
        close()
        navigate('/announcements')
        return
      }
      if (!n.read) void markAsRead(n._id)
      close()
      navigate('/notifications')
    },
    [markAsRead, navigate, close]
  )

  if (!(user != null && company == null)) return null

  const preview = notifications.slice(0, DROPDOWN_LIMIT)

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'relative flex h-9 w-9 min-h-[44px] min-w-[44px] shrink-0 items-center justify-center overflow-visible rounded-lg text-[var(--app-muted)] transition hover:bg-[var(--app-border)]/50 hover:text-[var(--app-text)] sm:min-h-0 sm:min-w-0',
          open && 'bg-[var(--app-border)]/40 text-[var(--app-text)]',
          buttonClassName
        )}
        aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : 'Notifications'}
        aria-expanded={open}
        aria-haspopup="true"
      >
        <Bell className="relative z-0 h-[1.15rem] w-[1.15rem] shrink-0 sm:h-5 sm:w-5" aria-hidden />
        {unreadCount > 0 ? (
          <span
            className={cn(
              'pointer-events-none absolute right-px top-px z-[1] box-border flex h-3 min-w-3 items-center justify-center rounded-full sm:right-0.5 sm:top-0.5 sm:h-3.5 sm:min-w-3.5',
              'border border-[var(--app-border)] bg-[var(--app-text)] font-mono text-[7px] font-bold tabular-nums leading-none text-[var(--app-bg)] sm:text-[8px]',
              'shadow-sm',
              unreadCount > 9 && 'min-w-[1rem] px-0.5 sm:min-w-[1.125rem]'
            )}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <div
          className={cn(
            'z-[60] overflow-hidden rounded-xl border border-[var(--app-border)] bg-[var(--app-card)] shadow-lg',
            'fixed left-3 right-3 top-[calc(3.25rem+env(safe-area-inset-top,0px))] mx-auto max-h-[min(72vh,28rem)] w-auto max-w-[22rem] sm:max-h-[min(60vh,20rem)]',
            'sm:absolute sm:left-auto sm:right-0 sm:top-full sm:mx-0 sm:mt-2 sm:max-h-[min(60vh,20rem)] sm:w-[min(100vw-1.5rem,22rem)]'
          )}
          role="menu"
        >
          <div className="border-b border-[var(--app-border)] px-4 py-3">
            <p className="font-display text-sm font-semibold text-[var(--app-text)]">Notifications</p>
            <p className="mt-0.5 font-body text-xs text-[var(--app-muted)]">
              {unreadCount > 0 ? `${unreadCount} unread` : 'You’re caught up'}
            </p>
          </div>
          <ul className="max-h-[min(60vh,20rem)] overflow-y-auto">
            {preview.length === 0 ? (
              <li className="px-4 py-8 text-center font-body text-sm text-[var(--app-muted)]">No notifications yet</li>
            ) : (
              preview.map((n) => (
                <li key={n._id} className="border-b border-[var(--app-border)] last:border-b-0">
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => handleItemClick(n)}
                    className={cn(
                      'flex w-full flex-col gap-0.5 px-4 py-3 text-left transition hover:bg-[var(--app-bg)] focus:bg-[var(--app-bg)] focus:outline-none',
                      !n.read && 'bg-[var(--app-text)]/[0.06]'
                    )}
                  >
                    <span className="flex items-center gap-2">
                      {!n.read ? (
                        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--app-text)]" aria-hidden />
                      ) : (
                        <span className="w-1.5 shrink-0" aria-hidden />
                      )}
                      <span className="min-w-0 flex-1 truncate font-body text-sm font-medium text-[var(--app-text)]">
                        {n.title || 'Notification'}
                      </span>
                    </span>
                    {n.body ? (
                      <span className="line-clamp-2 pl-3.5 font-body text-xs text-[var(--app-muted)]">{n.body}</span>
                    ) : null}
                    {formatWhen(n.createdAt) ? (
                      <span className="pl-3.5 font-body text-[10px] text-[var(--app-muted)]">{formatWhen(n.createdAt)}</span>
                    ) : null}
                  </button>
                </li>
              ))
            )}
          </ul>
          <div className="border-t border-[var(--app-border)] p-2">
            <Link
              to="/notifications"
              onClick={close}
              className="block rounded-lg px-3 py-2 text-center font-body text-sm font-medium text-[var(--app-text)] hover:bg-[var(--app-bg)]"
            >
              Show all notifications
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  )
}
