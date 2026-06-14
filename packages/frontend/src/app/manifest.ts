import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'IFRS9 Pro Platform',
    short_name: 'IFRS9',
    description: 'Multi-Tenant Islamic Banking IFRS 9 Compliance Platform',
    start_url: '/',
    display: 'standalone',
    background_color: '#fafafa',
    theme_color: '#1976D2',
    orientation: 'portrait-primary',
    categories: ['finance', 'business', 'banking'],
    icons: [
      {
        src: '/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
    screenshots: [],
  }
}
