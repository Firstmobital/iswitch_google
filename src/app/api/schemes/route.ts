import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import type { Scheme, UserRole } from '@/types/database'

type ProfileAccess = {
  role: UserRole
}

/**
 * POST /api/schemes
 * Create or update scheme (admin only)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const supabase = createClient()

    // Get authenticated user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check admin role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if ((profile as ProfileAccess | null)?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden: Admin required' }, { status: 403 })
    }

    const adminClient = createAdminClient()
    const schemeId = body.id

    if (schemeId) {
      // Update existing scheme
      const { error } = await (adminClient.from('schemes') as any)
        .update(body)
        .eq('id', schemeId)

      if (error) throw error
      return NextResponse.json({ success: true, id: schemeId }, { status: 200 })
    } else {
      // Insert new scheme
      const { data, error } = await (adminClient.from('schemes') as any)
        .insert({ ...body, created_by: user.id })
        .select()
        .single()

      if (error) throw error
      return NextResponse.json({ success: true, id: data.id }, { status: 201 })
    }
  } catch (err) {
    console.error('[Schemes API] Error:', err)
    const message = err instanceof Error ? err.message : 'Internal error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

/**
 * DELETE /api/schemes?id=<id>
 * Delete scheme (admin only)
 */
export async function DELETE(request: NextRequest) {
  try {
    const schemeId = request.nextUrl.searchParams.get('id')
    if (!schemeId) {
      return NextResponse.json({ error: 'Missing scheme id' }, { status: 400 })
    }

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check admin role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if ((profile as ProfileAccess | null)?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden: Admin required' }, { status: 403 })
    }

    const adminClient = createAdminClient()
    const { error } = await (adminClient.from('schemes') as any)
      .delete()
      .eq('id', schemeId)

    if (error) throw error
    return NextResponse.json({ success: true }, { status: 200 })
  } catch (err) {
    console.error('[Schemes API] Delete error:', err)
    const message = err instanceof Error ? err.message : 'Internal error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
