import { cn } from '@/lib/utils'

type BorderStyle = 'solid' | 'dashed' | 'dotted'

const styleMap: Record<string, BorderStyle> = {
  Present: 'solid',
  Absent: 'dashed',
  Pending: 'dotted',
  Approved: 'solid',
  Rejected: 'dashed',
}

export interface StatusBadgeProps {
  status: string
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps): React.ReactElement {
  const borderStyle = styleMap[status] ?? 'solid'
  return (
    <span
      className={cn(
        'inline-flex rounded-full border px-2 py-0.5 font-body text-[11px] font-medium uppercase tracking-[0.08em] text-[var(--app-muted)]',
        borderStyle === 'solid' && 'border-[var(--app-border)]',
        borderStyle === 'dashed' && 'border-dashed border-[var(--app-muted)]',
        borderStyle === 'dotted' && 'border-dotted border-[var(--app-muted)]',
        className
      )}
    >
      {status}
    </span>
  )
}
