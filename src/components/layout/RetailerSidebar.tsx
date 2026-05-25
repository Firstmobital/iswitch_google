'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { APP_CONFIG, ROUTES } from '@/lib/config'
import { LayoutDashboard, Layers, ShoppingCart, Package, BarChart2, HelpCircle, Settings, LogOut } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import clsx from 'clsx'

type NavItem = {
  label: string
  href: string
  icon: LucideIcon
  badge?: string
  soon?: boolean
}

type NavSection = {
  section: string
  items: NavItem[]
}

const nav: NavSection[] = [
  { section: 'Main', items: [
    { label: 'Dashboard', href: '/retailer', icon: LayoutDashboard },
    { label: 'Schemes', href: ROUTES.retailer.schemes, icon: Layers, badge: 'May' },
  ]},
  { section: 'Business', items: [
    { label: 'Orders', href: '/retailer/orders', icon: ShoppingCart, soon: true },
    { label: 'Inventory', href: '/retailer/inventory', icon: Package, soon: true },
    { label: 'Reports', href: '/retailer/reports', icon: BarChart2, soon: true },
  ]},
  { section: 'Support', items: [
    { label: 'Help', href: '/retailer/help', icon: HelpCircle },
    { label: 'Settings', href: '/retailer/settings', icon: Settings },
  ]},
]

interface Props {
  profile: { full_name: string | null; shop_name: string | null; email: string }
}

export default function RetailerSidebar({ profile }: Props) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  async function signOut() {
    await supabase.auth.signOut()
    router.push(ROUTES.login)
    router.refresh()
  }

  const initials = (profile.full_name ?? profile.email)
    .split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)

  return (
    <aside className="hidden md:flex flex-col w-56 lg:w-60 bg-white border-r border-gray-100 h-screen sticky top-0 shrink-0">
      {/* Brand */}
      <div className="px-4 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-brand-500 flex items-center justify-center shrink-0">
            <svg viewBox="0 0 22 22" width="15" height="15">
              <path d="M17 11h-5.5v2.5H14.8A4 4 0 0 1 7 11a4 4 0 0 1 7.8-1.3h2.1A6 6 0 1 0 17 11z" fill="#fff"/>
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900 leading-tight">{APP_CONFIG.name}</p>
            <p className="text-xs text-gray-400 leading-tight">Distributor portal</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 overflow-y-auto">
        {nav.map(group => (
          <div key={group.section} className="mb-4">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider px-2 mb-1">{group.section}</p>
            {group.items.map(item => {
              const Icon = item.icon
              const active = pathname === item.href || (item.href !== '/retailer' && pathname.startsWith(item.href))
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={clsx(
                    'flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm mb-0.5 transition-colors',
                    active ? 'bg-brand-50 text-brand-700 font-medium' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                    item.soon && 'opacity-50 pointer-events-none'
                  )}
                >
                  <Icon size={15} className={active ? 'text-brand-600' : 'text-gray-400'}/>
                  <span className="flex-1">{item.label}</span>
                  {item.badge && (
                    <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full font-medium">{item.badge}</span>
                  )}
                  {item.soon && <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full">Soon</span>}
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      {/* User + sign out */}
      <div className="px-3 py-3 border-t border-gray-100">
        <div className="flex items-center gap-2.5 mb-2">
          <div className="w-7 h-7 rounded-full bg-brand-100 flex items-center justify-center text-xs font-semibold text-brand-700 shrink-0">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-gray-900 truncate">{profile.full_name ?? 'Retailer'}</p>
            <p className="text-xs text-gray-400 truncate">{profile.shop_name ?? profile.email}</p>
          </div>
        </div>
        <button onClick={signOut} className="flex items-center gap-2 w-full px-2 py-1.5 text-xs text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
          <LogOut size={13}/> Sign out
        </button>
      </div>
    </aside>
  )
}
