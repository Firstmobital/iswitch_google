import { Mail } from 'lucide-react'
import { APP_CONFIG } from '@/lib/config'

export default function VerifyPage() {
  return (
    <div className="w-full max-w-sm text-center">
      <div className="card p-8">
        <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-4">
          <Mail size={24} className="text-brand-500"/>
        </div>
        <h1 className="text-lg font-semibold text-gray-900 mb-2">Check your email</h1>
        <p className="text-sm text-gray-500 mb-4">
          We&apos;ve sent a verification link to your email address. Click the link to verify your account.
        </p>
        <p className="text-xs text-gray-400">
          After verification, our team at {APP_CONFIG.name} will review and approve your retailer account. This usually takes 1 business day.
        </p>
      </div>
    </div>
  )
}
