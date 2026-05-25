import type { Metadata } from 'next'
import './globals.css'
import { APP_CONFIG } from '@/lib/config'

export const metadata: Metadata = {
  title: { default: APP_CONFIG.name, template: `%s | ${APP_CONFIG.name}` },
  description: APP_CONFIG.tagline,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
