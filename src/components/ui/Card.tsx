import { type ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface CardProps {
  className?: string
  children: ReactNode
}

export function Card({ className, children }: CardProps): React.ReactElement {
  return (
    <div
      className={cn(
        'rounded-lg border border-[var(--app-border)] bg-[var(--app-card)] p-5 dark:shadow-none',
        'shadow-sm',
        className
      )}
    >
      {children}
    </div>
  )
}

interface CardTitleProps {
  className?: string
  children: ReactNode
}

export function CardTitle({ className, children }: CardTitleProps): React.ReactElement {
  return (
    <h3 className={cn('font-display text-sm font-semibold tracking-[0.02em] text-[var(--app-text)]', className)}>
      {children}
    </h3>
  )
}
