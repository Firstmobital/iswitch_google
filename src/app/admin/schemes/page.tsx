import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Plus, Edit, Eye } from 'lucide-react'
import { ROUTES } from '@/lib/config'
import type { MobileModel, Scheme } from '@/types/database'

type SchemeWithModel = Scheme & {
  mobile_models: Pick<MobileModel, 'name' | 'storage'> | null
}

export const metadata = { title: 'Schemes — Admin' }

export default async function AdminSchemesPage() {
  const supabase = createClient()

  const { data: schemes } = await supabase
    .from('schemes')
    .select('*, mobile_models(name, storage)')
    .order('created_at', { ascending: true })

  const typedSchemes = schemes as SchemeWithModel[] | null

  return (
    <div className="p-4 md:p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Schemes</h1>
          <p className="text-sm text-gray-500 mt-0.5">{typedSchemes?.length ?? 0} total</p>
        </div>
        <Link href={ROUTES.admin.schemesNew}
          className="inline-flex items-center gap-2 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium rounded-lg transition-colors">
          <Plus size={15}/> New scheme
        </Link>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Model</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">MOP</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">HDFC CB (EMI)</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Valid till</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {typedSchemes?.map(scheme => {
                const model = scheme.mobile_models as any
                return (
                  <tr key={scheme.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {model?.name} <span className="text-xs text-gray-400 font-normal">{model?.storage}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-700">₹{scheme.mop.toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3 text-gray-700">₹{scheme.cashback_hdfc_emi.toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {new Date(scheme.valid_to).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </td>
                    <td className="px-4 py-3">
                      <span className={
                        scheme.status === 'published' ? 'badge-published' :
                        scheme.status === 'draft' ? 'badge-draft' : 'badge-pending'
                      }>
                        {scheme.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Link href={`/admin/schemes/${scheme.id}/edit`}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">
                          <Edit size={11}/> Edit
                        </Link>
                        <Link href={`/retailer/schemes/${scheme.id}`} target="_blank"
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">
                          <Eye size={11}/> Preview
                        </Link>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {(!typedSchemes || typedSchemes.length === 0) && (
            <div className="text-center py-12 text-gray-400">
              <p className="text-sm">No schemes yet. <Link href={ROUTES.admin.schemesNew} className="text-brand-600 hover:underline">Create the first one →</Link></p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
