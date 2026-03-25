import { useCallback, useEffect, useMemo, useState } from 'react'
import { attendance as attendanceApi } from '@/api/client'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'
import type { ApiError, AttendanceRecord } from '@/types/api'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { DataTable } from '@/components/ui/DataTable'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { isManagerRole } from '@/lib/authAccess'

function defaultAttendanceRange(): { from: string; to: string } {
  const to = new Date()
  const from = new Date(to.getTime() - 30 * 86400000)
  return { from: from.toISOString().slice(0, 10), to: to.toISOString().slice(0, 10) }
}

/** Local calendar date YYYY-MM-DD */
function localYmd(d: Date = new Date()): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function recordDateKey(dateStr: string): string {
  const s = dateStr.trim()
  if (s.includes('T')) return s.slice(0, 10)
  return s.slice(0, 10)
}

function findTodaysRecord(records: AttendanceRecord[]): AttendanceRecord | undefined {
  const today = localYmd()
  return records.find((r) => recordDateKey(r.date) === today)
}

/** Check-in/out timestamps from API (ISO) → readable local time */
function formatAttendanceTime(iso?: string | null): string {
  if (iso == null || String(iso).trim() === '') return '—'
  try {
    const d = new Date(iso)
    if (Number.isNaN(d.getTime())) return String(iso)
    return d.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
  } catch {
    return String(iso)
  }
}

function formatTimeOnly(iso?: string | null): string {
  if (iso == null || String(iso).trim() === '') return '—'
  try {
    const d = new Date(iso)
    if (Number.isNaN(d.getTime())) return String(iso)
    return d.toLocaleTimeString(undefined, { timeStyle: 'short' })
  } catch {
    return String(iso)
  }
}

function formatRecordDate(dateStr: string): string {
  try {
    const key = recordDateKey(dateStr)
    const d = new Date(`${key}T12:00:00`)
    if (Number.isNaN(d.getTime())) return dateStr
    return d.toLocaleDateString(undefined, { dateStyle: 'medium' })
  } catch {
    return dateStr
  }
}

function isEmployeeRole(role: string | undefined): boolean {
  if (role == null) return false
  return role.trim().toLowerCase() === 'employee'
}

function isAttendanceListOk(res: unknown): boolean {
  if (res == null || typeof res !== 'object') return false
  const r = res as Record<string, unknown>
  if (r.success === false) return false
  if (r.success === true) return true
  if (r.data != null) return true
  if (Array.isArray(r.records)) return true
  if (typeof r._httpStatus === 'number' && r._httpStatus >= 200 && r._httpStatus < 300) return true
  return false
}

function parseAttendanceRecordsFromResponse(res: unknown): AttendanceRecord[] {
  if (res == null || typeof res !== 'object') return []
  const r = res as Record<string, unknown>
  const raw = r.data !== undefined && r.data !== null ? r.data : r
  if (Array.isArray(raw)) return raw as AttendanceRecord[]
  if (typeof raw === 'object' && raw !== null) {
    const o = raw as Record<string, unknown>
    if (Array.isArray(o.records)) return o.records as AttendanceRecord[]
    if (Array.isArray(o.items)) return o.items as AttendanceRecord[]
    if (Array.isArray(o.results)) return o.results as AttendanceRecord[]
  }
  if (Array.isArray(r.records)) return r.records as AttendanceRecord[]
  return []
}

function sortAttendanceCompanyView(a: AttendanceRecord, b: AttendanceRecord): number {
  const da = recordDateKey(a.date).localeCompare(recordDateKey(b.date))
  if (da !== 0) return -da
  return userSortKey(a).localeCompare(userSortKey(b))
}

function userSortKey(r: AttendanceRecord): string {
  if (typeof r.user === 'object' && r.user && 'fullName' in r.user) {
    return String((r.user as { fullName?: string }).fullName ?? '')
  }
  return String(r.user ?? '')
}

function attendanceRowKey(r: AttendanceRecord, index: number): string {
  return r._id != null && String(r._id).trim() !== '' ? String(r._id) : `att-${index}`
}

