import { Menu, Moon, Sun } from 'lucide-react'
import { useThemeStore } from '@/stores/useThemeStore'
import { useAuth } from '@/context/AuthContext'
import { NotificationBell } from '@/components/layout/NotificationBell'

export interface TopBarProps {
  title: string
  /** When set (mobile layout), shows menu control to open/close the sidebar drawer. */
  onMenuClick?: () => void
  /** For aria-expanded when mobile menu is used */
  menuOpen?: boolean
}

export function TopBar({ title, onMenuClick, menuOpen }: TopBarProps): React.ReactElement {
  const theme = useThemeStore((s) => s.theme)
  const toggleTheme = useThemeStore((s) => s.toggleTheme)
  const { user, company } = useAuth()
  const withNotificationBell = user != null && company == null

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between gap-2 overflow-visible border-b border-[var(--app-border)] bg-[var(--app-bg)] px-3 py-2.5 sm:h-14 sm:py-0 sm:gap-4 sm:px-5 md:px-7">
      <div
        className={
          onMenuClick != null
            ? 'flex min-w-0 flex-1 items-center gap-0'
            : 'flex min-w-0 flex-1 items-center gap-2 sm:gap-3'
        }
      >
        {onMenuClick != null && (
          <button
            type="button"
            onClick={onMenuClick}
            className="-mr-1 flex h-9 w-9 min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-lg text-[var(--app-muted)] transition hover:bg-[var(--app-card)] hover:text-[var(--app-text)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--app-text)] sm:min-h-0 sm:min-w-0"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen ?? false}
          >
            <Menu className="h-5 w-5" />
          </button>
        )}
        <h1 className="min-w-0 truncate font-display text-lg font-bold text-[var(--app-text)] sm:text-xl md:text-[22px]">{title}</h1>
      </div>
      {/* Single pill: notifications + theme (not spaced separately from the title edge — one control group). */}
      {/* overflow-visible so the notification count badge is not clipped on mobile (was overflow-hidden). */}
      <div className="flex shrink-0 items-center overflow-visible rounded-xl border border-[var(--app-border)] bg-[var(--app-card)] py-1 shadow-sm sm:py-0">
        {withNotificationBell ? (
          <>
            <NotificationBell buttonClassName="rounded-none border-0" />
            <span className="w-px shrink-0 self-stretch bg-[var(--app-border)]" aria-hidden />
          </>
        ) : null}
        <button
          type="button"
          onClick={toggleTheme}
          className="flex h-9 w-9 min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-none border-0 text-[var(--app-muted)] transition hover:bg-[var(--app-border)]/50 hover:text-[var(--app-text)] sm:min-h-0 sm:min-w-0"
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>
      </div>
    </header>
  )
}
