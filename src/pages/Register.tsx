import { useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'
import { auth } from '@/api/client'
import { AuthOverLanding } from '@/components/AuthOverLanding'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

const MIN_PASSWORD_LENGTH = 8

export function RegisterPage(): React.ReactElement {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { register } = useAuth()
  const { addToast } = useToast()
  const navigate = useNavigate()

  async function validatePassword(value: string): Promise<string | null> {
    if (!value.trim()) return null
    if (value.length < MIN_PASSWORD_LENGTH) {
      return `Password must be at least ${MIN_PASSWORD_LENGTH} characters`
    }
    const res = await auth.validatePassword(value)
    if (res.success) return null
    const err = res as { message?: string; status?: number }
    if (err.status === 404 || (err.status && err.status >= 500)) return null
    return err.message ?? 'Password does not meet requirements'
  }

  async function handlePasswordBlur(): Promise<void> {
    if (!password) return
    const err = await validatePassword(password)
    setPasswordError(err)
  }

  async function handleSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault()
    setPasswordError(null)
    const pwdErr = await validatePassword(password)
    if (pwdErr) {
      setPasswordError(pwdErr)
      return
    }
    setSubmitting(true)
    const result = await register(email, password, companyName, logoFile ?? undefined)
    setSubmitting(false)
    if (result.ok) {
      addToast('Company created. Welcome!')
      setTimeout(() => navigate('/dashboard', { replace: true }), 0)
    } else {
      addToast(result.message, 'error')
    }
  }

  return (
    <AuthOverLanding>
      <div className="relative rounded-xl border border-[var(--app-border)] bg-[var(--app-card)] p-4 shadow-lg sm:rounded-2xl sm:p-6 md:p-8">
        <Link
          to="/"
          aria-label="Close"
          className="absolute right-3 top-3 flex h-10 w-10 min-h-[44px] min-w-[44px] items-center justify-center rounded-lg text-[var(--app-muted)] transition-colors hover:bg-[var(--app-border)] hover:text-[var(--app-text)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--app-text)] focus-visible:ring-offset-2 sm:right-4 sm:top-4 sm:h-11 sm:w-11 sm:min-h-0 sm:min-w-0"
        >
          <span className="text-2xl leading-none sm:text-3xl">×</span>
        </Link>
        <h1 className="text-center font-display text-lg font-bold tracking-tight text-[var(--app-text)] sm:text-xl md:text-2xl">
          Create company account
        </h1>
        <p className="mt-1.5 text-center font-body text-xs text-[var(--app-muted)] sm:mt-2 sm:text-sm">
          Sign up your company. You can add users later.
        </p>
        <form onSubmit={handleSubmit} className="mt-5 space-y-4 sm:mt-8 sm:space-y-5">
          <Input
            label="Email"
            id="reg-email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
          />
          <div>
            <Input
              label="Password"
              id="reg-password"
              type="password"
              autoComplete="new-password"
              required
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setPassword(e.target.value)
                if (passwordError) setPasswordError(null)
              }}
              onBlur={handlePasswordBlur}
            />
            {passwordError && (
              <p className="mt-1 font-body text-xs text-red-500" role="alert">
                {passwordError}
              </p>
            )}
          </div>
          <Input
            label="Company name"
            id="reg-companyName"
            type="text"
            required
            value={companyName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCompanyName(e.target.value)}
          />
          <div className="w-full">
            <label
              htmlFor="reg-logo"
              className="mb-1.5 block font-body text-xs font-medium uppercase tracking-wider text-[var(--app-muted)]"
            >
              Logo (optional)
            </label>
            <input
              id="reg-logo"
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="w-full rounded-lg border border-[var(--app-border)] bg-[var(--app-card)] px-3 py-3 font-body text-sm text-[var(--app-text)] file:mr-2 file:min-h-[44px] file:rounded file:border-0 file:bg-[var(--app-text)] file:px-4 file:py-2 file:text-[var(--app-bg)] file:text-sm sm:py-2.5"
              onChange={(e) => setLogoFile(e.target.files?.[0] ?? null)}
            />
          </div>
          <Button type="submit" variant="primary" className="w-full min-h-[44px] py-3 text-base sm:min-h-0 sm:py-2 sm:text-sm" loading={submitting} disabled={submitting}>
            {submitting ? 'Creating company…' : 'Create company'}
          </Button>
        </form>
        <p className="mt-4 text-center font-body text-xs text-[var(--app-muted)] sm:mt-6 sm:text-sm">
          Already have an account?{' '}
          <Link to="/login" className="inline-block font-semibold text-[var(--app-text)] underline hover:no-underline [padding:0.25em_0]">
            Sign in
          </Link>
        </p>
      </div>
    </AuthOverLanding>
  )
}
