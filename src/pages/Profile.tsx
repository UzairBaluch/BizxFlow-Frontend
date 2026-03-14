import { useRef, useState } from 'react'
import { users as usersApi, company as companyApi } from '@/api/client'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'
import { Card, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export function ProfilePage(): React.ReactElement {
  const { user, company, accountType, setUser, setCompany } = useAuth()
  const { addToast } = useToast()
  const isCompany = accountType === 'company'

  const [fullName, setFullName] = useState(user?.fullName ?? '')
  const [companyName, setCompanyName] = useState(company?.companyName ?? '')
  const [profileSaving, setProfileSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [passwordSaving, setPasswordSaving] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handleSaveUserProfile(e: React.FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault()
    setProfileSaving(true)
    const res = await usersApi.updateProfile({ fullName: fullName.trim() })
    setProfileSaving(false)
    if (res.success && res.data?.user) {
      setUser(res.data.user)
      addToast('Profile updated.')
    } else {
      addToast((res as { message: string }).message ?? 'Failed', 'error')
    }
  }

  async function handleSaveCompanyProfile(e: React.FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault()
    setProfileSaving(true)
    const res = await companyApi.update({ companyName: companyName.trim() })
    setProfileSaving(false)
    const r = res as { data?: import('@/types/api').Company; _id?: string; message?: string }
    const updated = r.data ?? (r._id ? (res as unknown as import('@/types/api').Company) : null)
    if (updated) {
      setCompany(updated)
      addToast('Company updated.')
    } else {
      addToast(r.message ?? 'Failed', 'error')
    }
  }

  async function handleUserPhotoChange(e: React.ChangeEvent<HTMLInputElement>): Promise<void> {
    const file = e.target.files?.[0]
    if (!file || !user) return
    setUploading(true)
    const res = await usersApi.updateProfile({}, file)
    setUploading(false)
    if (res.success && res.data?.user) {
      setUser(res.data.user)
      addToast('Photo updated.')
    } else {
      addToast((res as { message: string }).message ?? 'Upload failed', 'error')
    }
    e.target.value = ''
  }

  async function handleCompanyLogoChange(e: React.ChangeEvent<HTMLInputElement>): Promise<void> {
    const file = e.target.files?.[0]
    if (!file || !company) return
    setUploading(true)
    const res = await companyApi.update({}, file)
    setUploading(false)
    const r = res as { data?: import('@/types/api').Company; _id?: string; message?: string }
    const updated = r.data ?? (r._id ? (res as unknown as import('@/types/api').Company) : null)
    if (updated) {
      setCompany(updated)
      addToast('Logo updated.')
    } else {
      addToast(r.message ?? 'Upload failed', 'error')
    }
    e.target.value = ''
  }

  async function handleChangePassword(e: React.FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault()
    if (!currentPassword || !newPassword) return
    setPasswordSaving(true)
    const res = await usersApi.changePassword({ currentPassword, newPassword })
    setPasswordSaving(false)
    if (res.success) {
      setCurrentPassword('')
      setNewPassword('')
      addToast('Password changed.')
    } else {
      addToast((res as { message: string }).message ?? 'Failed', 'error')
    }
  }

  if (!user && !company) return null as unknown as React.ReactElement

  if (isCompany && company) {
    return (
      <div className="grid gap-5 sm:gap-6 lg:grid-cols-2 lg:gap-7">
        <Card className="p-4 sm:p-5">
          <CardTitle className="mb-3 sm:mb-4">Company logo</CardTitle>
          <div className="flex flex-wrap items-start gap-4 sm:gap-6">
            <div className="relative">
              {company.logo ? (
                <img
                  src={company.logo}
                  alt=""
                  className="h-20 w-20 rounded-xl border-2 border-[var(--app-border)] object-cover sm:h-24 sm:w-24"
                />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-xl border-2 border-[var(--app-border)] bg-[var(--app-border)] font-display text-xl font-bold text-[var(--app-muted)] sm:h-24 sm:w-24 sm:text-2xl">
                  {(company.companyName ?? '?').charAt(0)}
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleCompanyLogoChange}
                className="absolute inset-0 cursor-pointer opacity-0"
                disabled={uploading}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="absolute -bottom-1 -right-1 flex h-9 w-9 items-center justify-center rounded-full border-2 border-[var(--app-card)] bg-[var(--app-text)] text-[var(--app-bg)] hover:opacity-90 disabled:opacity-50"
                title="Change logo"
              >
                {uploading ? '…' : '↑'}
              </button>
            </div>
            <p className="font-body text-xs text-[var(--app-muted)] sm:text-sm">{company.companyName} · Company</p>
          </div>
        </Card>

        <Card className="p-4 sm:p-5">
          <CardTitle className="mb-3 sm:mb-4">Update company</CardTitle>
          <form onSubmit={handleSaveCompanyProfile} className="space-y-4">
            <Input
              label="Company name"
              value={companyName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCompanyName(e.target.value)}
            />
            <Button type="submit" variant="primary" loading={profileSaving} disabled={profileSaving}>
              Save
            </Button>
          </form>
        </Card>

        <Card className="p-4 sm:p-5 lg:col-span-2">
          <CardTitle className="mb-3 sm:mb-4">Change password</CardTitle>
          <form onSubmit={handleChangePassword} className="max-w-md space-y-4">
            <Input
              label="Current password"
              type="password"
              value={currentPassword}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCurrentPassword(e.target.value)}
              required
            />
            <Input
              label="New password"
              type="password"
              value={newPassword}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewPassword(e.target.value)}
              required
            />
            <Button type="submit" variant="primary" loading={passwordSaving} disabled={passwordSaving}>
              Change password
            </Button>
          </form>
        </Card>
      </div>
    )
  }

  if (!user) return null as unknown as React.ReactElement

  return (
    <div className="grid gap-5 sm:gap-6 lg:grid-cols-2 lg:gap-7">
      <Card className="p-4 sm:p-5">
        <CardTitle className="mb-3 sm:mb-4">Profile picture</CardTitle>
        <div className="flex flex-wrap items-start gap-4 sm:gap-6">
          <div className="relative">
            {user.profilePicture ? (
              <img
                src={user.profilePicture}
                alt=""
                className="h-20 w-20 rounded-full border-2 border-[var(--app-border)] object-cover sm:h-24 sm:w-24"
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-[var(--app-border)] bg-[var(--app-border)] font-display text-xl font-bold text-[var(--app-muted)] sm:h-24 sm:w-24 sm:text-2xl">
                {(user.fullName ?? '?').charAt(0)}
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleUserPhotoChange}
              className="absolute inset-0 cursor-pointer opacity-0"
              disabled={uploading}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="absolute -bottom-1 -right-1 flex h-9 w-9 items-center justify-center rounded-full border-2 border-[var(--app-card)] bg-[var(--app-text)] text-[var(--app-bg)] hover:opacity-90 disabled:opacity-50"
              title="Change photo"
            >
              {uploading ? '…' : '↑'}
            </button>
          </div>
          <p className="font-body text-xs text-[var(--app-muted)] sm:text-sm">
            {user.fullName} · {user.role}
          </p>
        </div>
      </Card>

      <Card className="p-4 sm:p-5">
        <CardTitle className="mb-3 sm:mb-4">Update profile</CardTitle>
        <form onSubmit={handleSaveUserProfile} className="space-y-4">
          <Input
            label="Full name"
            value={fullName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFullName(e.target.value)}
          />
          <Button type="submit" variant="primary" loading={profileSaving} disabled={profileSaving}>
            Save
          </Button>
        </form>
      </Card>

      <Card className="p-4 sm:p-5 lg:col-span-2">
        <CardTitle className="mb-3 sm:mb-4">Change password</CardTitle>
        <form onSubmit={handleChangePassword} className="max-w-md space-y-4">
          <Input
            label="Current password"
            type="password"
            value={currentPassword}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCurrentPassword(e.target.value)}
            required
          />
          <Input
            label="New password"
            type="password"
            value={newPassword}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewPassword(e.target.value)}
            required
          />
          <Button type="submit" variant="primary" loading={passwordSaving} disabled={passwordSaving}>
            Change password
          </Button>
        </form>
      </Card>
    </div>
  )
}
