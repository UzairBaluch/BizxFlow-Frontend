import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Users, CheckSquare, Calendar, Clock } from 'lucide-react'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { motion } from 'framer-motion'
import { dashboard as dashboardApi, leave as leaveApi, users as usersApi } from '@/api/client'
import { isLeavesListOk, parseLeavesFromResponse } from '@/lib/leaveListParse'
import { isLeavePending } from '@/lib/leaveStatus'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { useAuth } from '@/context/AuthContext'
import type { DashboardData } from '@/types/api'
import type { RecentActivity } from '@/types/dashboard.types'
import { StatCard } from '@/components/ui/StatCard'
import { Card, CardTitle } from '@/components/ui/Card'

const CHART_COLORS = ['var(--app-text)', 'rgba(255,255,255,0.6)', 'rgba(255,255,255,0.3)']

/** Backend sometimes returns raw JS error text (e.g. company JWT on /dashboard before server fix). */
function friendlyDashboardError(raw: string | undefined): string {
  const msg = raw?.trim() ?? ''
  if (
    msg.includes("reading 'role'") ||
    msg.includes('reading "role"') ||
    msg.includes('Cannot read properties of null')
  ) {
    return "Dashboard couldn't load. Your server may need to fix GET /dashboard for company sign-in (company tokens don't have req.user — don't read user.role there)."
  }
  return msg || 'Failed to load dashboard.'
}

/**
 * Headcount for the stat card: everyone with a user login (Admin, Manager, Employee).
 * Excludes the company account. Prefer API field `totalTeamMembers`; fall back to legacy names.
 */
function teamMemberCount(d: DashboardData | null | undefined): number {
  if (d == null) return 0
  const v = d.totalTeamMembers ?? d.totalUsers ?? d.totalEmployees
  return typeof v === 'number' && !Number.isNaN(v) ? v : 0
}

/**
 * GET /all-users returns `totalUsers` for everyone in the tenant (all roles).
 * Prefer this over dashboard aggregates — some backends only count `Employee` in totalEmployees.
 */
function parseDirectoryTotalUsers(res: unknown): number | null {
  if (res == null || typeof res !== 'object') return null
  const r = res as Record<string, unknown>
  if (r.success === false) return null
  const raw = r.data !== undefined && r.data !== null ? r.data : r
  if (raw == null || typeof raw !== 'object') return null
  const t = (raw as Record<string, unknown>).totalUsers
  if (typeof t === 'number' && !Number.isNaN(t)) return t
  return null
}

/**
 * Fallback when GET /all-leaves is unavailable — uses dashboard aggregates (can be stale vs real list).
 */
function pendingLeaveQueueCount(d: DashboardData | null | undefined): number {
  if (d == null) return 0
  if (typeof d.totalPendingLeaves === 'number' && !Number.isNaN(d.totalPendingLeaves)) {
    return d.totalPendingLeaves
  }
  const rows = d.leavesByStatus
  if (Array.isArray(rows) && rows.length > 0) {
    let pending = 0
    for (const row of rows) {
      const key = String(row._id ?? '').trim().toLowerCase()
      if (key === 'pending') pending += Number(row.count) || 0
    }
    return pending
  }
  return d.totalLeaves ?? 0
}

