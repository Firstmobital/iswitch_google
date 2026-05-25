import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { ApprovalStatus, UserRole } from '@/types/database'

type ProfileAccess = {
  role: UserRole
  approval_status: ApprovalStatus
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const supabase = createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('role, approval_status')
          .eq('id', user.id)
          .single()

        const profile = profileData as ProfileAccess | null

        if (profile?.role === 'admin') return NextResponse.redirect(`${origin}/admin`)
        if (profile?.approval_status === 'approved') return NextResponse.redirect(`${origin}/retailer/schemes`)
      }
      return NextResponse.redirect(`${origin}/auth/pending`)
    }
  }

  return NextResponse.redirect(`${origin}/auth/login`)
}