export function AttendancePage(): React.ReactElement {
  const { accountType, user } = useAuth()
  const isCompactAttendance = useMediaQuery('(max-width: 767px)')
  /** Company JWT or Manager → GET /record-all (all employees in tenant). */
  const canSeeAllAttendance = accountType === 'company' || isManagerRole(user?.role)
  const isEmployee = accountType === 'user' && isEmployeeRole(user?.role)
  const [records, setRecords] = useState<AttendanceRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [checking, setChecking] = useState(false)
  const { addToast } = useToast()

  const load = useCallback(() => {
    setLoading(true)
    const range = defaultAttendanceRange()
    const api = canSeeAllAttendance ? attendanceApi.allRecords(range) : attendanceApi.myRecord(range)
    api
      .then((res) => {
        if (isAttendanceListOk(res)) {
          let list = parseAttendanceRecordsFromResponse(res)
          if (canSeeAllAttendance) {
            list = [...list].sort(sortAttendanceCompanyView)
          }
          setRecords(list)
        } else {
          const err = res as ApiError
          const msg =
            err.status === 401 ? 'Unauthorized. Please sign in again.' : (err.message ?? 'Failed to load attendance')
          addToast(msg, 'error')
          setRecords([])
        }
      })
      .finally(() => setLoading(false))
  }, [canSeeAllAttendance, addToast])

  useEffect(() => {
    queueMicrotask(() => {
      void load()
    })
  }, [load])

  function handleCheckIn(): void {
    setChecking(true)
    attendanceApi
      .checkIn()
      .then((res) => {
        if (res.success) {
          addToast('Checked in.')
          load()
        } else {
          const err = res as ApiError
          const msg =
            err.status === 401
              ? 'Unauthorized. Please sign in again.'
              : err.status === 409
                ? err.message ?? 'Record already exists.'
                : err.message ?? 'Failed to check in'
          addToast(msg, 'error')
        }
      })
      .finally(() => setChecking(false))
  }

  function handleCheckOut(): void {
    setChecking(true)
    attendanceApi
      .checkOut()
      .then((res) => {
        if (res.success) {
          addToast('Checked out.')
          load()
        } else {
          const err = res as ApiError
          const msg =
            err.status === 401
              ? 'Unauthorized. Please sign in again.'
              : err.status === 404
                ? err.message ?? 'No check-in record found.'
                : err.status === 409
                  ? err.message ?? 'Already checked out.'
                  : err.message ?? 'Failed to check out'
          addToast(msg, 'error')
        }
      })
      .finally(() => setChecking(false))
  }

  const userName = (r: AttendanceRecord): string => {
    const u = r.user
    if (u == null || u === '') return '—'
    if (typeof u === 'object' && 'fullName' in u) {
      const fn = (u as { fullName?: string; email?: string }).fullName
      if (fn != null && String(fn).trim() !== '') return String(fn)
      const em = (u as { email?: string }).email
      if (em != null && String(em).trim() !== '') return String(em)
    }
    return String(u)
  }

  const todayRecord = useMemo(() => findTodaysRecord(records), [records])

  const employeeDayStatus = useMemo((): string => {
    if (!todayRecord) return 'Not checked in'
    if (todayRecord.checkIn && !todayRecord.checkOut) return 'Checked in'
    if (todayRecord.checkIn && todayRecord.checkOut) return 'Checked out'
    return todayRecord.status ?? 'Pending'
  }, [todayRecord])

  const employeeColumns = [
    { key: 'date', header: 'Date', render: (r: AttendanceRecord) => formatRecordDate(r.date) },
    {
      key: 'checkIn',
      header: 'Check-in',
      render: (r: AttendanceRecord) => formatTimeOnly(r.checkIn),
    },
    {
      key: 'checkOut',
      header: 'Check-out',
      render: (r: AttendanceRecord) => formatTimeOnly(r.checkOut),
    },
    {
      key: 'status',
      header: 'Status',
      render: (r: AttendanceRecord) => (r.status ? <StatusBadge status={r.status} /> : '—'),
    },
  ]

  const companyWideColumns = [
    { key: 'date', header: 'Date', render: (r: AttendanceRecord) => formatRecordDate(r.date) },
    { key: 'user', header: 'User', render: (r: AttendanceRecord) => userName(r) },
    {
      key: 'checkIn',
      header: 'Check-in',
      render: (r: AttendanceRecord) => formatAttendanceTime(r.checkIn),
    },
    {
      key: 'checkOut',
      header: 'Check-out',
      render: (r: AttendanceRecord) => formatAttendanceTime(r.checkOut),
    },
    {
      key: 'status',
      header: 'Status',
      render: (r: AttendanceRecord) => (r.status ? <StatusBadge status={r.status} /> : '—'),
    },
  ]

  return (
    <div className="min-w-0 space-y-6 sm:space-y-7">
      {isEmployee && (
        <Card className="flex min-w-0 flex-col gap-4 p-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-5 sm:p-5">
          <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4 md:gap-6">
            <div className="flex min-w-0 flex-col gap-1">
              <span className="font-body text-[10px] font-semibold uppercase tracking-wider text-[var(--app-muted)]">
                Today&apos;s check-in
              </span>
              <span className="font-body text-base font-medium text-[var(--app-text)]">
                {formatTimeOnly(todayRecord?.checkIn)}
              </span>
            </div>
            <StatusBadge status={employeeDayStatus} />
            <div className="flex min-w-0 flex-col gap-1">
              <span className="font-body text-[10px] font-semibold uppercase tracking-wider text-[var(--app-muted)]">
                Today&apos;s check-out
              </span>
              <span className="font-body text-base font-medium text-[var(--app-text)]">
                {formatTimeOnly(todayRecord?.checkOut)}
              </span>
            </div>
          </div>
          <div className="flex w-full min-w-0 flex-col gap-2 sm:w-auto sm:flex-row sm:gap-3">
            <Button variant="primary" className="w-full sm:w-auto" onClick={handleCheckIn} loading={checking}>
              Check In
            </Button>
            <Button variant="secondary" className="w-full sm:w-auto" onClick={handleCheckOut} loading={checking}>
              Check Out
            </Button>
          </div>
        </Card>
      )}

      <Card className="min-w-0 overflow-hidden rounded-xl p-0 sm:rounded-lg">
        {canSeeAllAttendance && (
          <div className="border-b border-[var(--app-border)] px-4 py-3 sm:px-5">
            <h2 className="font-display text-sm font-semibold text-[var(--app-text)]">All team attendance</h2>
            <p className="mt-0.5 font-body text-xs text-[var(--app-muted)]">
              Company-wide check-in/out for the last 30 days (all employees).
            </p>
          </div>
        )}
        {loading ? (
          <div className="flex min-h-[200px] items-center justify-center py-16 sm:min-h-0 sm:py-24">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-[var(--app-border)] border-t-[var(--app-text)]" />
          </div>
        ) : isCompactAttendance ? (
          records.length === 0 ? (
            <div className="px-4 py-14 text-center font-body text-sm text-[var(--app-muted)] sm:py-10 sm:text-base">
              {canSeeAllAttendance ? 'No attendance records in this range' : 'No records'}
            </div>
          ) : (
            <div className="w-full min-w-0 divide-y divide-[var(--app-border)]">
              {records.map((r, index) => (
                <article key={attendanceRowKey(r, index)} className="px-4 py-4">
                  <div className="space-y-1">
                    <p className="font-body text-[10px] font-semibold uppercase tracking-wider text-[var(--app-muted)]">
                      Date
                    </p>
                    <p className="font-body text-sm font-medium text-[var(--app-text)]">{formatRecordDate(r.date)}</p>
                  </div>
                  {canSeeAllAttendance ? (
                    <div className="mt-3 space-y-1">
                      <p className="font-body text-[10px] font-semibold uppercase tracking-wider text-[var(--app-muted)]">
                        User
                      </p>
                      <p className="break-words font-body text-sm text-[var(--app-text)]">{userName(r)}</p>
                    </div>
                  ) : null}
                  <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <p className="font-body text-[10px] font-semibold uppercase tracking-wider text-[var(--app-muted)]">
                        Check-in
                      </p>
                      <p className="font-body text-sm text-[var(--app-text)]">
                        {canSeeAllAttendance ? formatAttendanceTime(r.checkIn) : formatTimeOnly(r.checkIn)}
                      </p>
                    </div>
                    <div>
                      <p className="font-body text-[10px] font-semibold uppercase tracking-wider text-[var(--app-muted)]">
                        Check-out
                      </p>
                      <p className="font-body text-sm text-[var(--app-text)]">
                        {canSeeAllAttendance ? formatAttendanceTime(r.checkOut) : formatTimeOnly(r.checkOut)}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3">
                    <p className="font-body text-[10px] font-semibold uppercase tracking-wider text-[var(--app-muted)]">
                      Status
                    </p>
                    <div className="mt-1">
                      {r.status ? <StatusBadge status={r.status} /> : <span className="font-body text-sm text-[var(--app-muted)]">—</span>}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )
        ) : (
          <DataTable<AttendanceRecord>
            columns={canSeeAllAttendance ? companyWideColumns : employeeColumns}
            data={records}
            keyExtractor={(r) => r._id}
            emptyMessage={canSeeAllAttendance ? 'No attendance records in this range' : 'No records'}
            hideHeaderWhenEmpty
          />
        )}
      </Card>
    </div>
  )
}
