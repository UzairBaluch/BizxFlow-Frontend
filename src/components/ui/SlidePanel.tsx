import { type ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Button } from './Button'

export interface SlidePanelProps {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  className?: string
}

export function SlidePanel({ open, onClose, title, children, className }: SlidePanelProps): React.ReactElement {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden
          />
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className={cn(
              'fixed right-0 top-0 z-50 h-full w-full max-w-[400px] border-l border-[var(--app-border)] bg-[var(--app-card)] p-5 shadow-xl',
              className
            )}
            role="dialog"
            aria-modal="true"
            aria-labelledby="panel-title"
          >
            <div className="flex items-start justify-between gap-4">
              <h2 id="panel-title" className="font-display text-base font-bold text-[var(--app-text)]">
                {title}
              </h2>
              <Button variant="ghost" size="sm" onClick={onClose} aria-label="Close">
                ×
              </Button>
            </div>
            <div className="mt-6 overflow-y-auto">{children}</div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
