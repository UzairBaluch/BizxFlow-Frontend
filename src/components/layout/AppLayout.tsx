import { type ReactNode } from 'react'
import { motion } from 'framer-motion'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { useSidebarStore } from '@/stores/useSidebarStore'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'

export interface AppLayoutProps {
  title: string
  children: ReactNode
}

export function AppLayout({ title, children }: AppLayoutProps): React.ReactElement {
  const collapsed = useSidebarStore((s) => s.collapsed)
  const setCollapsed = useSidebarStore((s) => s.setCollapsed)
  const toggleSidebar = useSidebarStore((s) => s.toggle)
  /** Below `md` (768px): sidebar is off-canvas (hidden when collapsed); no persistent rail. */
  const isNarrow = useMediaQuery('(max-width: 767px)')

  const railWidth = 72
  const drawerWidth = 256
  // Mobile: content always full width. Desktop: offset by rail or drawer.
  const mainMarginLeft = isNarrow ? 0 : collapsed ? railWidth : drawerWidth

  return (
    <div className="flex min-h-screen bg-[var(--app-bg)]">
      <Sidebar />
      {/* Mobile: full-screen scrim when menu open. Desktop: click strip to the right of drawer */}
      {!collapsed && (
        <button
          type="button"
          aria-label="Close sidebar"
          className={isNarrow ? 'fixed inset-0 z-40 cursor-pointer border-0 bg-black/40 p-0' : 'fixed right-0 top-0 z-30 cursor-pointer border-0 bg-black/30 p-0 md:bg-transparent'}
          style={isNarrow ? undefined : { left: drawerWidth, bottom: 0 }}
          onClick={() => setCollapsed(true)}
        />
      )}
      <div
        className="flex min-w-0 flex-1 flex-col transition-[margin-left] duration-200 ease-in-out"
        style={{ marginLeft: mainMarginLeft }}
      >
        <TopBar title={title} onMenuClick={isNarrow ? () => toggleSidebar() : undefined} menuOpen={isNarrow ? !collapsed : undefined} />
        <motion.main
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="min-w-0 flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-5 md:p-7"
        >
          {children}
        </motion.main>
      </div>
    </div>
  )
}
