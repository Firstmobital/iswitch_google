'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ROUTES } from '@/lib/config'
import { Save, Trash2, Plus } from 'lucide-react'
import Link from 'next/link'

const schema = z.object({
  model_id: z.string().min(1, 'Select a model'),
  status: z.enum(['draft', 'published', 'expired']),
  mop: z.coerce.number().positive(),
  dealer_landing: z.coerce.number().positive(),
  consumer_offer_gst: z.coerce.number().min(0).default(0),
  consumer_offer_note: z.string().optional(),
  cashback_hdfc_emi: z.coerce.number().min(0).default(0),
  cashback_hdfc_full: z.coerce.number().min(0).default(0),
  min_swipe: z.coerce.number().min(0).optional(),
  max_swipe: z.coerce.number().min(0).optional(),
  swipe_type: z.enum(['Full Swipe', 'NCEMI', 'Full Swipe/NCEMI']),
  emi_6: z.boolean().default(false),
  emi_9: z.boolean().default(false),
  emi_12: z.boolean().default(false),
  valid_from: z.string().min(1, 'Enter valid from date'),
  valid_to: z.string().min(1, 'Enter valid to date'),
  notes: z.string().optional(),
})
type FormData = z.infer<typeof schema>

interface Model { id: string; name: string; storage: string }

interface Props {
  models: Model[]
  scheme?: any
}

