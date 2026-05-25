import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import type { ApprovalStatus, UserRole } from '@/types/database'

type ProfileAccess = {
  role: UserRole
}

/**
 * POST /api/admin/approve
 * Server-side admin endpoint for approving/rejecting retailers
 * Uses SERVICE_ROLE_KEY for elevated permissions + RLS bypass where needed
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { retailerId, status } = body as { retailerId: string; status: ApprovalStatus }

    // Validate input
    if (!retailerId || !['pending', 'approved', 'rejected'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid retailerId or status' },
        { status: 400 }
      )
    }

    // Get authenticated user
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized: Not authenticated' },
        { status: 401 }
      )
    }

    // Check user is admin (server-side verification)
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if ((userProfile as ProfileAccess | null)?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden: Admin role required' },
        { status: 403 }
      )
    }

    // Use admin client to update (service role bypasses RLS for validation)
    const adminClient = createAdminClient()
    const { error } = await (adminClient.from('profiles') as any)
      .update({ approval_status: status })
      .eq('id', retailerId)

    if (error) {
      console.error('[Admin API] Approval error:', error)
      return NextResponse.json(
        { error: `Failed to update approval status: ${error.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { success: true, retailerId, status },
      { status: 200 }
    )
  } catch (err) {
    console.error('[Admin API] Unexpected error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
