// packages/frontend/src/app/admin/layout.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'IFRS 9 MODELLING PLATFORM | i9model | A1',
  description: 'Banking Administration Interface for IFRS 9 Modelling Platform',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{ height: '100vh', overflow: 'hidden' }}>
      {children}
    </div>
  );
}
