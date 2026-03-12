import { Moon, Sun, PanelLeftClose, PanelLeft } from 'lucide-react'
import { useThemeStore } from '@/stores/useThemeStore'
import { useSidebarStore } from '@/stores/useSidebarStore'
import { useAuth } from '@/context/AuthContext'

export interface TopBarProps {
  title: string
}

export function TopBar({ title }: TopBarProps): React.ReactElement {
  const theme = useThemeStore((s) => s.theme)
  const toggleTheme = useThemeStore((s) => s.toggleTheme)
  const collapsed = useSidebarStore((s) => s.collapsed)
  const toggleSidebar = useSidebarStore((s) => s.toggle)
  const { user } = useAuth()

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-4 border-b border-[var(--app-border)] bg-[var(--app-bg)] px-7">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <button
          type="button"
          onClick={toggleSidebar}
          className="landing-theme-btn flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[var(--app-muted)] transition-colors hover:bg-[var(--app-card)] hover:text-[var(--app-text)]"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <PanelLeft className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
        </button>
        <h1 className="truncate font-display text-[22px] font-bold text-[var(--app-text)]">{title}</h1>
      </div>
      <div className="flex shrink-0 items-center gap-4">
        <button
          type="button"
          onClick={toggleTheme}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-[var(--app-muted)] transition hover:bg-[var(--app-card)] hover:text-[var(--app-text)]"
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>
        <div className="h-8 w-8 overflow-hidden rounded-full border border-[var(--app-border)] bg-[var(--app-card)]">
          {user?.profilePicture ? (
            <img src={user.profilePicture} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="flex h-full w-full items-center justify-center font-body text-xs font-medium text-[var(--app-muted)]">
              {(user?.fullName ?? '?').charAt(0)}
            </span>
          )}
        </div>
      </div>
    </header>
  )
}
