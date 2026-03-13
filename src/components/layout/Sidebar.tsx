import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  LayoutGrid,
  Clock,
  CheckSquare,
  Calendar,
  Video,
  MessageCircle,
  Sunrise,
  Bell,
  Newspaper,
  BarChart3,
  Megaphone,
  Smile,
  FileText,
  Users,
  User,
  Settings,
  LogOut,
  ChevronLeft,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSidebarStore } from '@/stores/useSidebarStore'
import { useAuth } from '@/context/AuthContext'
import { Role } from '@/types/auth.types'

const MAIN_NAV = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutGrid },
  { path: '/attendance', label: 'Attendance', icon: Clock },
  { path: '/tasks', label: 'Tasks', icon: CheckSquare },
  { path: '/leave', label: 'Leave', icon: Calendar },
] as const

const FEATURES_NAV = [
  { path: '/meetings', label: 'Meetings', icon: Video },
  { path: '/chat', label: 'Team Chat', icon: MessageCircle },
  { path: '/briefing', label: 'AI Briefing', icon: Sunrise },
  { path: '/notifications', label: 'Notifications', icon: Bell },
  { path: '/community', label: 'Community', icon: Newspaper },
  { path: '/analytics', label: 'Performance', icon: BarChart3 },
  { path: '/announcements', label: 'Announcements', icon: Megaphone },
  { path: '/mood', label: 'Mood Check-in', icon: Smile },
  { path: '/end-of-day', label: 'End-of-Day Report', icon: FileText },
] as const

const MANAGEMENT_NAV = [{ path: '/users', label: 'Users', icon: Users }] as const

const ACCOUNT_NAV = [
  { path: '/profile', label: 'Profile', icon: User },
  { path: '/settings', label: 'Settings', icon: Settings },
] as const
// Settings route redirects to /profile

function roleFromString(r: string): Role {
  if (r === 'Admin') return Role.Admin
  if (r === 'Manager') return Role.Manager
  return Role.Employee
}

