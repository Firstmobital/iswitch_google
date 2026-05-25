'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { CheckCircle, XCircle } from 'lucide-react'
import type { ApprovalStatus } from '@/types/database'

interface Props {
  retailerId: string
  currentStatus: ApprovalStatus
}

export default function ApproveButton({ retailerId, currentStatus }: Props) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function updateStatus(status: ApprovalStatus) {
    setLoading(true)
    await (supabase.from('profiles') as any).update({ approval_status: status }).eq('id', retailerId)
    router.refresh()
    setLoading(false)
  }

  if (currentStatus === 'approved') {
    return (
      <button onClick={() => updateStatus('rejected')} disabled={loading}
        className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs border border-red-200 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50">
        <XCircle size={11}/> Revoke
      </button>
    )
  }

  if (currentStatus === 'pending') {
    return (
      <div className="flex gap-1">
        <button onClick={() => updateStatus('approved')} disabled={loading}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs bg-green-50 border border-green-200 text-green-700 hover:bg-green-100 rounded-lg transition-colors disabled:opacity-50">
          <CheckCircle size={11}/> Approve
        </button>
        <button onClick={() => updateStatus('rejected')} disabled={loading}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs border border-red-200 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50">
          <XCircle size={11}/> Reject
        </button>
      </div>
    )
  }

  return (
    <button onClick={() => updateStatus('approved')} disabled={loading}
      className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs bg-green-50 border border-green-200 text-green-700 hover:bg-green-100 rounded-lg transition-colors disabled:opacity-50">
      <CheckCircle size={11}/> Re-approve
    </button>
  )
}
