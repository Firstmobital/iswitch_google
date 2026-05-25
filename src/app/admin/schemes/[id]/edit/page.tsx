import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import SchemeForm from '@/components/schemes/SchemeForm'
import type { ExchangeOffer, FinanceScheme, MobileModel, Scheme } from '@/types/database'

type SchemeWithRelations = Scheme & {
  exchange_offers: ExchangeOffer[]
  finance_schemes: FinanceScheme[]
}

export const metadata = { title: 'Edit scheme — Admin' }

export default async function EditSchemePage({ params }: { params: { id: string } }) {
  const supabase = createClient()

  const [{ data: schemeData }, { data: modelsData }] = await Promise.all([
    supabase.from('schemes').select('*, exchange_offers(*), finance_schemes(*)').eq('id', params.id).single(),
    supabase.from('mobile_models').select('id, name, storage').eq('is_active', true).order('sort_order'),
  ])

  const scheme = schemeData as SchemeWithRelations | null
  const models = (modelsData ?? []) as Pick<MobileModel, 'id' | 'name' | 'storage'>[]

  if (!scheme) notFound()

  return (
    <div className="p-4 md:p-6 max-w-2xl">
      <h1 className="text-xl font-semibold text-gray-900 mb-5">Edit scheme</h1>
      <SchemeForm models={models} scheme={scheme as any}/>
    </div>
  )
}
