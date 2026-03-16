import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Users, CheckSquare, Calendar, Clock } from 'lucide-react'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { motion } from 'framer-motion'
import { dashboard as dashboardApi, users as usersApi } from '@/api/client'
import { useAuth } from '@/context/AuthContext'
import type { DashboardData } from '@/types/api'
import type { RecentActivity } from '@/types/dashboard.types'
import { StatCard } from '@/components/ui/StatCard'
import { Card, CardTitle } from '@/components/ui/Card'

const CHART_COLORS = ['var(--app-text)', 'rgba(255,255,255,0.6)', 'rgba(255,255,255,0.3)']

export function DashboardPage(): React.ReactElement {
  const { accountType, user } = useAuth()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [companyEmployeeCount, setCompanyEmployeeCount] = useState<number | null>(null)

  const isCompany = accountType === 'company'
  const canSeeDashboard = isCompany || user?.role === 'Admin' || user?.role === 'Manager'

  useEffect(() => {
    if (!canSeeDashboard) {
      setLoading(false)
      return
    }
    dashboardApi
      .get()
      .then((res) => {
        if (res.success && res.data) setData(res.data)
        else setError((res as { message?: string }).message ?? 'Failed to load')
      })
      .catch(() => setError('Failed to load'))
      .finally(() => setLoading(false))
  }, [canSeeDashboard])

  // Company: when dashboard API returns no data, still show employee count from users list
  useEffect(() => {
    if (!isCompany || data?.totalEmployees != null) return
    usersApi
      .all({ page: 1, limit: 1 })
      .then((res) => {
        if (res.success && res.data?.totalUsers != null) setCompanyEmployeeCount(res.data.totalUsers)
      })
      .catch(() => {})
  }, [isCompany, data?.totalEmployees])

  // Employee: no access to dashboard (company, Admin, Manager only)
  if (!canSeeDashboard) {
    return (
      <div className="space-y-7">
        <Card className="p-6">
          <h2 className="font-display text-lg font-bold text-[var(--app-text)]">Access restricted</h2>
          <p className="mt-2 font-body text-sm text-[var(--app-muted)]">
            Dashboard is for company accounts and users with Admin or Manager role.
          </p>
          <Link to="/tasks" className="mt-4 inline-block font-body text-sm font-medium text-[var(--app-text)] underline hover:no-underline">
            Go to Tasks
          </Link>
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

  // For non-company (Admin/Manager), show error and stop. For company, show full dashboard with empty data below.
  if (error && !isCompany) {
    return (
      <Card className="p-4 sm:p-6 md:p-8">
        <p className="font-body text-sm text-[var(--app-text)]">{error}</p>
        <p className="mt-2 font-body text-xs text-[var(--app-muted)] sm:text-sm">Sign in to load live data.</p>
      </Card>
    )
  }

  const totals = [
    { label: 'Employees', value: data?.totalEmployees ?? companyEmployeeCount ?? 0, icon: <Users className="h-5 w-5" /> },
    { label: 'Tasks', value: data?.totalTasks ?? 0, icon: <CheckSquare className="h-5 w-5" /> },
    { label: 'Leave requests', value: data?.totalLeaves ?? 0, icon: <Calendar className="h-5 w-5" /> },
    { label: "Today's attendance", value: data?.todayAttendance ?? 0, icon: <Clock className="h-5 w-5" /> },
  ]

  const taskChartData = (data?.tasksByStatus ?? []).map((s) => ({ name: s._id.replace('-', ' '), value: s.count }))
  const leaveChartData = (data?.leavesByStatus ?? []).map((s) => ({ name: s._id, count: s.count }))
  const recentActivity: RecentActivity[] = []

  return (
    <div className="space-y-5 sm:space-y-7">
      <section className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
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
        <Card className="min-w-0 p-4 sm:p-5">
          <CardTitle className="mb-3 sm:mb-4">Task status</CardTitle>
          <div className="h-[240px] w-full min-w-0" style={{ minHeight: 240 }}>
            {taskChartData.length === 0 ? (
              <div className="flex h-full items-center justify-center font-body text-sm text-[var(--app-muted)]">
                No data
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={240} minHeight={240}>
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

        <Card className="min-w-0 p-4 sm:p-5">
          <CardTitle className="mb-3 sm:mb-4">Leave status</CardTitle>
          <div className="h-[240px] w-full min-w-0" style={{ minHeight: 240 }}>
            {leaveChartData.length === 0 ? (
              <div className="flex h-full items-center justify-center font-body text-sm text-[var(--app-muted)]">
                No data
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={240} minHeight={240}>
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