export function DashboardPage(): React.ReactElement {
  const { accountType, user } = useAuth()
  const location = useLocation()
  const [data, setData] = useState<DashboardData | null>(null)
  /** Authoritative headcount from GET /all-users when available */
  const [directoryUserTotal, setDirectoryUserTotal] = useState<number | null>(null)
  /** Live pending count from GET /all-leaves (matches Leave page after approve/reject). */
  const [pendingLeaveFromList, setPendingLeaveFromList] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  /** GET /dashboard — company JWT or Admin/Manager user JWT (same KPIs; not Employee-only). */
  const canSeeDashboard =
    accountType === 'company' ||
    (accountType === 'user' && user != null && (user.role === 'Admin' || user.role === 'Manager'))
  const compactCharts = useMediaQuery('(max-width: 480px)')

  useEffect(() => {
    if (!canSeeDashboard) {
      queueMicrotask(() => setLoading(false))
      return
    }
    queueMicrotask(() => {
      setLoading(true)
      setError(null)
      setDirectoryUserTotal(null)
      setPendingLeaveFromList(null)
      void Promise.all([
        dashboardApi.get(),
        usersApi.all({ page: 1, limit: 1 }),
        leaveApi.allLeaves(),
      ])
        .then(([dashRes, usersRes, leaveRes]) => {
          const n = parseDirectoryTotalUsers(usersRes)
          if (n != null) setDirectoryUserTotal(n)
          if (isLeavesListOk(leaveRes)) {
            const leaves = parseLeavesFromResponse(leaveRes)
            const pending = leaves.filter((row) => isLeavePending(row.status)).length
            setPendingLeaveFromList(pending)
          } else {
            setPendingLeaveFromList(null)
          }
          if (dashRes.success && dashRes.data) setData(dashRes.data)
          else setError(friendlyDashboardError((dashRes as { message?: string }).message))
        })
        .catch(() => setError(friendlyDashboardError(undefined)))
        .finally(() => setLoading(false))
    })
    /** Refetch when returning to this page (e.g. after approving leave on /leave). */
  }, [canSeeDashboard, location.key])

  if (!canSeeDashboard) {
    return (
      <div className="min-w-0 space-y-7">
        <Card className="min-w-0 p-6">
          <h2 className="font-display text-lg font-bold text-[var(--app-text)]">Dashboard unavailable</h2>
          <div className="mt-4 flex flex-wrap gap-4 font-body text-sm font-medium text-[var(--app-text)]">
            <Link to="/tasks" className="underline hover:no-underline">
              Tasks
            </Link>
            <Link to="/leave" className="underline hover:no-underline">
              Leave
            </Link>
            <Link to="/announcements" className="underline hover:no-underline">
              Announcements
            </Link>
          </div>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-[var(--app-border)] border-t-[var(--app-text)]" />
      </div>
    )
  }

  if (error) {
    return (
      <Card className="min-w-0 p-4 sm:p-6 md:p-8">
        <p className="font-body text-sm text-[var(--app-text)]">{error}</p>
      </Card>
    )
  }

  const teamMembersDisplayed = directoryUserTotal ?? teamMemberCount(data)
  const pendingLeaveDisplayed =
    pendingLeaveFromList !== null ? pendingLeaveFromList : pendingLeaveQueueCount(data)

  const totals = [
    {
      label: 'Team members',
      value: teamMembersDisplayed,
      icon: <Users className="h-5 w-5" />,
    },
    { label: 'Tasks', value: data?.totalTasks ?? 0, icon: <CheckSquare className="h-5 w-5" /> },
    {
      label: 'Pending leave',
      value: pendingLeaveDisplayed,
      icon: <Calendar className="h-5 w-5" />,
    },
    { label: "Today's attendance", value: data?.todayAttendance ?? 0, icon: <Clock className="h-5 w-5" /> },
  ]

  const taskChartData = (data?.tasksByStatus ?? [])
    .filter((s): s is NonNullable<typeof s> & { _id: string; count: number } => s != null && s._id != null)
    .map((s) => ({ name: String(s._id), value: Number(s.count) || 0 }))
  const leaveChartData = (data?.leavesByStatus ?? [])
    .filter((s): s is NonNullable<typeof s> & { _id: string; count: number } => s != null && s._id != null)
    .map((s) => ({ name: String(s._id), count: Number(s.count) || 0 }))
  const recentActivity: RecentActivity[] = []

  const pieInner = compactCharts ? 44 : 60
  const pieOuter = compactCharts ? 58 : 80

  return (
    <div className="w-full min-w-0 space-y-5 sm:space-y-7">
      <section className="grid min-w-0 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
        {totals.map((item, i) => (
          <StatCard
            key={item.label}
            icon={item.icon}
            value={item.value}
            label={item.label}
            index={i}
          />
        ))}
      </section>

      <section className="grid min-w-0 gap-4 lg:grid-cols-2">
        <Card className="min-w-0 overflow-hidden p-4 sm:p-5">
          <CardTitle className="mb-3 sm:mb-4">Task status</CardTitle>
          <div className="h-[220px] w-full min-w-0 sm:h-[240px]" style={{ minHeight: 220 }}>
            {taskChartData.length === 0 ? (
              <div className="flex h-full items-center justify-center font-body text-sm text-[var(--app-muted)]">
                No data
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={compactCharts ? 220 : 240} minHeight={compactCharts ? 220 : 240}>
                <PieChart>
                  <Pie
                    data={taskChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={pieInner}
                    outerRadius={pieOuter}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {taskChartData.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: 'var(--app-card)',
                      border: '1px solid var(--app-border)',
                      borderRadius: 8,
                      fontFamily: 'Outfit, sans-serif',
                      fontSize: 14,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        <Card className="min-w-0 overflow-hidden p-4 sm:p-5">
          <CardTitle className="mb-3 sm:mb-4">Leave by status</CardTitle>
          <div className="h-[220px] w-full min-w-0 sm:h-[240px]" style={{ minHeight: 220 }}>
            {leaveChartData.length === 0 ? (
              <div className="flex h-full items-center justify-center font-body text-sm text-[var(--app-muted)]">
                No data
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={compactCharts ? 220 : 240} minHeight={compactCharts ? 220 : 240}>
                <BarChart data={leaveChartData} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
                  <XAxis
                    dataKey="name"
                    tick={{ fill: 'var(--app-muted)', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis tick={{ fill: 'var(--app-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Bar dataKey="count" fill="var(--app-text)" radius={[4, 4, 0, 0]} />
                  <Tooltip
                    contentStyle={{
                      background: 'var(--app-card)',
                      border: '1px solid var(--app-border)',
                      borderRadius: 8,
                      fontFamily: 'Outfit, sans-serif',
                      fontSize: 14,
                    }}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>
      </section>

      <Card className="min-w-0 p-4 sm:p-5">
        <CardTitle className="mb-3 sm:mb-4">Recent activity</CardTitle>
        <ul className="space-y-0">
          {recentActivity.length === 0 ? (
            <li className="py-4 text-center font-body text-sm text-[var(--app-muted)]">No recent activity</li>
          ) : (
            recentActivity.map((act, i) => (
              <motion.li
                key={act._id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.03 }}
                className="flex items-center gap-3 border-b border-[var(--app-border)] py-3 last:border-0"
              >
                <div className="h-8 w-8 shrink-0 rounded-full bg-[var(--app-border)]" />
                <div className="min-w-0 flex-1">
                  <p className="font-body text-sm text-[var(--app-text)]">{act.action}</p>
                  <p className="font-body text-xs text-[var(--app-muted)]">{act.time}</p>
                </div>
              </motion.li>
            ))
          )}
        </ul>
      </Card>
    </div>
  )
}
