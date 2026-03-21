import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Users, CheckSquare, Calendar, Clock } from 'lucide-react'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { motion } from 'framer-motion'
import { dashboard as dashboardApi } from '@/api/client'
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

export function DashboardPage(): React.ReactElement {
  const { accountType, user } = useAuth()
  const [data, setData] = useState<DashboardData | null>(null)
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
    queueMicrotask(() => setError(null))
    dashboardApi
      .get()
      .then((res) => {
        if (res.success && res.data) setData(res.data)
        else setError(friendlyDashboardError((res as { message?: string }).message))
      })
      .catch(() => setError(friendlyDashboardError(undefined)))
      .finally(() => setLoading(false))
  }, [canSeeDashboard])

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

  const totals = [
    { label: 'Employees', value: data?.totalEmployees ?? 0, icon: <Users className="h-5 w-5" /> },
    { label: 'Tasks', value: data?.totalTasks ?? 0, icon: <CheckSquare className="h-5 w-5" /> },
    { label: 'Leave requests', value: data?.totalLeaves ?? 0, icon: <Calendar className="h-5 w-5" /> },
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
          <CardTitle className="mb-3 sm:mb-4">Leave status</CardTitle>
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
