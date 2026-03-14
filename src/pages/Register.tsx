import { useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'
import { AuthOverLanding } from '@/components/AuthOverLanding'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export function RegisterPage(): React.ReactElement {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { register } = useAuth()
  const { addToast } = useToast()
  const navigate = useNavigate()

  async function handleSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault()
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
      <div className="rounded-xl border border-[var(--app-border)] bg-[var(--app-card)] p-4 shadow-lg sm:rounded-2xl sm:p-6 md:p-8">
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
