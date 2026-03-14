import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'
import { AuthOverLanding } from '@/components/AuthOverLanding'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export function LoginPage(): React.ReactElement {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { login } = useAuth()
  const { addToast } = useToast()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/dashboard'

  async function handleSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault()
    setSubmitting(true)
    const result = await login(email, password)
    setSubmitting(false)
    if (result.ok) {
      addToast('Signed in.')
      navigate(from, { replace: true })
    } else {
      addToast(result.message, 'error')
    }
  }

  return (
    <AuthOverLanding>
      <div className="rounded-xl border border-[var(--app-border)] bg-[var(--app-card)] p-5 shadow-lg sm:rounded-2xl sm:p-6 md:p-8">
        <h1 className="text-center font-display text-xl font-bold tracking-tight text-[var(--app-text)] sm:text-2xl">
          Sign in
        </h1>
        <p className="mt-1.5 text-center font-body text-sm text-[var(--app-muted)] sm:mt-2">BizxFlow</p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4 sm:mt-8 sm:space-y-5">
          <Input
            label="Email"
            id="login-email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
          />
          <Input
            label="Password"
            id="login-password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
          />
          <Button type="submit" variant="primary" className="w-full py-2.5 sm:py-2" loading={submitting} disabled={submitting}>
            {submitting ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>
        <p className="mt-5 text-center font-body text-sm text-[var(--app-muted)] sm:mt-6">
          No account?{' '}
          <Link to="/register" className="inline-block font-semibold text-[var(--app-text)] underline hover:no-underline [padding:0.25em_0]">
            Register
          </Link>
        </p>
      </div>
    </AuthOverLanding>
  )
}
