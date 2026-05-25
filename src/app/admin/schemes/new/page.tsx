import { createClient } from '@/lib/supabase/server'
import SchemeForm from '@/components/schemes/SchemeForm'
import type { MobileModel } from '@/types/database'

export const metadata = { title: 'New scheme — Admin' }

export default async function NewSchemePage() {
  const supabase = createClient()
  const { data: modelsData } = await supabase
    .from('mobile_models')
    .select('id, name, storage')
    .eq('is_active', true)
    .order('sort_order')

  const models = (modelsData ?? []) as Pick<MobileModel, 'id' | 'name' | 'storage'>[]

  return (
    <div className="p-4 md:p-6 max-w-2xl">
      <h1 className="text-xl font-semibold text-gray-900 mb-5">New scheme</h1>
      <SchemeForm models={models} />
    </div>
  )
}