export function Sidebar(): React.ReactElement {
  const collapsed = useSidebarStore((s) => s.collapsed)
  const toggle = useSidebarStore((s) => s.toggle)
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const role = user?.role ? roleFromString(user.role) : Role.Employee
  const canSeeManagement = role === Role.Admin || role === Role.Manager

  function handleLogout(): void {
    logout()
    navigate('/', { replace: true })
  }

  const navLinkClass = (isActive: boolean) =>
    cn(
      'flex items-center gap-3 rounded-xl py-2.5 pr-3 pl-[12px] font-body text-sm transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--app-text)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--app-card)] border-l-[3px]',
      isActive
        ? 'bg-[var(--app-text)]/10 text-[var(--app-text)] font-medium border-[var(--app-text)]'
        : 'border-transparent text-[var(--app-muted)] hover:bg-[var(--app-border)]/80 hover:text-[var(--app-text)]'
    )

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 72 : 256 }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
      className="fixed left-0 top-0 z-40 flex h-full flex-col overflow-hidden border-r border-[var(--app-border)] bg-[var(--app-card)] shadow-sm"
    >
      {/* Top: landing-style collapse button only (no logo), then app name when expanded */}
      <div
        className={cn(
          'flex h-16 shrink-0 items-center border-b border-[var(--app-border)]',
          collapsed ? 'justify-center px-2' : 'gap-2 px-3'
        )}
      >
        <button
          type="button"
          onClick={toggle}
          className="landing-theme-btn flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[var(--app-muted)] transition-colors hover:bg-[var(--app-card)] hover:text-[var(--app-text)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--app-text)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--app-card)]"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <ChevronLeft className={cn('h-5 w-5 shrink-0', collapsed && 'rotate-180')} />
        </button>
        <motion.span
          initial={false}
          animate={{ opacity: collapsed ? 0 : 1 }}
          transition={{ duration: 0.1 }}
          className={cn(
            'overflow-hidden whitespace-nowrap font-display text-lg font-bold tracking-tight text-[var(--app-text)]',
            collapsed ? 'w-0' : 'min-w-0 flex-1'
          )}
        >
          BizxFlow
        </motion.span>
      </div>

      <nav className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-5">
        <div className="space-y-0.5">
          <p className={cn('mb-2.5 px-3 font-body text-[10px] font-semibold uppercase tracking-widest text-[var(--app-muted)]', collapsed && 'sr-only')}>
            Main
          </p>
          {MAIN_NAV.map((item) => {
            const isActive = location.pathname === item.path
            const Icon = item.icon
            return (
              <Link key={item.path} to={item.path} className={navLinkClass(isActive)}>
                <Icon className="h-5 w-5 shrink-0" />
                <motion.span initial={false} animate={{ opacity: collapsed ? 0 : 1 }} transition={{ duration: 0.1 }} className="overflow-hidden whitespace-nowrap">
                  {item.label}
                </motion.span>
              </Link>
            )
          })}
        </div>

        <div className="mt-7 space-y-0.5">
          <p className={cn('mb-2.5 px-3 font-body text-[10px] font-semibold uppercase tracking-widest text-[var(--app-muted)]', collapsed && 'sr-only')}>
            Features
          </p>
          {FEATURES_NAV.map((item) => {
            const isActive = location.pathname === item.path
            const Icon = item.icon
            return (
              <Link key={item.path} to={item.path} className={navLinkClass(isActive)}>
                <Icon className="h-5 w-5 shrink-0" />
                <motion.span initial={false} animate={{ opacity: collapsed ? 0 : 1 }} transition={{ duration: 0.1 }} className="overflow-hidden whitespace-nowrap">
                  {item.label}
                </motion.span>
              </Link>
            )
          })}
        </div>

        {canSeeManagement && (
          <div className="mt-7 space-y-0.5">
            <p className={cn('mb-2.5 px-3 font-body text-[10px] font-semibold uppercase tracking-widest text-[var(--app-muted)]', collapsed && 'sr-only')}>
              Management
            </p>
            {MANAGEMENT_NAV.map((item) => {
              const isActive = location.pathname === item.path
              const Icon = item.icon
              return (
                <Link key={item.path} to={item.path} className={navLinkClass(isActive)}>
                  <Icon className="h-5 w-5 shrink-0" />
                  <motion.span initial={false} animate={{ opacity: collapsed ? 0 : 1 }} transition={{ duration: 0.1 }} className="overflow-hidden whitespace-nowrap">
                    {item.label}
                  </motion.span>
                </Link>
              )
            })}
          </div>
        )}

        <div className="mt-7 space-y-0.5">
          <p className={cn('mb-2.5 px-3 font-body text-[10px] font-semibold uppercase tracking-widest text-[var(--app-muted)]', collapsed && 'sr-only')}>
            Account
          </p>
          {ACCOUNT_NAV.map((item) => {
            const isActive = location.pathname === item.path
            const Icon = item.icon
            return (
              <Link key={item.path} to={item.path} className={navLinkClass(isActive)}>
                <Icon className="h-5 w-5 shrink-0" />
                <motion.span initial={false} animate={{ opacity: collapsed ? 0 : 1 }} transition={{ duration: 0.1 }} className="overflow-hidden whitespace-nowrap">
                  {item.label}
                </motion.span>
              </Link>
            )
          })}
        </div>
      </nav>

      {/* User & actions — constrain width so "Demo User" doesn't overflow */}
      <div className={cn('shrink-0 overflow-hidden border-t border-[var(--app-border)] bg-[var(--app-bg)]/50 p-3', collapsed && 'flex flex-col items-center')}>
        <div
          className={cn(
            'flex min-w-0 items-center gap-3 rounded-xl border border-[var(--app-border)] bg-[var(--app-card)] p-3',
            collapsed && 'justify-center p-2'
          )}
        >
          <div className="h-9 w-9 shrink-0 overflow-hidden rounded-full border-2 border-[var(--app-border)] bg-[var(--app-border)] ring-2 ring-[var(--app-card)]">
            {user?.profilePicture ? (
              <img src={user.profilePicture} alt="" className="h-full w-full object-cover" />
            ) : (
              <span className="flex h-full w-full items-center justify-center font-body text-sm font-semibold text-[var(--app-muted)]">
                {(user?.fullName ?? '?').charAt(0)}
              </span>
            )}
          </div>
          <motion.div
            initial={false}
            animate={{ opacity: collapsed ? 0 : 1 }}
            transition={{ duration: 0.1 }}
            className="min-w-0 flex-1 overflow-hidden"
          >
            <p className="truncate font-body text-sm font-semibold text-[var(--app-text)]">{user?.fullName ?? 'User'}</p>
            <p className={cn('truncate font-body text-[10px] font-medium uppercase tracking-wider text-[var(--app-muted)]', collapsed && 'sr-only')}>{user?.role ?? ''}</p>
          </motion.div>
        </div>
        <div className={cn('mt-2 flex gap-1', collapsed && 'flex-col')}>
          <button
            type="button"
            onClick={handleLogout}
            className={cn(
              'flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 font-body text-xs font-medium text-[var(--app-muted)] transition-colors hover:bg-[var(--app-border)] hover:text-[var(--app-text)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--app-text)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--app-card)]',
              collapsed && 'w-full justify-center py-2'
            )}
          >
            <LogOut className="h-4 w-4 shrink-0" />
            <motion.span initial={false} animate={{ opacity: collapsed ? 0 : 1 }} transition={{ duration: 0.1 }} className="overflow-hidden whitespace-nowrap">
              Logout
            </motion.span>
          </button>
        </div>
      </div>
    </motion.aside>
  )
}
