import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { Role } from '../types/api';

const NAV: { path: string; label: string; roles?: Role[] }[] = [
  { path: '/dashboard', label: 'Dashboard' },
  { path: '/tasks', label: 'Tasks' },
  { path: '/leave', label: 'Leave' },
  { path: '/attendance', label: 'Attendance' },
  { path: '/users', label: 'Users', roles: ['admin'] },
  { path: '/profile', label: 'Profile' },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const isDemo = user?._id === 'demo';

  const canSee = (roles?: Role[]) => {
    if (!roles) return true;
    return user?.role && roles.includes(user.role);
  };

  async function handleLogout() {
    await logout();
    navigate('/dashboard');
  }

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      <nav className="sticky top-0 z-10 border-b border-neutral-200/80 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-8">
            <Link
              to="/dashboard"
              className="text-xl font-bold tracking-tight text-black"
            >
              BizxFlow
            </Link>
            <div className="flex gap-1">
              {NAV.filter((n) => canSee(n.roles)).map((n) => (
                <Link
                  key={n.path}
                  to={n.path}
                  className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                    location.pathname === n.path
                      ? 'bg-neutral-100 text-black'
                      : 'text-neutral-600 hover:bg-neutral-50 hover:text-black'
                  }`}
                >
                  {n.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-neutral-500">
              {user?.fullName}
              <span className="ml-1.5 rounded bg-neutral-200 px-1.5 py-0.5 text-xs font-medium capitalize text-neutral-700">
                {user?.role}
              </span>
            </span>
            {isDemo ? (
              <Link
                to="/login"
                className="rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-black transition hover:bg-neutral-50"
              >
                Sign in
              </Link>
            ) : (
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-black transition hover:bg-neutral-50"
              >
                Sign out
              </button>
            )}
          </div>
        </div>
      </nav>
      <main className="mx-auto max-w-6xl px-4 py-10">
        {children}
      </main>
    </div>
  );
}
