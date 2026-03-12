import { type ReactNode } from 'react'
import { motion } from 'framer-motion'
import { useSidebarStore } from '@/stores/useSidebarStore'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'

export interface AppLayoutProps {
  title: string
  children: ReactNode
}

export function AppLayout({ title, children }: AppLayoutProps): React.ReactElement {
  const collapsed = useSidebarStore((s) => s.collapsed)
  const sidebarWidth = collapsed ? 72 : 256

  return (
    <div className="flex min-h-screen bg-[var(--app-bg)]">
      <Sidebar />
      <div
        className="flex flex-1 flex-col transition-[margin] duration-200 ease-in-out"
        style={{ marginLeft: sidebarWidth }}
      >
        <TopBar title={title} />
        <motion.main
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="flex-1 overflow-auto p-7"
        >
          {children}
        </motion.main>
      </div>
    </div>
  )
}
