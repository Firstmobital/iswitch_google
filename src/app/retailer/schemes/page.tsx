import { createClient } from '@/lib/supabase/server'
import SchemeCard from '@/components/schemes/SchemeCard'
import { Calendar, CheckCircle } from 'lucide-react'
import { APP_CONFIG } from '@/lib/config'
import type { MobileModel, Scheme } from '@/types/database'

type SchemeWithModel = Scheme & {
  mobile_models: Pick<MobileModel, 'name' | 'storage'> | null
}

export const metadata = { title: 'Schemes' }

export default async function SchemesPage() {
  const supabase = createClient()

  const { data: schemes } = await supabase
    .from('schemes')
    .select(`
      *,
      mobile_models (name, storage)
    `)
    .eq('status', 'published')
    .order('created_at', { ascending: true })

  const typedSchemes = schemes as SchemeWithModel[] | null

  return (
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Schemes</h1>
          <p className="text-sm text-gray-500 mt-0.5">Google Pixel — May 2026</p>
        </div>
        <div className="flex items-center gap-1.5 bg-green-50 border border-green-200 text-green-700 text-xs font-medium px-2.5 py-1.5 rounded-full">
          <CheckCircle size={12}/>Active
        </div>
      </div>

      {/* Period banner */}
      <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-100 rounded-xl mb-5 text-sm text-blue-700">
        <Calendar size={14} className="shrink-0"/>
        <span>Valid 1 May – 31 May 2026 · {APP_CONFIG.schemeNote}</span>
      </div>

      {/* Cards grid */}
      {typedSchemes && typedSchemes.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {typedSchemes.map((scheme, i) => (
            <SchemeCard
              key={scheme.id}
              scheme={scheme as any}
              featured={scheme.mobile_models?.name === 'Pixel 10'}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-gray-400">
          <p className="text-lg font-medium mb-1">No active schemes</p>
          <p className="text-sm">Check back soon for the latest offers.</p>
        </div>
      )}
    </div>
  )
}
