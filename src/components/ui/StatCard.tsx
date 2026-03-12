import { type ReactNode } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

export interface StatCardProps {
  icon: ReactNode
  value: string | number
  label: string
  change?: string
  className?: string
  index?: number
}

export function StatCard({ icon, value, label, change, className, index = 0 }: StatCardProps): React.ReactElement {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut', delay: index * 0.06 }}
      className={cn(
        'rounded-lg border border-[var(--app-border)] bg-[var(--app-card)] p-5 transition hover:border-[var(--app-muted)] dark:shadow-none',
        'shadow-sm',
        className
      )}
    >
      <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--app-border)] text-[var(--app-muted)]">
        {icon}
      </div>
      <p className="mt-3 font-display text-[28px] font-extrabold leading-none text-[var(--app-text)] sm:text-[32px]">
        {value}
      </p>
      <p className="mt-1.5 font-body text-[11px] font-medium uppercase tracking-[0.08em] text-[var(--app-muted)]">
        {label}
      </p>
      {change != null && (
        <div className="mt-3 flex justify-end">
          <span className="rounded bg-[var(--app-border)] px-2 py-0.5 font-body text-[11px] text-[var(--app-muted)]">
            {change}
          </span>
        </div>
      )}
    </motion.div>
  )
}
