'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Layers, ShoppingCart, BarChart2, User } from 'lucide-react'
import clsx from 'clsx'
import { ROUTES } from '@/lib/config'

const items = [
  { label: 'Home', href: '/retailer', icon: LayoutDashboard },
  { label: 'Schemes', href: ROUTES.retailer.schemes, icon: Layers },
  { label: 'Orders', href: '/retailer/orders', icon: ShoppingCart },
  { label: 'Reports', href: '/retailer/reports', icon: BarChart2 },
  { label: 'Profile', href: '/retailer/settings', icon: User },
]

export default function MobileBottomNav() {
  const pathname = usePathname()
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="flex">
        {items.map(item => {
          const Icon = item.icon
          const active = pathname === item.href || (item.href !== '/retailer' && pathname.startsWith(item.href))
          return (
            <Link key={item.href} href={item.href} className={clsx(
              'flex-1 flex flex-col items-center py-2 gap-0.5 text-xs transition-colors',
              active ? 'text-brand-600' : 'text-gray-400'
            )}>
              <Icon size={20}/>
              <span>{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
