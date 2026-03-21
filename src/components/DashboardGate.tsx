import { Navigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { canAccessDashboard } from '@/lib/authAccess'

/**
 * Employees cannot access the dashboard route; send them to Tasks.
 * Company + Admin/Manager pass through.
 */
export function DashboardGate({ children }: { children: React.ReactNode }): React.ReactElement {
  const { user, accountType } = useAuth()
  if (!canAccessDashboard(accountType, user)) {
    return <Navigate to="/tasks" replace />
  }
  return <>{children}</>
}
