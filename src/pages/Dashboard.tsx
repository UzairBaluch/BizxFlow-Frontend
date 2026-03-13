import { useEffect, useState } from 'react'
import { Users, CheckSquare, Calendar, Clock } from 'lucide-react'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { motion } from 'framer-motion'
import { dashboard as dashboardApi } from '@/api/client'
import type { DashboardData } from '@/types/api'
import type { RecentActivity } from '@/types/dashboard.types'
import { StatCard } from '@/components/ui/StatCard'
import { Card, CardTitle } from '@/components/ui/Card'

const CHART_COLORS = ['var(--app-text)', 'rgba(255,255,255,0.6)', 'rgba(255,255,255,0.3)']

export function DashboardPage(): React.ReactElement {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    dashboardApi
      .get()
      .then((res) => {
        if (res.success && res.data) setData(res.data)
        else setError((res as { message?: string }).message ?? 'Failed to load')
      })
      .catch(() => setError('Failed to load'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-[var(--app-border)] border-t-[var(--app-text)]" />
      </div>
    )
  }

  if (error) {
    return (
      <Card className="p-8">
        <p className="font-body text-sm text-[var(--app-text)]">{error}</p>
        <p className="mt-2 font-body text-sm text-[var(--app-muted)]">Sign in to load live data.</p>
      </Card>
    )
  }

  const totals = [
    { label: 'Employees', value: data?.totalEmployees ?? 0, icon: <Users className="h-5 w-5" /> },
    { label: 'Tasks', value: data?.totalTasks ?? 0, icon: <CheckSquare className="h-5 w-5" /> },
    { label: 'Leave requests', value: data?.totalLeaves ?? 0, icon: <Calendar className="h-5 w-5" /> },
    { label: "Today's attendance", value: data?.todayAttendance ?? 0, icon: <Clock className="h-5 w-5" /> },
  ]

  const taskChartData = (data?.tasksByStatus ?? []).map((s) => ({ name: s._id.replace('-', ' '), value: s.count }))
  const leaveChartData = (data?.leavesByStatus ?? []).map((s) => ({ name: s._id, count: s.count }))
  const recentActivity: RecentActivity[] = []

  return (
    <div className="space-y-7">
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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

      <section className="grid gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <CardTitle className="mb-4">Task status</CardTitle>
          <div className="min-h-[240px] w-full min-w-0" style={{ height: 240 }}>
            {taskChartData.length === 0 ? (
              <div className="flex h-full items-center justify-center font-body text-sm text-[var(--app-muted)]">
                No data
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%" minHeight={240}>
                <PieChart>
                  <Pie
                    data={taskChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
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

        <Card className="p-5">
          <CardTitle className="mb-4">Leave status</CardTitle>
          <div className="min-h-[240px] w-full min-w-0" style={{ height: 240 }}>
            {leaveChartData.length === 0 ? (
              <div className="flex h-full items-center justify-center font-body text-sm text-[var(--app-muted)]">
                No data
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%" minHeight={240}>
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

      <Card className="p-5">
        <CardTitle className="mb-4">Recent activity</CardTitle>
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