export default function SchemeForm({ models, scheme }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: scheme ? {
      model_id: scheme.model_id,
      status: scheme.status,
      mop: scheme.mop,
      dealer_landing: scheme.dealer_landing,
      consumer_offer_gst: scheme.consumer_offer_gst,
      consumer_offer_note: scheme.consumer_offer_note ?? '',
      cashback_hdfc_emi: scheme.cashback_hdfc_emi,
      cashback_hdfc_full: scheme.cashback_hdfc_full,
      min_swipe: scheme.min_swipe,
      max_swipe: scheme.max_swipe,
      swipe_type: scheme.swipe_type,
      emi_6: scheme.emi_months?.includes('6'),
      emi_9: scheme.emi_months?.includes('9'),
      emi_12: scheme.emi_months?.includes('12'),
      valid_from: scheme.valid_from,
      valid_to: scheme.valid_to,
      notes: scheme.notes ?? '',
    } : {
      status: 'draft',
      swipe_type: 'Full Swipe/NCEMI',
      valid_from: '2026-05-01',
      valid_to: '2026-05-31',
      consumer_offer_gst: 0,
      cashback_hdfc_emi: 0,
      cashback_hdfc_full: 0,
    },
  })

  async function onSubmit(data: FormData) {
    setLoading(true)
    setError('')

    const emi_months = [
      data.emi_6 ? '6' : null,
      data.emi_9 ? '9' : null,
      data.emi_12 ? '12' : null,
    ].filter(Boolean) as string[]

    const payload = {
      id: scheme?.id,
      model_id: data.model_id,
      status: data.status,
      mop: data.mop,
      dealer_landing: data.dealer_landing,
      consumer_offer_gst: data.consumer_offer_gst,
      consumer_offer_note: data.consumer_offer_note || null,
      cashback_hdfc_emi: data.cashback_hdfc_emi,
      cashback_hdfc_full: data.cashback_hdfc_full,
      min_swipe: data.min_swipe || null,
      max_swipe: data.max_swipe || null,
      swipe_type: data.swipe_type,
      emi_months,
      valid_from: data.valid_from,
      valid_to: data.valid_to,
      notes: data.notes || null,
    }

    try {
      const response = await fetch('/api/schemes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || `Failed (HTTP ${response.status})`)
      }

      router.push(ROUTES.admin.schemes)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      setLoading(false)
    }
  }

  async function deleteScheme() {
    if (!scheme || !confirm('Delete this scheme? This cannot be undone.')) return
    
    setLoading(true)
    setError('')

    try {
      const response = await fetch(`/api/schemes?id=${scheme.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || `Failed (HTTP ${response.status})`)
      }

      router.push(ROUTES.admin.schemes)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      setLoading(false)
    }
  }

  const Section = ({ title }: { title: string }) => (
    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mt-5 mb-3 pb-1 border-b border-gray-100">{title}</p>
  )

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-1">
      <Section title="Model & status"/>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Model</label>
          <select {...register('model_id')} className="input-field">
            <option value="">Select model…</option>
            {models.map(m => <option key={m.id} value={m.id}>{m.name} · {m.storage}</option>)}
          </select>
          {errors.model_id && <p className="text-xs text-red-500 mt-1">{errors.model_id.message}</p>}
        </div>
        <div>
          <label className="label">Status</label>
          <select {...register('status')} className="input-field">
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="expired">Expired</option>
          </select>
        </div>
      </div>

      <Section title="Pricing"/>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">MOP (₹)</label>
          <input {...register('mop')} type="number" className="input-field" placeholder="79999"/>
          {errors.mop && <p className="text-xs text-red-500 mt-1">{errors.mop.message}</p>}
        </div>
        <div>
          <label className="label">Dealer landing (₹)</label>
          <input {...register('dealer_landing')} type="number" className="input-field" placeholder="75199"/>
          {errors.dealer_landing && <p className="text-xs text-red-500 mt-1">{errors.dealer_landing.message}</p>}
        </div>
        <div>
          <label className="label">Consumer offer incl. GST (₹)</label>
          <input {...register('consumer_offer_gst')} type="number" className="input-field" placeholder="0"/>
        </div>
        <div>
          <label className="label">Consumer offer note</label>
          <input {...register('consumer_offer_note')} className="input-field" placeholder="Valid on activation"/>
        </div>
        <div>
          <label className="label">Min swipe (₹)</label>
          <input {...register('min_swipe')} type="number" className="input-field"/>
        </div>
        <div>
          <label className="label">Max swipe (₹)</label>
          <input {...register('max_swipe')} type="number" className="input-field"/>
        </div>
      </div>

      <div>
        <label className="label">Swipe type</label>
        <select {...register('swipe_type')} className="input-field">
          <option>Full Swipe</option>
          <option>NCEMI</option>
          <option>Full Swipe/NCEMI</option>
        </select>
      </div>

      <Section title="HDFC Cashback"/>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Cashback — EMI only (₹)</label>
          <input {...register('cashback_hdfc_emi')} type="number" className="input-field" placeholder="10000"/>
        </div>
        <div>
          <label className="label">Cashback — Full swipe (₹)</label>
          <input {...register('cashback_hdfc_full')} type="number" className="input-field" placeholder="8000"/>
        </div>
      </div>

      <Section title="No-cost EMI months"/>
      <div className="flex gap-4">
        {[6, 9, 12].map(m => (
          <label key={m} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input {...register(`emi_${m}` as any)} type="checkbox" className="rounded border-gray-300 text-brand-500"/>
            {m} months
          </label>
        ))}
      </div>

      <Section title="Validity"/>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Valid from</label>
          <input {...register('valid_from')} type="date" className="input-field"/>
        </div>
        <div>
          <label className="label">Valid to</label>
          <input {...register('valid_to')} type="date" className="input-field"/>
        </div>
      </div>

      <div className="mt-1">
        <label className="label">Notes (optional)</label>
        <textarea {...register('notes')} className="input-field" rows={2} placeholder="Any additional notes for retailers…"/>
      </div>

      {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600 mt-2">{error}</div>}

      <div className="flex items-center gap-3 pt-4">
        <button type="submit" disabled={loading} className="flex items-center gap-2 px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50">
          <Save size={14}/>{loading ? 'Saving…' : 'Save scheme'}
        </button>
        <Link href={ROUTES.admin.schemes} className="px-4 py-2.5 text-sm text-gray-600 hover:text-gray-900 border border-gray-200 rounded-lg transition-colors">Cancel</Link>
        {scheme && (
          <button type="button" onClick={deleteScheme} className="ml-auto flex items-center gap-1.5 text-sm text-red-500 hover:text-red-700 transition-colors">
            <Trash2 size={13}/> Delete
          </button>
        )}
      </div>
    </form>
  )
}
