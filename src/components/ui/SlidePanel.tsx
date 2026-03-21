import { type ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

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
      {open ? (
        <motion.div
          key="slide-panel-root"
          className="fixed inset-0 z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden
          />
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className={cn(
              'absolute right-0 top-0 flex h-[100dvh] max-h-[100dvh] w-full max-w-[min(100vw,400px)] flex-col border-l border-[var(--app-border)] bg-[var(--app-card)] shadow-xl',
              'pt-[max(1.25rem,env(safe-area-inset-top))] pr-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pl-5 sm:max-w-[400px]',
              className
            )}
            role="dialog"
            aria-modal="true"
            aria-labelledby="panel-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex shrink-0 items-start justify-between gap-3">
              <h2
                id="panel-title"
                className="min-w-0 flex-1 break-words font-display text-base font-bold text-[var(--app-text)]"
              >
                {title}
              </h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="flex h-10 w-10 min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-lg text-[var(--app-muted)] transition-colors hover:bg-[var(--app-border)] hover:text-[var(--app-text)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--app-text)] focus-visible:ring-offset-2 sm:h-11 sm:w-11 sm:min-h-0 sm:min-w-0"
              >
                <span className="text-2xl leading-none sm:text-3xl">×</span>
              </button>
            </div>
            <div className="mt-6 min-h-0 flex-1 overflow-y-auto overflow-x-hidden [-webkit-overflow-scrolling:touch]">
              {children}
            </div>
          </motion.aside>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
