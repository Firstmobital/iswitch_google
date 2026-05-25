'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import { APP_CONFIG, ROUTES } from '@/lib/config'
import { Eye, EyeOff, LogIn } from 'lucide-react'
import type { ApprovalStatus, UserRole } from '@/types/database'

type ProfileAccess = {
  role: UserRole
  approval_status: ApprovalStatus
}

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})
type FormData = z.infer<typeof schema>

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [showPwd, setShowPwd] = useState(false)
  const [serverError, setServerError] = useState('')
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  async function onSubmit(data: FormData) {
    setLoading(true)
    setServerError('')
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    })
    if (error) {
      setServerError(error.message)
      setLoading(false)
      return
    }
    const { data: profileData } = await supabase
      .from('profiles')
      .select('role, approval_status')
      .single()

    const profile = profileData as ProfileAccess | null

    if (profile?.role === 'admin') {
      router.push(ROUTES.admin.schemes)
    } else if (profile?.approval_status === 'approved') {
      router.push(ROUTES.retailer.schemes)
    } else {
      router.push(ROUTES.pending)
    }
    router.refresh()
  }

  return (
    <div className="w-full max-w-sm">
      {/* Logo */}
      <div className="flex items-center justify-center gap-2.5 mb-8">
        <div className="w-9 h-9 rounded-full bg-brand-500 flex items-center justify-center">
          <svg viewBox="0 0 22 22" width="20" height="20">
            <path d="M17 11h-5.5v2.5H14.8A4 4 0 0 1 7 11a4 4 0 0 1 7.8-1.3h2.1A6 6 0 1 0 17 11z" fill="#fff"/>
          </svg>
        </div>
        <span className="text-lg font-semibold text-gray-900">{APP_CONFIG.name}</span>
      </div>

      {/* Card */}
      <div className="card p-6">
        <h1 className="text-lg font-semibold text-gray-900 mb-1">Welcome back</h1>
        <p className="text-sm text-gray-500 mb-6">Sign in to your retailer account</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="label">Email address</label>
            <input {...register('email')} type="email" className="input-field" placeholder="you@yourshop.com" autoComplete="email"/>
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="label">Password</label>
            <div className="relative">
              <input {...register('password')} type={showPwd ? 'text' : 'password'} className="input-field pr-10" placeholder="••••••••" autoComplete="current-password"/>
              <button type="button" onClick={() => setShowPwd(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showPwd ? <EyeOff size={15}/> : <Eye size={15}/>}
              </button>
            </div>
            {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
              <input type="checkbox" className="rounded border-gray-300 text-brand-500"/> Remember me
            </label>
            <Link href="#" className="text-sm text-brand-600 hover:underline">Forgot password?</Link>
          </div>

          {serverError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">{serverError}</div>
          )}

          <button type="submit" className="btn-primary" disabled={loading}>
            <LogIn size={15}/>{loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <div className="mt-5 pt-5 border-t border-gray-100 text-center text-sm text-gray-500">
          New retailer?{' '}
          <Link href={ROUTES.signup} className="text-brand-600 font-medium hover:underline">Request access →</Link>
        </div>
      </div>

      <p className="text-center text-xs text-gray-400 mt-4">{APP_CONFIG.tagline}</p>
    </div>
  )
}
