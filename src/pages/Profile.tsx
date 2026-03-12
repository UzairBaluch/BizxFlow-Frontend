import { useRef, useState } from 'react'
import { users as usersApi } from '@/api/client'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'
import { Card, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export function ProfilePage(): React.ReactElement {
  const { user, setUser } = useAuth()
  const { addToast } = useToast()
  const [fullName, setFullName] = useState(user?.fullName ?? '')
  const [profileSaving, setProfileSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [passwordSaving, setPasswordSaving] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const isDemo = user?._id === 'demo'

  async function handleSaveProfile(e: React.FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault()
    if (isDemo) {
      addToast('Sign in to update profile.', 'error')
      return
    }
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

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>): Promise<void> {
    const file = e.target.files?.[0]
    if (!file || isDemo) return
    setUploading(true)
    const res = await usersApi.uploadProfilePicture(file)
    setUploading(false)
    if (res.success && res.data && user) {
      const updated = (res.data as { user?: { profilePicture?: string } }).user
      if (updated?.profilePicture) {
        setUser({ ...user, profilePicture: updated.profilePicture })
        addToast('Photo updated.')
      } else if ((res.data as { profilePicture?: string }).profilePicture) {
        setUser({ ...user, profilePicture: (res.data as { profilePicture: string }).profilePicture })
        addToast('Photo updated.')
      }
    } else {
      addToast((res as { message: string }).message ?? 'Upload failed', 'error')
    }
    e.target.value = ''
  }

  async function handleChangePassword(e: React.FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault()
    if (!currentPassword || !newPassword) return
    if (isDemo) {
      addToast('Sign in to change password.', 'error')
      return
    }
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

  if (!user) return null as unknown as React.ReactElement

  return (
    <div className="grid gap-7 lg:grid-cols-2">
      <Card className="p-5">
        <CardTitle className="mb-4">Profile picture</CardTitle>
        <div className="flex flex-wrap items-start gap-6">
          <div className="relative">
            {user.profilePicture ? (
              <img
                src={user.profilePicture}
                alt=""
                className="h-24 w-24 rounded-full border-2 border-[var(--app-border)] object-cover"
              />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-full border-2 border-[var(--app-border)] bg-[var(--app-border)] font-display text-2xl font-bold text-[var(--app-muted)]">
                {(user.fullName ?? '?').charAt(0)}
              </div>
            )}
            {!isDemo && (
              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="absolute inset-0 cursor-pointer opacity-0"
                  disabled={uploading}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full border-2 border-[var(--app-card)] bg-[var(--app-text)] text-[var(--app-bg)] hover:opacity-90 disabled:opacity-50"
                  title="Change photo"
                >
                  {uploading ? '…' : '↑'}
                </button>
              </>
            )}
          </div>
          <p className="font-body text-sm text-[var(--app-muted)]">
            {user.fullName} · {user.role}
          </p>
        </div>
      </Card>

      <Card className="p-5">
        <CardTitle className="mb-4">Update profile</CardTitle>
        <form onSubmit={handleSaveProfile} className="space-y-4">
          <Input
            label="Full name"
            value={fullName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFullName(e.target.value)}
            disabled={isDemo}
          />
          <Button type="submit" variant="primary" loading={profileSaving} disabled={isDemo}>
            Save
          </Button>
        </form>
      </Card>

      <Card className="p-5 lg:col-span-2">
        <CardTitle className="mb-4">Change password</CardTitle>
        <form onSubmit={handleChangePassword} className="max-w-md space-y-4">
          <Input
            label="Current password"
            type="password"
            value={currentPassword}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCurrentPassword(e.target.value)}
            required
            disabled={isDemo}
          />
          <Input
            label="New password"
            type="password"
            value={newPassword}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewPassword(e.target.value)}
            required
            disabled={isDemo}
          />
          <Button type="submit" variant="primary" loading={passwordSaving} disabled={isDemo}>
            Change password
          </Button>
        </form>
      </Card>
    </div>
  )
}
