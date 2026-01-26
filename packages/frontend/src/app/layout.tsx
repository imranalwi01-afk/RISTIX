// packages/frontend/src/app/layout.tsx
// ============================================================================
// 🩹 SURGICAL FIX: Complete Root Layout with correct imports
// ============================================================================
// ✅ FIXED: Correct import path for ClientProviders
// ✅ FIXED: Named import instead of default import
// ✅ FIXED: Next.js 15 metadata and viewport structure
// ============================================================================

import type { Metadata, Viewport } from 'next'
// ✅ SURGICAL FIX: Default import from ./client-providers
import ClientProviders from './client-providers'
import './globals.css'

// ============================================================================
// METADATA CONFIGURATION
// ============================================================================
export const metadata: Metadata = {
  title: 'IFRS9 Pro Platform - Multi-Stakeholder Banking System',
  description: 'Multi-Tenant Islamic Banking IFRS 9 Compliance Platform with Platform Admin, Banking Institution, Consultant, and Regulator interfaces',
  keywords: [
    'IFRS 9',
    'Islamic Banking', 
    'Multi-tenant',
    'Banking Platform',
    'Syariah Banking',
    'Platform Admin',
    'Consultant',
    'Regulator',
    'Financial Compliance',
    'ECL Calculation'
  ],
  authors: [{ name: 'IFRS9 Platform Team' }],
  creator: 'IFRS9 Platform Team',
  publisher: 'IFRS9 Platform',
  robots: process.env.NODE_ENV === 'production' ? 'index, follow' : 'noindex, nofollow',
  manifest: '/manifest.json',
  
  // Open Graph
  openGraph: {
    title: 'IFRS9 Pro Platform',
    description: 'Multi-Tenant Islamic Banking IFRS 9 Compliance Platform',
    type: 'website',
    locale: 'en_US',
    siteName: 'IFRS9 Platform',
  },
  
  // Twitter Card
  twitter: {
    card: 'summary_large_image',
    title: 'IFRS9 Pro Platform',
    description: 'Multi-Tenant Islamic Banking IFRS 9 Compliance Platform',
  },
  
  // Icons
  icons: {
    icon: [
      {
        url: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIGZpbGw9IiMxOTc2RDIiIHJ4PSI0Ii8+PHRleHQgeD0iMTYiIHk9IjIwIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTQiIGZvbnQtd2VpZ2h0PSJib2xkIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSJ3aGl0ZSI+STk8L3RleHQ+PC9zdmc+",
        sizes: "32x32",
        type: "image/svg+xml"
      }
    ],
    apple: [
      {
        url: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTgwIiBoZWlnaHQ9IjE4MCIgdmlld0JveD0iMCAwIDE4MCAxODAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJiZyIgeDE9IjAlIiB5MT0iMCUiIHgyPSIxMDAlIiB5Mj0iMTAwJSI+PHN0b3Agb2Zmc2V0PSIwJSIgc3R5bGU9InN0b3AtY29sb3I6IzE5NzZEMjtzdG9wLW9wYWNpdHk6MSIgLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiMyZTdkMzI7c3RvcC1vcGFjaXR5OjEiIC8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHJlY3Qgd2lkdGg9IjE4MCIgaGVpZ2h0PSIxODAiIGZpbGw9InVybCgjYmcpIiByeD0iMjAiLz48dGV4dCB4PSI5MCIgeT0iNzAiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSI0OCIgZm9udC13ZWlnaHQ9ImJvbGQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IndoaXRlIj5JOTwvdGV4dD48dGV4dCB4PSI5MCIgeT0iMTEwIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IndoaXRlIj5JRlJTPC90ZXh0Pjx0ZXh0IHg9IjkwIiB5PSIxMzAiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxMiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0id2hpdGUiPlBsYXRmb3JtPC90ZXh0Pjwvc3ZnPg==",
        sizes: "180x180",
        type: "image/svg+xml"
      }
    ],
  },
  
  // Format detection
  formatDetection: {
    telephone: false,
    address: false,
    email: false,
  },

  // Additional metadata
  category: 'business',
  classification: 'Banking Software',
  generator: 'Next.js 16',
}

// ============================================================================
// VIEWPORT CONFIGURATION
// ============================================================================
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#1976D2' },
    { media: '(prefers-color-scheme: dark)', color: '#1976D2' }
  ],
}

// ============================================================================
// ROOT LAYOUT PROPS INTERFACE
// ============================================================================
interface RootLayoutProps {
  children: React.ReactNode;
}

// ============================================================================
// ROOT LAYOUT COMPONENT
// ============================================================================
export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html 
      lang="en" 
      suppressHydrationWarning 
      className="h-full"
    >
      <head>
        {/* Additional meta tags */}
        <meta name="application-name" content="IFRS9 Platform" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="IFRS9 Platform" />
        
        {/* Performance optimizations */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        
        {/* Security headers - X-Frame-Options is set via HTTP headers in next.config.mjs */}
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        <meta httpEquiv="X-XSS-Protection" content="1; mode=block" />
        
        {/* Favicon fallbacks */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon-192x192.png" sizes="192x192" />
        <link rel="icon" href="/icon-512x512.png" sizes="512x512" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body 
        className="h-full antialiased"
        style={{ 
          margin: 0, 
          fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
          backgroundColor: '#fafafa',
          minHeight: '100vh',
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
        }}
        suppressHydrationWarning
      >
        {/* ✅ SURGICAL FIX: Use ClientProviders with correct import */}
        <ClientProviders>
          <div id="__next" className="h-full">
            {children as any}
          </div>
        </ClientProviders>
      </body>
    </html>
  )
}