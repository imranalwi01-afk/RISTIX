// packages/frontend/src/app/(auth)/layout.tsx
// 🔐 AUTHENTICATION LAYOUT - DUAL BANKING SUPPORT
// Fixes Next.js 15 metadata viewport/themeColor issues

import type { Metadata, Viewport } from 'next'

// ✅ FIXED: Separate metadata export (Next.js 15 requirement)
export const metadata: Metadata = {
  title: 'IFRS9 Platform - Login',
  description: 'Secure login for Multi-Tenant Islamic Banking IFRS 9 Platform',
  keywords: 'IFRS 9, Islamic Banking, Login, Authentication, Dual Banking',
  robots: 'noindex, nofollow',
  manifest: '/manifest.json',
  icons: {
    icon: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIGZpbGw9IiMxOTc2RDIiIHJ4PSI0Ii8+PHRleHQgeD0iMTYiIHk9IjIwIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTQiIGZvbnQtd2VpZ2h0PSJib2xkIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSJ3aGl0ZSI+STk8L3RleHQ+PC9zdmc+",
  },
}

// ✅ FIXED: Separate viewport export (Next.js 15 requirement)
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#1976D2' },
    { media: '(prefers-color-scheme: dark)', color: '#2e7d32' }
  ],
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="auth-layout">
      {children}
    </div>
  )
}