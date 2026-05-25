import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import RetailerSidebar from '@/components/layout/RetailerSidebar'
import MobileBottomNav from '@/components/layout/MobileBottomNav'
import { ROUTES } from '@/lib/config'
import type { Profile } from '@/types/database'

export default async function RetailerLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect(ROUTES.login)

  const { data: profileData } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const profile = profileData as Profile | null

  if (!profile || profile.approval_status !== 'approved') {
    redirect(ROUTES.pending)
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <RetailerSidebar profile={profile}/>
      <main className="flex-1 overflow-y-auto pb-16 md:pb-0">
        {children}
      </main>
      <MobileBottomNav/>
    </div>
  )
}
