import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { auth } from '@/api/client'
import { useToast } from '@/context/ToastContext'
import { AuthOverLanding } from '@/components/AuthOverLanding'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export function ResetPasswordPage(): React.ReactElement {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') ?? ''
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const { addToast } = useToast()
  const navigate = useNavigate()

  useEffect(() => {
    if (!token) addToast('Invalid or missing reset link.', 'error')
  }, [token, addToast])

  async function handleSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault()
    if (password !== confirm) {
      addToast('Passwords do not match.', 'error')
      return
    }
    if (password.length < 8) {
      addToast('Password must be at least 8 characters.', 'error')
      return
    }
    if (!token) return
    setSubmitting(true)
    setDone(false)
    const res = await auth.resetPassword(token, password)
    setSubmitting(false)
    if (res.success) {
      setDone(true)
      addToast('Password updated. You can sign in now.')
      setTimeout(() => navigate('/login', { replace: true }), 1500)
    } else {
      addToast((res as { message?: string }).message ?? 'Reset failed', 'error')
    }
  }

  if (!token) {
    return (
      <AuthOverLanding>
        <div className="relative rounded-xl border border-[var(--app-border)] bg-[var(--app-card)] p-4 shadow-lg sm:rounded-2xl sm:p-6 md:p-8">
          <h1 className="text-center font-display text-lg font-bold tracking-tight text-[var(--app-text)] sm:text-xl md:text-2xl">
            Invalid reset link
          </h1>
          <p className="mt-2 text-center font-body text-sm text-[var(--app-muted)]">
            This link is invalid or has expired. Request a new one from the sign-in page.
          </p>
          <p className="mt-6 text-center font-body text-sm">
            <Link to="/forgot-password" className="font-semibold text-[var(--app-text)] underline hover:no-underline">
              Forgot password
            </Link>
            {' · '}
            <Link to="/login" className="font-semibold text-[var(--app-text)] underline hover:no-underline">
              Sign in
            </Link>
          </p>
        </div>
      </AuthOverLanding>
    )
  }

  return (
    <AuthOverLanding>
      <div className="relative rounded-xl border border-[var(--app-border)] bg-[var(--app-card)] p-4 shadow-lg sm:rounded-2xl sm:p-6 md:p-8">
        <Link
          to="/login"
          aria-label="Back to sign in"
          className="absolute right-3 top-3 flex h-10 w-10 min-h-[44px] min-w-[44px] items-center justify-center rounded-lg text-[var(--app-muted)] transition-colors hover:bg-[var(--app-border)] hover:text-[var(--app-text)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--app-text)] focus-visible:ring-offset-2 sm:right-4 sm:top-4 sm:h-11 sm:w-11 sm:min-h-0 sm:min-w-0"
        >
          <span className="text-2xl leading-none sm:text-3xl">×</span>
        </Link>
        <h1 className="text-center font-display text-lg font-bold tracking-tight text-[var(--app-text)] sm:text-xl md:text-2xl">
          Set new password
        </h1>
        <p className="mt-1.5 text-center font-body text-xs text-[var(--app-muted)] sm:mt-2 sm:text-sm">
          Enter your new password below.
        </p>
        {done ? (
          <div className="mt-6 rounded-lg border border-[var(--app-border)] bg-[var(--app-bg)] p-4 font-body text-sm text-[var(--app-text)] sm:mt-8">
            <p>Password updated. Redirecting to sign in…</p>
            <Link to="/login" className="mt-3 inline-block font-medium text-[var(--app-text)] underline hover:no-underline">
              Sign in
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-5 space-y-4 sm:mt-8 sm:space-y-5">
            <Input
              label="New password"
              id="reset-password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
            />
            <Input
              label="Confirm new password"
              id="reset-confirm"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={confirm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirm(e.target.value)}
            />
            <Button type="submit" variant="primary" className="w-full min-h-[44px] py-3 text-base sm:min-h-0 sm:py-2 sm:text-sm" loading={submitting} disabled={submitting}>
              {submitting ? 'Updating…' : 'Update password'}
            </Button>
          </form>
        )}
        <p className="mt-4 text-center font-body text-xs text-[var(--app-muted)] sm:mt-6 sm:text-sm">
          <Link to="/login" className="inline-block font-semibold text-[var(--app-text)] underline hover:no-underline [padding:0.25em_0]">
            Back to sign in
          </Link>
        </p>
      </div>
    </AuthOverLanding>
  )
}
