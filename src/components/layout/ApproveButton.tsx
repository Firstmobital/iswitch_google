'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import type { ApprovalStatus } from '@/types/database'

interface Props {
  retailerId: string
  currentStatus: ApprovalStatus
}

export default function ApproveButton({ retailerId, currentStatus }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function updateStatus(status: ApprovalStatus) {
    // Confirmation dialog for destructive actions
    const message = 
      status === 'approved' ? 'Approve this retailer?' :
      status === 'rejected' ? 'Reject this retailer?' :
      'Change approval status?'
    
    if (!confirm(message)) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/admin/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ retailerId, status }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || `Failed to update (HTTP ${response.status})`)
      }

      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  if (currentStatus === 'approved') {
    return (
      <div>
        {error && <p className="text-xs text-red-600 mb-1 flex items-center gap-1"><AlertCircle size={12}/>{error}</p>}
        <button onClick={() => updateStatus('rejected')} disabled={loading}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs border border-red-200 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50">
          <XCircle size={11}/> Revoke
        </button>
      </div>
    )
  }

  if (currentStatus === 'pending') {
    return (
      <div>
        {error && <p className="text-xs text-red-600 mb-1 flex items-center gap-1"><AlertCircle size={12}/>{error}</p>}
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
      </div>
    )
  }

  return (
    <div>
      {error && <p className="text-xs text-red-600 mb-1 flex items-center gap-1"><AlertCircle size={12}/>{error}</p>}
      <button onClick={() => updateStatus('approved')} disabled={loading}
        className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs bg-green-50 border border-green-200 text-green-700 hover:bg-green-100 rounded-lg transition-colors disabled:opacity-50">
        <CheckCircle size={11}/> Re-approve
      </button>
    </div>
  )
}

