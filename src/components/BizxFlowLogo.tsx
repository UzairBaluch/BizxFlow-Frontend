import { useThemeStore } from '@/stores/useThemeStore'
import { cn } from '@/lib/utils'

const LOGO_LIGHT = '/logos/bizxflow-logo-light.png'
const LOGO_DARK = '/logos/bizxflow-logo-dark.png'

/** Preset sizes: no borders, consistent scaling. */
const SIZE_PRESETS = { sm: 20, md: 28, lg: 36 } as const

export interface BizxFlowLogoProps {
  /** Preset: sm (20px), md (28px), lg (36px). Use for consistent sizing. */
  size?: keyof typeof SIZE_PRESETS
  /** Or set exact height in px (ignored if size is set). */
  height?: number
  /** Optional class for the wrapper. */
  className?: string
  /** Show "BizxFlow" text next to logo (e.g. when sidebar expanded). */
  showText?: boolean
  /** If true, show text-only (no image). Use when logo assets have borders/wrong size. */
  textOnly?: boolean
}

/**
 * BizxFlow logo by theme: light logo on light theme, dark logo on dark theme.
 * Image has no border; use size presets or height for consistent display.
 */
export function BizxFlowLogo({
  size,
  height,
  className,
  showText = false,
  textOnly = false,
}: BizxFlowLogoProps): React.ReactElement {
  const theme = useThemeStore((s) => s.theme)
  const h = size ? SIZE_PRESETS[size] : (height ?? 28)

  if (textOnly) {
    return (
      <span className={cn('inline-flex items-center gap-2', className)}>
        <span
          className="font-display font-bold tracking-tight text-[var(--app-text)]"
          style={{ fontSize: Math.round(h * 0.9) }}
        >
          BizxFlow
        </span>
      </span>
    )
  }

  const src = theme === 'dark' ? LOGO_DARK : LOGO_LIGHT
  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <img
        src={src}
        alt=""
        role="presentation"
        className="block shrink-0 object-contain object-left"
        style={{
          height: h,
          width: 'auto',
          maxWidth: 'none',
          border: 0,
          outline: 'none',
          verticalAlign: 'middle',
        }}
      />
      {showText && (
        <span className="font-display text-lg font-bold tracking-tight text-[var(--app-text)] whitespace-nowrap">
          BizxFlow
        </span>
      )}
    </span>
  )
}
