import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Layers, ArrowRight, Calendar } from 'lucide-react'
import { ROUTES, APP_CONFIG } from '@/lib/config'
import type { Profile } from '@/types/database'

type RetailerProfile = Pick<Profile, 'full_name' | 'shop_name'>

export default async function RetailerHomePage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profileData } = await supabase
    .from('profiles')
    .select('full_name, shop_name')
    .eq('id', user!.id)
    .single()

  const profile = profileData as RetailerProfile | null

  const { count: schemeCount } = await supabase
    .from('schemes')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'published')

  const today = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <div className="p-4 md:p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">
          Welcome, {profile?.full_name?.split(' ')[0] ?? 'Retailer'} 👋
        </h1>
        <p className="text-sm text-gray-500 mt-1">{profile?.shop_name} · {today}</p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
        <div className="card p-4">
          <p className="text-xs text-gray-500 mb-1">Active schemes</p>
          <p className="text-2xl font-semibold text-brand-600">{schemeCount ?? 0}</p>
          <p className="text-xs text-gray-400 mt-1">Models available</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-gray-500 mb-1">Current period</p>
          <p className="text-lg font-semibold text-gray-900">May 2026</p>
          <p className="text-xs text-gray-400 mt-1">Expires 31 May</p>
        </div>
        <div className="card p-4 col-span-2 md:col-span-1">
          <p className="text-xs text-gray-500 mb-1">Best cashback</p>
          <p className="text-lg font-semibold text-green-700">₹10,000</p>
          <p className="text-xs text-gray-400 mt-1">Pixel 10 Pro via HDFC</p>
        </div>
      </div>

      {/* Quick action */}
      <Link href={ROUTES.retailer.schemes}
        className="flex items-center justify-between p-4 card hover:border-brand-300 transition-colors group mb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-brand-50 flex items-center justify-center">
            <Layers size={18} className="text-brand-600"/>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">View May 2026 schemes</p>
            <p className="text-xs text-gray-500">All Google Pixel models · Current offers</p>
          </div>
        </div>
        <ArrowRight size={16} className="text-gray-400 group-hover:text-brand-600 transition-colors"/>
      </Link>

      {/* Notice */}
      <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl text-sm text-blue-700">
        <div className="flex items-start gap-2">
          <Calendar size={15} className="mt-0.5 shrink-0"/>
          <div>
            <p className="font-medium">Scheme valid 1–31 May 2026</p>
            <p className="text-xs text-blue-600 mt-0.5">{APP_CONFIG.schemeNote}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
