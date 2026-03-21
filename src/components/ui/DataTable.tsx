import { type ReactNode } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface DataTableProps<T> {
  columns: { key: keyof T | string; header: string; render?: (row: T) => ReactNode }[]
  data: T[]
  keyExtractor: (row: T) => string
  rowDelay?: number
  emptyMessage?: string
  className?: string
}

export function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  keyExtractor,
  rowDelay = 0.03,
  emptyMessage = 'No data',
  className,
}: DataTableProps<T>): React.ReactElement {
  return (
    <div className={cn('w-full min-w-0 max-w-full overflow-x-auto', className)}>
      {/* Narrow viewports: horizontal scroll inside wrapper instead of clipping columns */}
      <table className="w-full min-w-[720px] border-collapse lg:min-w-full">
        <thead>
          <tr className="border-b border-[var(--app-border)]">
            {columns.map((col) => (
              <th
                key={String(col.key)}
                className="whitespace-nowrap px-3 py-2.5 text-left font-body text-[11px] font-medium uppercase tracking-[0.08em] text-[var(--app-muted)] sm:px-4 sm:py-3"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-3 py-8 text-center font-body text-sm text-[var(--app-muted)] sm:px-4"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, i) => (
              <motion.tr
                key={keyExtractor(row)}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2, delay: i * rowDelay }}
                className="h-12 border-b border-[var(--app-border)] font-body text-sm text-[var(--app-text)] transition hover:bg-[var(--app-card)]"
              >
                {columns.map((col) => (
                  <td key={String(col.key)} className="px-3 py-2.5 align-middle sm:px-4 sm:py-3">
                    {col.render
                      ? col.render(row)
                      : String(row[col.key as keyof T] ?? '')}
                  </td>
                ))}
              </motion.tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}

interface PaginationProps {
  page: number
  totalPages: number
  onPrev: () => void
  onNext: () => void
  className?: string
}

export function Pagination({ page, totalPages, onPrev, onNext, className }: PaginationProps): React.ReactElement {
  return (
    <div className={cn('mt-4 flex flex-wrap items-center justify-center gap-2 sm:justify-start sm:gap-3', className)}>
      <button
        type="button"
        onClick={onPrev}
        disabled={page <= 1}
        className="rounded-lg border border-[var(--app-border)] bg-[var(--app-card)] px-3 py-1.5 font-body text-sm text-[var(--app-text)] disabled:opacity-50 hover:bg-[var(--app-border)]"
      >
        Previous
      </button>
      <span className="font-body text-sm text-[var(--app-muted)]">
        Page {page} of {totalPages || 1}
      </span>
      <button
        type="button"
        onClick={onNext}
        disabled={page >= totalPages}
        className="rounded-lg border border-[var(--app-border)] bg-[var(--app-card)] px-3 py-1.5 font-body text-sm text-[var(--app-text)] disabled:opacity-50 hover:bg-[var(--app-border)]"
      >
        Next
      </button>
    </div>
  )
}
