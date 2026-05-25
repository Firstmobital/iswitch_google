import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Layers, Users, UserCheck, ArrowRight } from 'lucide-react'
import { ROUTES } from '@/lib/config'

export const metadata = { title: 'Admin dashboard' }

export default async function AdminHomePage() {
  const supabase = createClient()

  const [{ count: publishedSchemes }, { count: totalRetailers }, { count: pendingApprovals }] = await Promise.all([
    supabase.from('schemes').select('*', { count: 'exact', head: true }).eq('status', 'published'),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'retailer'),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'retailer').eq('approval_status', 'pending'),
  ])

  const stats = [
    { label: 'Published schemes', value: publishedSchemes ?? 0, color: 'text-brand-600', href: ROUTES.admin.schemes },
    { label: 'Active retailers', value: totalRetailers ?? 0, color: 'text-green-600', href: ROUTES.admin.retailers },
    { label: 'Pending approvals', value: pendingApprovals ?? 0, color: 'text-amber-600', href: `${ROUTES.admin.retailers}?filter=pending` },
  ]

  return (
    <div className="p-4 md:p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-0.5">Overview · May 2026</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        {stats.map(stat => (
          <Link key={stat.label} href={stat.href} className="card p-4 hover:shadow-md transition-shadow">
            <p className="text-xs text-gray-500 mb-1">{stat.label}</p>
            <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
          </Link>
        ))}
      </div>

      <div className="space-y-2">
        {[
          { label: 'Manage schemes', sub: 'Edit, publish, or create new scheme entries', href: ROUTES.admin.schemes, Icon: Layers },
          { label: 'Retailer approvals', sub: `${pendingApprovals} retailers waiting for approval`, href: `${ROUTES.admin.retailers}?filter=pending`, Icon: UserCheck },
          { label: 'All retailers', sub: `${totalRetailers} registered retailers`, href: ROUTES.admin.retailers, Icon: Users },
        ].map(item => (
          <Link key={item.href} href={item.href} className="flex items-center justify-between p-4 card hover:border-gray-300 transition-colors group">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                <item.Icon size={16} className="text-gray-600"/>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{item.label}</p>
                <p className="text-xs text-gray-500">{item.sub}</p>
              </div>
            </div>
            <ArrowRight size={14} className="text-gray-400 group-hover:text-gray-700 transition-colors"/>
          </Link>
        ))}
      </div>
    </div>
  )
}
