import { LandingPage } from '@/pages/Landing'

type Props = { children: React.ReactNode }

/**
 * Renders the full landing page as background with an overlay that shows the auth card (register/login) on top.
 */
export function AuthOverLanding({ children }: Props): React.ReactElement {
  return (
    <div className="relative min-h-screen min-h-[100dvh]">
      <LandingPage />
      <div
        className="fixed inset-0 z-[100] flex min-h-[100dvh] min-h-[100svh] items-center justify-center overflow-auto bg-[var(--app-bg)]/75 backdrop-blur-[2px] sm:py-10 md:py-12"
        style={{
          paddingLeft: 'max(12px, env(safe-area-inset-left))',
          paddingRight: 'max(12px, env(safe-area-inset-right))',
          paddingTop: 'max(24px, env(safe-area-inset-top))',
          paddingBottom: 'max(24px, env(safe-area-inset-bottom))',
        }}
      >
        <div className="w-full max-w-md flex-1 py-2 sm:py-0">{children}</div>
      </div>
    </div>
  )
}
