import { createClient } from '@/lib/supabase/server'
import ApproveButton from '@/components/layout/ApproveButton'
import { Users } from 'lucide-react'
import type { Profile } from '@/types/database'

export const metadata = { title: 'Retailers — Admin' }

export default async function RetailersPage({ searchParams }: { searchParams: { filter?: string } }) {
  const supabase = createClient()
  const filter = searchParams.filter

  let query = supabase.from('profiles').select('*').eq('role', 'retailer').order('created_at', { ascending: false })
  if (filter === 'pending') query = query.eq('approval_status', 'pending')

  const { data: retailers } = await query.returns<Profile[]>()

  return (
    <div className="p-4 md:p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Retailers</h1>
          <p className="text-sm text-gray-500 mt-0.5">{retailers?.length ?? 0} {filter === 'pending' ? 'pending approval' : 'total'}</p>
        </div>
        <div className="flex gap-2">
          <a href="/admin/retailers" className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${!filter ? 'bg-brand-50 text-brand-700 border-brand-200' : 'text-gray-500 border-gray-200 hover:bg-gray-50'}`}>All</a>
          <a href="/admin/retailers?filter=pending" className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${filter === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'text-gray-500 border-gray-200 hover:bg-gray-50'}`}>Pending</a>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Retailer</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">City</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Joined</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {retailers?.map(r => (
                <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{r.full_name ?? '—'}</p>
                    <p className="text-xs text-gray-400">{r.shop_name ?? '—'}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-gray-700 text-xs">{r.email}</p>
                    <p className="text-gray-400 text-xs">{r.phone ?? '—'}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{r.city ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs">
                    {new Date(r.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-4 py-3">
                    <span className={
                      r.approval_status === 'approved' ? 'badge-approved' :
                      r.approval_status === 'pending' ? 'badge-pending' : 'badge-rejected'
                    }>{r.approval_status}</span>
                  </td>
                  <td className="px-4 py-3">
                    <ApproveButton retailerId={r.id} currentStatus={r.approval_status}/>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {(!retailers || retailers.length === 0) && (
            <div className="text-center py-12 text-gray-400">
              <Users size={24} className="mx-auto mb-2 opacity-40"/>
              <p className="text-sm">No retailers {filter === 'pending' ? 'pending approval' : 'found'}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
