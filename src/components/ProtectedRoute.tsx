import { Navigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

export function ProtectedRoute({ children }: { children: React.ReactNode }): React.ReactElement {
  const { user, company, accountType, loading, token } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--app-bg)]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--app-border)] border-t-[var(--app-text)]" />
      </div>
    )
  }

  const hasToken = token != null && token.length > 0

  if (accountType === 'user') {
    if (user != null) return <>{children}</>
    return <Navigate to="/" replace />
  }

  if (accountType === 'company') {
    if (company != null || hasToken) return <>{children}</>
    return <Navigate to="/" replace />
  }

  if (user != null || company != null) {
    return <>{children}</>
  }

  return <Navigate to="/" replace />
}
