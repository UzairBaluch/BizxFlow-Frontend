import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Moon, Sun } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'
import { useThemeStore } from '@/stores/useThemeStore'
import type { Role } from '@/types/api'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

const ROLES: { value: Role; label: string }[] = [
  { value: 'Employee', label: 'Employee' },
  { value: 'Manager', label: 'Manager' },
  { value: 'Admin', label: 'Admin' },
]

export function RegisterPage(): React.ReactElement {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [role, setRole] = useState<Role>('Employee')
  const [submitting, setSubmitting] = useState(false)
  const { register } = useAuth()
  const { addToast } = useToast()
  const navigate = useNavigate()
  const theme = useThemeStore((s) => s.theme)
  const toggleTheme = useThemeStore((s) => s.toggleTheme)

  async function handleSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault()
    setSubmitting(true)
    const result = await register(email, password, fullName, role)
    setSubmitting(false)
    if (result.ok) {
      addToast('Account created.')
      navigate('/dashboard', { replace: true })
    } else {
      addToast(result.message, 'error')
    }
  }

  return (
    <div className="flex min-h-screen min-h-[100dvh] items-center justify-center overflow-auto bg-[var(--app-bg)] px-4 py-8 sm:px-6 sm:py-10 md:py-12">
      <button
        type="button"
        onClick={toggleTheme}
        className="landing-theme-btn fixed right-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-lg text-[var(--app-muted)] transition-colors hover:bg-[var(--app-card)] hover:text-[var(--app-text)] sm:right-4 sm:top-4 sm:h-9 sm:w-9"
        aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
      </button>
      <div className="w-full max-w-md flex-1 py-4 sm:py-0">
        <div className="rounded-xl border border-[var(--app-border)] bg-[var(--app-card)] p-5 shadow-sm sm:rounded-2xl sm:p-6 md:p-8">
          <h1 className="text-center font-display text-xl font-bold tracking-tight text-[var(--app-text)] sm:text-2xl">
            Create account
          </h1>
          <p className="mt-1.5 text-center font-body text-sm text-[var(--app-muted)] sm:mt-2">BizxFlow</p>
          <form onSubmit={handleSubmit} className="mt-6 space-y-4 sm:mt-8 sm:space-y-5">
            <Input
              label="Email"
              id="reg-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
            />
            <Input
              label="Password"
              id="reg-password"
              type="password"
              autoComplete="new-password"
              required
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
            />
            <Input
              label="Full name"
              id="reg-fullName"
              type="text"
              required
              value={fullName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFullName(e.target.value)}
            />
            <div className="w-full">
              <label
                htmlFor="reg-role"
                className="mb-1.5 block font-body text-xs font-medium uppercase tracking-wider text-[var(--app-muted)]"
              >
                Role
              </label>
              <select
                id="reg-role"
                value={role}
                onChange={(e) => setRole(e.target.value as Role)}
                className="w-full rounded-lg border border-[var(--app-border)] bg-[var(--app-card)] px-3 py-3 font-body text-base text-[var(--app-text)] outline-none transition focus:border-[var(--app-text)] sm:py-2.5 sm:text-sm [min-height:2.75rem]"
              >
                {ROLES.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>
            <Button type="submit" variant="primary" className="w-full py-2.5 sm:py-2" loading={submitting} disabled={submitting}>
              {submitting ? 'Creating account…' : 'Register'}
            </Button>
          </form>
          <p className="mt-5 text-center font-body text-sm text-[var(--app-muted)] sm:mt-6">
            Already have an account?{' '}
            <Link to="/login" className="inline-block font-semibold text-[var(--app-text)] underline hover:no-underline [padding:0.25em_0]">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
