// packages/frontend/src/app/platform/admin/page.tsx
'use client';

import React from 'react';
import dynamic from 'next/dynamic';

// � OPTIMIZATION: Dynamically import the heavy React Admin application
// This prevents it from blocking the initial page compilation/load
// and reduces the main bundle size.
const AdminApp = dynamic(() => import('./AdminApp'), {
  ssr: false, // React Admin is client-side only
  loading: () => <AdminLoadingPage />,
});

const AdminLoadingPage: React.FC = () => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
    flexDirection: 'column',
    gap: '16px'
  }}>
    <div style={{
      width: '40px',
      height: '40px',
      border: '4px solid #e0e0e0',
      borderTop: '4px solid #667eea',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    }} />
    <div style={{
      fontSize: '16px',
      color: '#666',
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif'
    }}>
      Loading Platform Administration...
    </div>
    <style>{`
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `}</style>
  </div>
);

export default function PlatformAdminPage() {
  return <AdminApp />;
}