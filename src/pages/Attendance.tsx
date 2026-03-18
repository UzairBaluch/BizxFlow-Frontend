import { useCallback, useEffect, useState } from 'react'
import { attendance as attendanceApi } from '@/api/client'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'
import type { ApiError, AttendanceRecord } from '@/types/api'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { DataTable } from '@/components/ui/DataTable'
import { StatusBadge } from '@/components/ui/StatusBadge'

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
    const api = canSeeAllAttendance ? attendanceApi.allRecords() : attendanceApi.myRecord()
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
    load()
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
    <div className="space-y-7">
      {isEmployee && (
        <Card className="flex flex-wrap items-center justify-between gap-4 p-5">
          <div className="flex flex-1 items-center gap-6">
            <span className="font-body text-sm text-[var(--app-muted)]">Check-in: —</span>
            <StatusBadge status="Present" />
            <span className="font-body text-sm text-[var(--app-muted)]">Check-out: —</span>
          </div>
          <div className="flex gap-3">
            <Button variant="primary" onClick={handleCheckIn} loading={checking}>
              Check In
            </Button>
            <Button variant="secondary" onClick={handleCheckOut} loading={checking}>
              Check Out
            </Button>
          </div>
        </Card>
      )}

      <Card className="overflow-hidden p-0">
        {loading ? (
          <div className="flex justify-center py-24">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-[var(--app-border)] border-t-[var(--app-text)]" />
          </div>
        ) : (
          <>
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
            />
          </>
        )}
      </Card>
    </div>
  )
}
