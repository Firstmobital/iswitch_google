import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Smartphone, IndianRupee, CreditCard, RefreshCw, Calendar, CheckCircle } from 'lucide-react'
import { ROUTES } from '@/lib/config'
import type { ExchangeOffer, FinanceScheme, MobileModel, Scheme } from '@/types/database'

type SchemeWithRelations = Scheme & {
  mobile_models: MobileModel | null
  exchange_offers: ExchangeOffer[]
  finance_schemes: FinanceScheme[]
}

export default async function SchemeDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient()

  const { data: schemeData } = await supabase
    .from('schemes')
    .select(`*, mobile_models(*), exchange_offers(*), finance_schemes(*)`)
    .eq('id', params.id)
    .eq('status', 'published')
    .single()

  const scheme = schemeData as SchemeWithRelations | null

  if (!scheme) notFound()

  const model = scheme.mobile_models as any
  const exchanges = scheme.exchange_offers as any[]
  const finances = scheme.finance_schemes as any[]

  return (
    <div className="p-4 md:p-6 max-w-2xl">
      {/* Back */}
      <Link href={ROUTES.retailer.schemes} className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mb-4 transition-colors">
        <ArrowLeft size={14}/> Back to schemes
      </Link>

      {/* Hero card */}
      <div className="card p-5 mb-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0">
            <Smartphone size={24} className="text-gray-500"/>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h1 className="text-lg font-semibold text-gray-900">Google {model.name}</h1>
                <p className="text-sm text-gray-500">{model.storage} · {model.color_options}</p>
              </div>
              <span className="badge-published shrink-0"><CheckCircle size={10}/>Live</span>
            </div>
            <div className="flex items-baseline gap-1 mt-2">
              <IndianRupee size={14} className="text-gray-800"/>
              <span className="text-2xl font-bold text-gray-900">{scheme.mop.toLocaleString('en-IN')}</span>
              <span className="text-sm text-gray-400">MOP</span>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing */}
      <div className="card p-4 mb-4">
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Pricing</h2>
        <div className="space-y-2.5">
          {[
            ['Dealer landing price', `₹${scheme.dealer_landing?.toLocaleString('en-IN') ?? 'N/A'}`],
            ['Consumer offer (incl. GST)', scheme.consumer_offer_gst === 0 ? '—' : `₹${scheme.consumer_offer_gst.toLocaleString('en-IN')}`],
            ['Consumer offer note', scheme.consumer_offer_note ?? 'At activation'],
            ['Min swipe', `₹${scheme.min_swipe?.toLocaleString('en-IN') ?? 'N/A'}`],
            ['Max swipe', `₹${scheme.max_swipe?.toLocaleString('en-IN') ?? 'N/A'}`],
            ['Swipe type', scheme.swipe_type],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between items-center py-1.5 border-b border-gray-50 last:border-0">
              <span className="text-sm text-gray-500">{k}</span>
              <span className="text-sm font-medium text-gray-900">{v}</span>
            </div>
          ))}
        </div>
      </div>

      {/* HDFC Cashback */}
      <div className="card p-4 mb-4">
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <CreditCard size={12}/>HDFC Bank cashback
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-blue-50 rounded-xl p-3">
            <p className="text-xs text-blue-600 mb-1">EMI transactions</p>
            <p className="text-xl font-bold text-blue-700">₹{scheme.cashback_hdfc_emi.toLocaleString('en-IN')}</p>
          </div>
          <div className="bg-green-50 rounded-xl p-3">
            <p className="text-xs text-green-600 mb-1">Full swipe</p>
            <p className="text-xl font-bold text-green-700">₹{scheme.cashback_hdfc_full.toLocaleString('en-IN')}</p>
          </div>
        </div>
        {scheme.emi_months.length > 0 && (
          <div className="mt-3">
            <p className="text-xs text-gray-500 mb-1.5">No-cost EMI options</p>
            <div className="flex flex-wrap gap-1.5">
              {scheme.emi_months.map(m => (
                <span key={m} className="text-xs bg-amber-50 text-amber-700 border border-amber-100 px-2.5 py-1 rounded-full font-medium">{m} months</span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Exchange offers */}
      {exchanges && exchanges.length > 0 && (
        <div className="card p-4 mb-4">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <RefreshCw size={12}/>Exchange bonus
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {exchanges.map((ex: any) => (
              <div key={ex.id} className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs font-semibold text-gray-700 mb-2">Via {ex.platform}</p>
                {[
                  ['Old device ₹3K–10K', ex.tier_3_10k],
                  ['Old device ₹10K–15K', ex.tier_10_15k],
                  ['Old device ₹15K+', ex.tier_15k_plus],
                ].map(([label, val]) => (
                  <div key={label as string} className="flex justify-between text-xs py-1 border-b border-gray-100 last:border-0">
                    <span className="text-gray-500">{label}</span>
                    <span className="font-medium text-gray-900">₹{(val as number).toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-2">Min trade-in value ₹3,000. Exchange bonus can be clubbed with HDFC cashback.</p>
        </div>
      )}

      {/* Finance partners */}
      {finances && finances.length > 0 && (
        <div className="card p-4 mb-4">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Finance partners</h2>
          <div className="space-y-2">
            {finances.map((f: any) => (
              <div key={f.id} className="flex items-start justify-between py-2 border-b border-gray-50 last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-900">{f.partner}</p>
                  <p className="text-xs text-gray-500 mt-0.5">Tenures: {f.tenure_options}</p>
                </div>
                <span className="text-xs bg-orange-50 text-orange-700 border border-orange-100 px-2 py-0.5 rounded-full shrink-0 ml-2">
                  {f.dealer_charge_pct}% dealer charge
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Validity */}
      <div className="flex items-center gap-2 p-3 bg-gray-50 border border-gray-100 rounded-xl text-xs text-gray-500">
        <Calendar size={13}/> Valid {new Date(scheme.valid_from).toLocaleDateString('en-IN', {day:'numeric',month:'long'})} – {new Date(scheme.valid_to).toLocaleDateString('en-IN', {day:'numeric',month:'long',year:'numeric'})}
        {scheme.notes && <span className="ml-2 text-gray-400">· {scheme.notes}</span>}
      </div>
    </div>
  )
}
