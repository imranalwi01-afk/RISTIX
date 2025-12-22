// packages/frontend/src/app/admin/page.tsx
'use client';

import React from 'react';
import dynamic from 'next/dynamic';

// Dynamically import AdminApp to avoid SSR issues
const AdminApp = dynamic(
  () => import('../../admin/AdminApp'),
  { 
    ssr: false,
    loading: () => (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        flexDirection: 'column',
        gap: '20px'
      }}>
        <div>Loading Banking Admin Interface...</div>
        <div style={{ 
          border: '4px solid #f3f3f3',
          borderTop: '4px solid #3498db',
          borderRadius: '50%',
          width: '40px',
          height: '40px',
          animation: 'spin 2s linear infinite'
        }}></div>
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }
);

export default function AdminPage() {
  return (
    <div style={{ height: '100vh', width: '100%' }}>
      <AdminApp 
        tenantConfig={{
          bankingType: 'conventional',
          theme: 'conventional',
          features: ['dashboard', 'customers', 'accounts', 'portfolios']
        }}
      />
    </div>
  );
}
