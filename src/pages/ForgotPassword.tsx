import { useState } from 'react'
import { Link } from 'react-router-dom'
import { auth } from '@/api/client'
import { useToast } from '@/context/ToastContext'
import { AuthOverLanding } from '@/components/AuthOverLanding'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export function ForgotPasswordPage(): React.ReactElement {
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [sent, setSent] = useState(false)
  const { addToast } = useToast()

  async function handleSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault()
    setSubmitting(true)
    setSent(false)
    const res = await auth.forgotPassword(email.trim())
    setSubmitting(false)
    if (res.success) {
      setSent(true)
      addToast('If that email is registered, you’ll receive a reset link.')
    } else {
      addToast((res as { message?: string }).message ?? 'Request failed', 'error')
    }
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
          Forgot password
        </h1>
        <p className="mt-1.5 text-center font-body text-xs text-[var(--app-muted)] sm:mt-2 sm:text-sm">
          Enter your email and we’ll send you a link to reset your password.
        </p>
        {sent ? (
          <div className="mt-6 rounded-lg border border-[var(--app-border)] bg-[var(--app-bg)] p-4 font-body text-sm text-[var(--app-text)] sm:mt-8">
            <p>Check your inbox for a reset link. It may take a few minutes.</p>
            <Link to="/login" className="mt-3 inline-block font-medium text-[var(--app-text)] underline hover:no-underline">
              Back to sign in
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-5 space-y-4 sm:mt-8 sm:space-y-5">
            <Input
              label="Email"
              id="forgot-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
            />
            <Button type="submit" variant="primary" className="w-full min-h-[44px] py-3 text-base sm:min-h-0 sm:py-2 sm:text-sm" loading={submitting} disabled={submitting}>
              {submitting ? 'Sending…' : 'Send reset link'}
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
