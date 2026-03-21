import { useCallback, useEffect, useState } from 'react'
import { attendance as attendanceApi } from '@/api/client'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'
import type { ApiError, AttendanceRecord } from '@/types/api'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { DataTable } from '@/components/ui/DataTable'
import { StatusBadge } from '@/components/ui/StatusBadge'

function defaultAttendanceRange(): { from: string; to: string } {
  const to = new Date()
  const from = new Date(to.getTime() - 30 * 86400000)
  return { from: from.toISOString().slice(0, 10), to: to.toISOString().slice(0, 10) }
}

export function AttendancePage(): React.ReactElement {
  const { accountType, user } = useAuth()
  const canSeeAllAttendance = accountType === 'company' || user?.role === 'Admin' || user?.role === 'Manager'
  const isEmployee = accountType === 'user' && user?.role === 'Employee'
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
        if (res.success && res.data) {
          const d = res.data as { records?: AttendanceRecord[] }
          setRecords(d.records ?? [])
        } else {
          const err = res as ApiError
          const msg =
            err.status === 401 ? 'Unauthorized. Please sign in again.' : (err.message ?? 'Failed to load attendance')
          addToast(msg, 'error')
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

  const userName = (r: AttendanceRecord): string =>
    typeof r.user === 'object' && r.user && 'fullName' in r.user
      ? (r.user as { fullName: string }).fullName
      : String(r.user)

  return (
    <div className="min-w-0 space-y-6 sm:space-y-7">
      {isEmployee && (
        <Card className="flex min-w-0 flex-col gap-4 p-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-5 sm:p-5">
          <div className="flex min-w-0 flex-wrap items-center gap-3 sm:gap-6">
            <span className="font-body text-sm text-[var(--app-muted)]">Check-in: —</span>
            <StatusBadge status="Present" />
            <span className="font-body text-sm text-[var(--app-muted)]">Check-out: —</span>
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
        {loading ? (
          <div className="flex min-h-[200px] items-center justify-center py-16 sm:min-h-0 sm:py-24">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-[var(--app-border)] border-t-[var(--app-text)]" />
          </div>
        ) : (
          <DataTable<AttendanceRecord>
            columns={[
              { key: 'date', header: 'Date', render: (r) => r.date },
              { key: 'user', header: 'User', render: (r) => userName(r) },
              { key: 'checkIn', header: 'In', render: (r) => r.checkIn ?? '—' },
              { key: 'checkOut', header: 'Out', render: (r) => r.checkOut ?? '—' },
              { key: 'status', header: 'Status', render: (r) => (r.status ? <StatusBadge status={r.status} /> : '—') },
            ]}
            data={records}
            keyExtractor={(r) => r._id}
            emptyMessage="No records"
            hideHeaderWhenEmpty
          />
        )}
      </Card>
    </div>
  )
}
