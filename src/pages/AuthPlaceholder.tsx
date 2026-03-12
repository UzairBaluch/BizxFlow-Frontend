import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'

export interface AuthPlaceholderPageProps {
  type: 'login' | 'register'
}

export function AuthPlaceholderPage({ type }: AuthPlaceholderPageProps): React.ReactElement {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-[var(--app-bg)] px-4">
      <h1 className="font-display text-[22px] font-bold text-[var(--app-text)]">
        {type === 'login' ? 'Login' : 'Register'}
      </h1>
      <p className="font-body text-sm text-[var(--app-muted)]">
        Auth pages — placeholder. Use the buttons below to navigate.
      </p>
      <div className="flex gap-4">
        <Link to="/login">
          <Button variant="primary">Go to Login</Button>
        </Link>
        <Link to="/register">
          <Button variant="secondary">Go to Register</Button>
        </Link>
      </div>
      <Link to="/dashboard" className="font-body text-sm text-[var(--app-muted)] hover:text-[var(--app-text)]">
        Back to Dashboard
      </Link>
    </div>
  )
}
