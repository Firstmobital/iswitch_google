import { Clock } from 'lucide-react'
import Link from 'next/link'
import { APP_CONFIG, ROUTES } from '@/lib/config'

export default function PendingPage() {
  return (
    <div className="w-full max-w-sm text-center">
      <div className="card p-8">
        <div className="w-14 h-14 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-4">
          <Clock size={24} className="text-amber-500"/>
        </div>
        <h1 className="text-lg font-semibold text-gray-900 mb-2">Approval pending</h1>
        <p className="text-sm text-gray-500 mb-4">
          Your account has been submitted and is currently under review. You&apos;ll receive an email once approved.
        </p>
        <p className="text-xs text-gray-400 mb-6">
          For urgent queries, contact your {APP_CONFIG.name} sales representative.
        </p>
        <Link href={ROUTES.login} className="text-sm text-brand-600 hover:underline">← Back to login</Link>
      </div>
    </div>
  )
}
