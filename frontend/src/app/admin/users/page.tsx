'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { Badge } from '@/components/ui/Badge'
import { adminApi } from '@/lib/api/admin'
import type { UserAccountSummaryDto } from '@/types/admin'

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserAccountSummaryDto[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    adminApi.getUserList().then(setUsers).finally(() => setIsLoading(false))
  }, [])

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-stone-900">User Accounts</h1>
        <p className="mt-1 text-sm text-stone-500">Manage all registered users and their account status</p>
      </div>
      {isLoading ? <LoadingSpinner className="py-12" /> : (
        <div className="rounded-xl border border-stone-200 bg-white overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-stone-50 border-b border-stone-200">
              <tr>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-stone-500">Name</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-stone-500">Email</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-stone-500">Role</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-stone-500">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {users.map(u => (
                <tr key={u.userId} className="hover:bg-stone-50 transition-colors cursor-pointer">
                  <td className="px-5 py-3.5">
                    <Link href={`/admin/users/${u.userId}`} className="font-medium text-teal-700 hover:text-teal-900 hover:underline">{u.fullName}</Link>
                  </td>
                  <td className="px-5 py-3.5 text-stone-600">{u.email}</td>
                  <td className="px-5 py-3.5">
                    <span className="inline-flex items-center rounded-full bg-stone-100 px-2.5 py-0.5 text-xs font-medium text-stone-700">{u.role}</span>
                  </td>
                  <td className="px-5 py-3.5"><Badge status={u.accountStatus} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
