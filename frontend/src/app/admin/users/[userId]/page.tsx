'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ConfirmActionModal } from '@/components/owner/ConfirmActionModal'
import { adminApi } from '@/lib/api/admin'
import type { UserAccountDetailDto } from '@/types/admin'

export default function AdminUserDetailPage() {
  const { userId } = useParams<{ userId: string }>()
  const [user, setUser] = useState<UserAccountDetailDto | null>(null)
  const [modal, setModal] = useState<string | null>(null)
  const [isActing, setIsActing] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const load = () => { adminApi.getUserDetail(userId).then(setUser) }
  useEffect(() => { load() }, [userId])

  const handleAction = async () => {
    if (!modal || !user) return
    setIsActing(true)
    try {
      if (modal === 'Suspend') await adminApi.suspendAccount(userId)
      else if (modal === 'Enable') await adminApi.enableAccount(userId)
      else if (modal === 'Disable') await adminApi.disableAccount(userId)
      setMessage(`Account ${modal.toLowerCase()}d`)
      setModal(null)
      load()
    } catch (err: unknown) {
      setMessage(err instanceof Error ? err.message : 'Failed')
    } finally {
      setIsActing(false)
    }
  }

  if (!user) return <div className="py-12 text-center">Loading...</div>

  return (
    <div className="max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold">{user.fullName}</h1>
      {message && (
        <div className="mb-4 rounded-lg bg-blue-50 p-3 text-sm text-blue-800">{message}</div>
      )}
      <div className="rounded-xl border bg-white p-6 space-y-3 mb-6">
        <div className="flex gap-2">
          <span className="text-stone-500 w-24">Email</span>
          <span>{user.email}</span>
        </div>
        <div className="flex gap-2">
          <span className="text-stone-500 w-24">Role</span>
          <span>{user.role}</span>
        </div>
        <div className="flex gap-2">
          <span className="text-stone-500 w-24">Status</span>
          <Badge status={user.accountStatus} />
        </div>
      </div>
      <div className="flex gap-3">
        {user.availableActions.map(action => (
          <Button
            key={action}
            variant={action === 'Disable' ? 'danger' : action === 'Suspend' ? 'secondary' : 'primary'}
            onClick={() => setModal(action)}
          >
            {action}
          </Button>
        ))}
      </div>
      <ConfirmActionModal
        isOpen={!!modal}
        onClose={() => setModal(null)}
        onConfirm={handleAction}
        title={`${modal} Account`}
        message={`Are you sure you want to ${modal?.toLowerCase()} this account?`}
        variant={modal === 'Disable' ? 'danger' : 'primary'}
        isLoading={isActing}
      />
    </div>
  )
}
