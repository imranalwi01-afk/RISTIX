import dynamic from 'next/dynamic';

const AccessManagementPage = dynamic(
  () => import('@/components/maintenance/AccessManagementPage'),
  { ssr: false, loading: () => <div style={{ padding: 40, textAlign: 'center' }}>Loading...</div> }
);

export default function AccessManagementRoutePage() {
  return <AccessManagementPage />;
}
