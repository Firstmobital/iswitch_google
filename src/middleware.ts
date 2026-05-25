import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import type { ApprovalStatus, UserRole } from '@/types/database'

type ProfileAccess = {
  role: UserRole
  approval_status: ApprovalStatus
}

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: Record<string, unknown> }>) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options as any)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const { pathname } = request.nextUrl

  const isAuthRoute = pathname.startsWith('/auth')
  const isRetailerRoute = pathname.startsWith('/retailer')
  const isAdminRoute = pathname.startsWith('/admin')
  const isRoot = pathname === '/'

  // Root → redirect to login
  if (isRoot) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  // Not logged in → redirect to login
  if (!user && (isRetailerRoute || isAdminRoute)) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  // Already logged in → route based on profile state (except callback)
  if (user && isAuthRoute && !pathname.startsWith('/auth/callback')) {
    const { data: profileData } = await supabase
      .from('profiles')
      .select('role, approval_status')
      .eq('id', user.id)
      .single()

    const profile = profileData as ProfileAccess | null

    if (!profile) return supabaseResponse

    if (profile.role === 'admin') {
      return NextResponse.redirect(new URL('/admin', request.url))
    }
    if (profile.approval_status === 'approved') {
      return NextResponse.redirect(new URL('/retailer/schemes', request.url))
    }
    if (profile.approval_status === 'pending' && !pathname.startsWith('/auth/pending')) {
      return NextResponse.redirect(new URL('/auth/pending', request.url))
    }
  }

  // Logged in on retailer/admin routes — check role & approval
  if (user && (isRetailerRoute || isAdminRoute)) {
    const { data: profileData } = await supabase
      .from('profiles')
      .select('role, approval_status')
      .eq('id', user.id)
      .single()

    const profile = profileData as ProfileAccess | null

    if (!profile) {
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }

    // Admin trying to access retailer routes — let them through
    if (profile.role === 'admin' && isRetailerRoute) {
      return supabaseResponse
    }

    // Retailer trying to access admin routes — block
    if (profile.role === 'retailer' && isAdminRoute) {
      return NextResponse.redirect(new URL('/retailer/schemes', request.url))
    }

    // Retailer not approved — send to pending
    if (profile.role === 'retailer' && profile.approval_status !== 'approved') {
      return NextResponse.redirect(new URL('/auth/pending', request.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
