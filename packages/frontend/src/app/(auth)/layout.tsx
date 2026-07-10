// packages/frontend/src/app/(auth)/layout.tsx
// 🔐 AUTHENTICATION LAYOUT

import type { Metadata, Viewport } from 'next'

export const metadata: Metadata = {
  title: 'PSAK 413 Platform - Login',
  description: 'Secure login for Multi-Tenant Islamic Banking PSAK 413 Platform',
  keywords: 'PSAK 413, Islamic Banking, Login, Authentication, Dual Banking',
  robots: 'noindex, nofollow',
  manifest: '/manifest.json',
  icons: {
    icon: "/images/logo-ristix.png",
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#1976D2' },
    { media: '(prefers-color-scheme: dark)', color: '#2e7d32' },
  ],
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <main className="auth-layout" role="main">
      {children}
    </main>
  )
}
