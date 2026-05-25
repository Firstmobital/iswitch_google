'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import { APP_CONFIG, ROUTES } from '@/lib/config'
import { UserPlus, Eye, EyeOff } from 'lucide-react'

const schema = z.object({
  full_name: z.string().min(2, 'Enter your full name'),
  shop_name: z.string().min(2, 'Enter your shop name'),
  phone: z.string().min(10, 'Enter a valid phone number'),
  city: z.string().min(2, 'Enter your city'),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirm_password: z.string(),
}).refine(d => d.password === d.confirm_password, {
  message: 'Passwords do not match',
  path: ['confirm_password'],
})
type FormData = z.infer<typeof schema>

export default function SignupPage() {
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
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          full_name: data.full_name,
          shop_name: data.shop_name,
          phone: data.phone,
          city: data.city,
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) {
      setServerError(error.message)
      setLoading(false)
      return
    }
    router.push(ROUTES.verify)
  }

  return (
    <div className="w-full max-w-md">
      <div className="flex items-center justify-center gap-2.5 mb-8">
        <div className="w-9 h-9 rounded-full bg-brand-500 flex items-center justify-center">
          <svg viewBox="0 0 22 22" width="20" height="20">
            <path d="M17 11h-5.5v2.5H14.8A4 4 0 0 1 7 11a4 4 0 0 1 7.8-1.3h2.1A6 6 0 1 0 17 11z" fill="#fff"/>
          </svg>
        </div>
        <span className="text-lg font-semibold text-gray-900">{APP_CONFIG.name}</span>
      </div>

      <div className="card p-6">
        <h1 className="text-lg font-semibold text-gray-900 mb-1">Create retailer account</h1>
        <p className="text-sm text-gray-500 mb-5">Your account will be reviewed before access is granted</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Full name</label>
              <input {...register('full_name')} className="input-field" placeholder="Rahul Sharma"/>
              {errors.full_name && <p className="text-xs text-red-500 mt-1">{errors.full_name.message}</p>}
            </div>
            <div>
              <label className="label">Phone number</label>
              <input {...register('phone')} className="input-field" placeholder="98765 43210"/>
              {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone.message}</p>}
            </div>
          </div>

          <div>
            <label className="label">Shop / business name</label>
            <input {...register('shop_name')} className="input-field" placeholder="Sharma Mobile Store"/>
            {errors.shop_name && <p className="text-xs text-red-500 mt-1">{errors.shop_name.message}</p>}
          </div>

          <div>
            <label className="label">City</label>
            <input {...register('city')} className="input-field" placeholder="Jaipur, Rajasthan"/>
            {errors.city && <p className="text-xs text-red-500 mt-1">{errors.city.message}</p>}
          </div>

          <div>
            <label className="label">Email address</label>
            <input {...register('email')} type="email" className="input-field" placeholder="rahul@yourshop.com"/>
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input {...register('password')} type={showPwd ? 'text' : 'password'} className="input-field pr-9" placeholder="Min 8 chars"/>
                <button type="button" onClick={() => setShowPwd(p => !p)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPwd ? <EyeOff size={14}/> : <Eye size={14}/>}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
            </div>
            <div>
              <label className="label">Confirm password</label>
              <input {...register('confirm_password')} type="password" className="input-field" placeholder="Repeat password"/>
              {errors.confirm_password && <p className="text-xs text-red-500 mt-1">{errors.confirm_password.message}</p>}
            </div>
          </div>

          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
            <strong>Note:</strong> After signup you&apos;ll receive a verification email. Once verified, an admin will approve your account before you can access schemes.
          </div>

          {serverError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">{serverError}</div>
          )}

          <button type="submit" className="btn-primary" disabled={loading}>
            <UserPlus size={15}/>{loading ? 'Creating account…' : 'Submit for approval'}
          </button>
        </form>

        <div className="mt-5 pt-5 border-t border-gray-100 text-center text-sm text-gray-500">
          Already registered?{' '}
          <Link href={ROUTES.login} className="text-brand-600 font-medium hover:underline">Sign in →</Link>
        </div>
      </div>
    </div>
  )
}
