import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s/g, '-')
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="mb-1.5 block font-body text-xs font-medium uppercase tracking-wider text-[var(--app-muted)]"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'w-full rounded-lg border bg-[var(--app-card)] px-3 py-2.5 font-body text-sm text-[var(--app-text)] placeholder:text-[var(--app-muted)] outline-none transition focus:border-[var(--app-text)]',
            error ? 'border-dashed border-[var(--app-muted)]' : 'border-[var(--app-border)]',
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-1.5 font-body text-xs text-[var(--app-muted)]" style={{ color: 'hsl(0 30% 55%)' }}>
            {error}
          </p>
        )}
      </div>
    )
  }
)
Input.displayName = 'Input'
export { Input }
