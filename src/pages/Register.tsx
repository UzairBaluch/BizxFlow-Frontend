import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import type { Role } from '../types/api';

const ROLES: { value: Role; label: string }[] = [
  { value: 'employee', label: 'Employee' },
  { value: 'manager', label: 'Manager' },
  { value: 'admin', label: 'Admin' },
];

export function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<Role>('employee');
  const [submitting, setSubmitting] = useState(false);
  const { register } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const ok = await register(email, password, fullName, role);
    setSubmitting(false);
    if (ok) {
      addToast('Account created.');
      navigate('/dashboard', { replace: true });
    } else {
      addToast('Registration failed. Email may be in use.', 'error');
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm">
          <h1 className="text-center text-2xl font-bold tracking-tight text-black">Create account</h1>
          <p className="mt-2 text-center text-sm text-neutral-500">BizxFlow</p>
          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label htmlFor="reg-email" className="block text-sm font-medium text-neutral-700">
                Email
              </label>
              <input
                id="reg-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-2.5 text-black focus:border-black focus:outline-none focus:ring-2 focus:ring-neutral-200"
              />
            </div>
            <div>
              <label htmlFor="reg-password" className="block text-sm font-medium text-neutral-700">
                Password
              </label>
              <input
                id="reg-password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-2.5 text-black focus:border-black focus:outline-none focus:ring-2 focus:ring-neutral-200"
              />
            </div>
            <div>
              <label htmlFor="reg-fullName" className="block text-sm font-medium text-neutral-700">
                Full name
              </label>
              <input
                id="reg-fullName"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-2.5 text-black focus:border-black focus:outline-none focus:ring-2 focus:ring-neutral-200"
              />
            </div>
            <div>
              <label htmlFor="reg-role" className="block text-sm font-medium text-neutral-700">
                Role
              </label>
              <select
                id="reg-role"
                value={role}
                onChange={(e) => setRole(e.target.value as Role)}
                className="mt-1.5 w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-2.5 text-black focus:border-black focus:outline-none focus:ring-2 focus:ring-neutral-200"
              >
                {ROLES.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-xl bg-black py-3 font-semibold text-white transition hover:bg-neutral-800 disabled:opacity-50"
            >
              {submitting ? 'Creating account…' : 'Register'}
            </button>
          </form>
          <p className="mt-6 text-center text-sm text-neutral-600">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-black underline hover:no-underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
