import { Moon, Sun } from 'lucide-react'
import { useThemeStore } from '@/stores/useThemeStore'

export interface TopBarProps {
  title: string
}

export function TopBar({ title }: TopBarProps): React.ReactElement {
  const theme = useThemeStore((s) => s.theme)
  const toggleTheme = useThemeStore((s) => s.toggleTheme)

  return (
    <header className="sticky top-0 z-30 flex h-12 min-h-[44px] items-center justify-between gap-2 border-b border-[var(--app-border)] bg-[var(--app-bg)] px-3 sm:h-14 sm:gap-4 sm:px-5 md:px-7">
      <div className="flex min-w-0 flex-1 items-center">
        <h1 className="truncate font-display text-lg font-bold text-[var(--app-text)] sm:text-xl md:text-[22px]">{title}</h1>
      </div>
      <div className="flex shrink-0 items-center">
        <button
          type="button"
          onClick={toggleTheme}
          className="flex h-9 w-9 min-h-[44px] min-w-[44px] items-center justify-center rounded-lg text-[var(--app-muted)] transition hover:bg-[var(--app-card)] hover:text-[var(--app-text)] sm:min-h-0 sm:min-w-0"
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>
      </div>
    </header>
  )
}
