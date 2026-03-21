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
  /** Below Tailwind `md` (768px): expanded sidebar overlays content so the main area stays full width. */
  const isNarrow = useMediaQuery('(max-width: 767px)')

  const railWidth = 72
  const drawerWidth = 256
  // Desktop: always offset by sidebar width. Mobile: only offset when collapsed (icon rail); expanded = overlay → no offset.
  const mainMarginLeft = isNarrow ? (collapsed ? railWidth : 0) : collapsed ? railWidth : drawerWidth

  return (
    <div className="flex min-h-screen bg-[var(--app-bg)]">
      <Sidebar />
      {/* Tap area to the right of the expanded drawer; dims content on small screens */}
      {!collapsed && (
        <button
          type="button"
          aria-label="Close sidebar"
          className="fixed right-0 top-0 z-30 cursor-pointer border-0 bg-black/30 p-0 md:bg-transparent"
          style={{ left: drawerWidth, bottom: 0 }}
          onClick={() => setCollapsed(true)}
        />
      )}
      <div
        className="flex min-w-0 flex-1 flex-col transition-[margin-left] duration-200 ease-in-out"
        style={{ marginLeft: mainMarginLeft }}
      >
        <TopBar title={title} />
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
