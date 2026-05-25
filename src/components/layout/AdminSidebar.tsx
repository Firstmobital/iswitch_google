'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ROUTES, APP_CONFIG } from '@/lib/config'
import { LayoutDashboard, Layers, Smartphone, Users, UserCheck, BarChart2, Download, Settings, LogOut, ShieldCheck } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import clsx from 'clsx'

type NavItem = {
  label: string
  href: string
  icon: LucideIcon
  soon?: boolean
}

type NavSection = {
  section: string
  items: NavItem[]
}

const nav: NavSection[] = [
  { section: 'Overview', items: [
    { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  ]},
  { section: 'Content', items: [
    { label: 'Schemes', href: ROUTES.admin.schemes, icon: Layers },
    { label: 'Models', href: '/admin/models', icon: Smartphone },
  ]},
  { section: 'Retailers', items: [
    { label: 'All retailers', href: ROUTES.admin.retailers, icon: Users },
    { label: 'Approvals', href: '/admin/retailers?filter=pending', icon: UserCheck },
  ]},
  { section: 'Reports', items: [
    { label: 'Analytics', href: '/admin/analytics', icon: BarChart2, soon: true },
    { label: 'Export', href: '/admin/export', icon: Download, soon: true },
  ]},
  { section: 'System', items: [
    { label: 'Settings', href: '/admin/settings', icon: Settings },
  ]},
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  async function signOut() {
    await supabase.auth.signOut()
    router.push(ROUTES.login)
    router.refresh()
  }

  return (
    <aside className="hidden md:flex flex-col w-56 lg:w-60 bg-gray-900 h-screen sticky top-0 shrink-0">
      {/* Brand */}
      <div className="px-4 py-4 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-brand-500 flex items-center justify-center shrink-0">
            <ShieldCheck size={14} className="text-white"/>
          </div>
          <div>
            <p className="text-sm font-semibold text-white leading-tight">Admin panel</p>
            <p className="text-xs text-gray-500 leading-tight">{APP_CONFIG.name}</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 overflow-y-auto">
        {nav.map(group => (
          <div key={group.section} className="mb-4">
            <p className="text-xs font-medium text-gray-600 uppercase tracking-wider px-2 mb-1">{group.section}</p>
            {group.items.map(item => {
              const Icon = item.icon
              const active = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href.split('?')[0]))
              return (
                <Link key={item.href} href={item.href} className={clsx(
                  'flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm mb-0.5 transition-colors',
                  active ? 'bg-brand-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-gray-100',
                  item.soon && 'opacity-40 pointer-events-none'
                )}>
                  <Icon size={14}/>
                  <span className="flex-1">{item.label}</span>
                  {item.soon && <span className="text-xs bg-gray-700 text-gray-500 px-1.5 py-0.5 rounded-full">Soon</span>}
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      {/* Sign out */}
      <div className="px-3 py-3 border-t border-gray-800">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-6 h-6 rounded-full bg-brand-700 flex items-center justify-center text-xs font-semibold text-brand-200">A</div>
          <div><p className="text-xs font-medium text-gray-300">Admin</p><p className="text-xs text-gray-600">Super admin</p></div>
        </div>
        <button onClick={signOut} className="flex items-center gap-2 w-full px-2 py-1.5 text-xs text-gray-500 hover:text-red-400 hover:bg-gray-800 rounded-lg transition-colors">
          <LogOut size={12}/> Sign out
        </button>
      </div>
    </aside>
  )
}
