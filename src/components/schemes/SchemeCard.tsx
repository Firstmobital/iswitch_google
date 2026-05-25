import Link from 'next/link'
import { Smartphone, IndianRupee, CreditCard, RefreshCw, ArrowRight } from 'lucide-react'
import type { Scheme } from '@/types/database'
import clsx from 'clsx'

interface Props {
  scheme: Scheme & { mobile_models: { name: string; storage: string } }
  featured?: boolean
}

export default function SchemeCard({ scheme, featured }: Props) {
  const { mobile_models: model } = scheme

  return (
    <Link
      href={`/retailer/schemes/${scheme.id}`}
      className={clsx(
        'card p-4 hover:shadow-md transition-all duration-150 group block',
        featured && 'ring-2 ring-brand-500'
      )}
    >
      {featured && (
        <div className="inline-flex items-center gap-1 text-xs font-medium text-brand-700 bg-brand-50 px-2 py-0.5 rounded-full mb-3">
          ⭐ Most popular
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0">
          <Smartphone size={20} className="text-gray-500"/>
        </div>
        <ArrowRight size={14} className="text-gray-300 group-hover:text-brand-500 transition-colors mt-1"/>
      </div>

      {/* Model name */}
      <p className="text-sm font-semibold text-gray-900 leading-tight">Google {model.name}</p>
      <p className="text-xs text-gray-400 mb-3">{model.storage}</p>

      {/* MOP */}
      <div className="flex items-baseline gap-1 mb-3">
        <IndianRupee size={12} className="text-gray-700 mb-0.5"/>
        <span className="text-xl font-bold text-gray-900">
          {scheme.mop.toLocaleString('en-IN')}
        </span>
        <span className="text-xs text-gray-400">MOP</span>
      </div>

      {/* Offer pills */}
      <div className="flex flex-wrap gap-1.5">
        {scheme.cashback_hdfc_emi > 0 && (
          <span className="flex items-center gap-1 text-xs bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded-full">
            <CreditCard size={10}/> HDFC ₹{(scheme.cashback_hdfc_emi / 1000).toFixed(0)}K
          </span>
        )}
        {scheme.emi_months.length > 0 && (
          <span className="flex items-center gap-1 text-xs bg-amber-50 text-amber-700 border border-amber-100 px-2 py-0.5 rounded-full">
            {scheme.emi_months.join('/')}M EMI
          </span>
        )}
      </div>
    </Link>
  )
}
