import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AdminSidebar from '@/components/layout/AdminSidebar'
import { ROUTES } from '@/lib/config'
import type { UserRole } from '@/types/database'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect(ROUTES.login)

  const { data: profileData } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const profile = profileData as { role: UserRole } | null

  if (!profile || profile.role !== 'admin') {
    redirect(ROUTES.retailer.schemes)
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <AdminSidebar/>
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
