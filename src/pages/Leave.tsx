import { useCallback, useEffect, useState } from 'react'
import { leave as leaveApi } from '@/api/client'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'
import type { LeaveRequest } from '@/types/api'
import { LeaveStatus } from '@/types/leave.types'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { DataTable } from '@/components/ui/DataTable'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { SlidePanel } from '@/components/ui/SlidePanel'

export function LeavePage(): React.ReactElement {
  const { user } = useAuth()
  const isAdminOrManager = user?.role === 'Admin' || user?.role === 'Manager'
  const [myLeaves, setMyLeaves] = useState<LeaveRequest[]>([])
  const [allLeaves, setAllLeaves] = useState<LeaveRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [panelOpen, setPanelOpen] = useState(false)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [reason, setReason] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { addToast } = useToast()

  const load = useCallback(() => {
    setLoading(true)
    Promise.all([
      leaveApi.myLeaves(),
      isAdminOrManager ? leaveApi.allLeaves() : Promise.resolve({ success: true, data: {} }),
    ])
      .then(([myRes, allRes]) => {
        if (myRes.success && myRes.data) {
          const d = myRes.data as { leaves?: LeaveRequest[] }
          setMyLeaves(d.leaves ?? [])
        }
        if (isAdminOrManager && allRes.success && allRes.data) {
          const d = allRes.data as { leaves?: LeaveRequest[] }
          setAllLeaves(d.leaves ?? [])
        }
      })
      .finally(() => setLoading(false))
  }, [isAdminOrManager])

  useEffect(() => {
    load()
  }, [load])

  function handleSubmit(e: React.FormEvent<HTMLFormElement>): void {
    e.preventDefault()
    if (!startDate || !endDate) return
    setSubmitting(true)
    leaveApi
      .submit({ startDate, endDate, reason: reason || undefined })
      .then((res) => {
        if (res.success) {
          addToast('Leave submitted.')
          setStartDate('')
          setEndDate('')
          setReason('')
          setPanelOpen(false)
          load()
        } else {
          addToast((res as { message: string }).message ?? 'Failed', 'error')
        }
      })
      .finally(() => setSubmitting(false))
  }

  function handleApproveReject(id: string, status: LeaveStatus): void {
    leaveApi.update(id, { status }).then((res) => {
      if (res.success) {
        addToast(`Leave ${status}.`)
        load()
      } else {
        addToast((res as { message: string }).message ?? 'Failed', 'error')
      }
    })
  }

  const displayList = isAdminOrManager ? allLeaves : myLeaves
  const userName = (r: LeaveRequest): string =>
    typeof r.user === 'object' && r.user && 'fullName' in r.user
      ? (r.user as { fullName: string }).fullName
      : String(r.user)

  return (
    <div className="space-y-7">
      <div className="flex justify-end">
        {!isAdminOrManager && (
          <Button variant="primary" onClick={() => setPanelOpen(true)}>
            Apply Leave
          </Button>
        )}
      </div>

      <Card className="overflow-hidden p-0">
        {loading ? (
          <div className="flex justify-center py-24">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-[var(--app-border)] border-t-[var(--app-text)]" />
          </div>
        ) : (
          <DataTable<LeaveRequest>
            columns={[
              { key: 'user', header: 'User', render: (r) => userName(r) },
              { key: 'startDate', header: 'Start', render: (r) => r.startDate },
              { key: 'endDate', header: 'End', render: (r) => r.endDate },
              { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
              ...(isAdminOrManager
                ? [
                    {
                      key: '_id',
                      header: 'Actions',
                      render: (r: LeaveRequest) =>
                        r.status === 'pending' ? (
                          <div className="flex gap-2">
                            <Button size="sm" variant="primary" onClick={() => handleApproveReject(r._id, LeaveStatus.Approved)}>
                              Approve
                            </Button>
                            <Button size="sm" variant="secondary" onClick={() => handleApproveReject(r._id, LeaveStatus.Rejected)}>
                              Reject
                            </Button>
                          </div>
                        ) : (
                          '—'
                        ),
                    },
                  ]
                : []),
            ]}
            data={displayList}
            keyExtractor={(r) => r._id}
            emptyMessage="No leave requests"
          />
        )}
      </Card>

      <SlidePanel open={panelOpen} onClose={() => setPanelOpen(false)} title="Apply for leave">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Start date"
            type="date"
            value={startDate}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setStartDate(e.target.value)}
            required
          />
          <Input
            label="End date"
            type="date"
            value={endDate}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEndDate(e.target.value)}
            required
          />
          <Input
            label="Reason (optional)"
            value={reason}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setReason(e.target.value)}
          />
          <Button type="submit" variant="primary" loading={submitting}>
            Submit
          </Button>
        </form>
      </SlidePanel>
    </div>
  )
}
