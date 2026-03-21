import { Navigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

export function ProtectedRoute({ children }: { children: React.ReactNode }): React.ReactElement {
  const { user, company, accountType, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--app-bg)]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--app-border)] border-t-[var(--app-text)]" />
      </div>
    )
  }

  if (!user && !company) {
    return <Navigate to="/" replace />
  }

  /** Block inconsistent session (e.g. user JWT but /me returned no user). */
  if (accountType === 'user' && !user) {
    return <Navigate to="/" replace />
  }
  if (accountType === 'company' && !company) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
