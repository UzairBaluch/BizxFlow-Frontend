import { forwardRef } from 'react'
import { motion, type HTMLMotionProps } from 'framer-motion'
import { cn } from '@/lib/utils'

export interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'size'> {
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'default' | 'sm' | 'lg'
  loading?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'default', loading = false, children, disabled, type = 'button', ...props }, ref) => {
    return (
      <motion.button
        ref={ref}
        type={type}
        className={cn(
          'inline-flex items-center justify-center rounded-[7px] font-body text-[13px] font-medium outline-none transition duration-150 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50',
          variant === 'primary' &&
            'bg-[var(--app-text)] text-[var(--app-bg)] hover:opacity-90 px-4 py-2',
          variant === 'secondary' &&
            'border border-[var(--app-border)] bg-transparent text-[var(--app-text)] hover:bg-[var(--app-card)] px-4 py-2',
          variant === 'ghost' &&
            'text-[var(--app-muted)] hover:bg-[var(--app-card)] hover:text-[var(--app-text)] px-4 py-2',
          size === 'sm' && 'px-3 py-1.5 text-xs',
          size === 'lg' && 'px-6 py-3 text-sm',
          className
        )}
        disabled={disabled || loading}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.1 }}
        {...props}
      >
        {loading ? (
          <span className="flex gap-0.5">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current [animation-delay:0ms]" />
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current [animation-delay:150ms]" />
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current [animation-delay:300ms]" />
          </span>
        ) : (
          children
        )}
      </motion.button>
    )
  }
)
Button.displayName = 'Button'
export { Button }
