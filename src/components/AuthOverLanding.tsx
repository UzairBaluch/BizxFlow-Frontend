import { LandingPage } from '@/pages/Landing'

type Props = { children: React.ReactNode }

/**
 * Renders the full landing page as background with an overlay that shows the auth card (register/login) on top.
 */
export function AuthOverLanding({ children }: Props): React.ReactElement {
  return (
    <div className="relative min-h-screen">
      <LandingPage />
      <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-auto bg-[var(--app-bg)]/75 px-4 py-8 backdrop-blur-[2px] sm:px-6 sm:py-10 md:py-12">
        <div className="w-full max-w-md flex-1 py-4 sm:py-0">{children}</div>
      </div>
    </div>
  )
}
