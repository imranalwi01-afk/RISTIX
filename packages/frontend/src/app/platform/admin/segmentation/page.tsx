// packages/frontend/src/app/platform/admin/segmentation/page.tsx
// ============================================================================
// 🔧 REACT ADMIN SEGMENTATION INTERFACE - PAGE ROUTE
// ============================================================================
// ✅ INTEGRATION: Page route wrapper for the Segmentation Admin React Admin app
// ✅ FEATURES: Professional React Admin interface with enhanced pagination fix
// ✅ NAVIGATION: Accessible at /platform/admin/segmentation
// ============================================================================

'use client';

import dynamic from 'next/dynamic';
import { CircularProgress, Box, Typography } from '@mui/material';

// Dynamic import to ensure client-side only rendering
const SegmentationAdminApp = dynamic(
  () => import('../segmentation-admin'),
  {
    ssr: false,
    loading: () => (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          backgroundColor: '#f8f9fa',
          flexDirection: 'column',
          gap: 3,
        }}
      >
        <CircularProgress size={48} sx={{ color: '#1976d2' }} />
        <Typography variant="h6" sx={{ color: '#666', fontWeight: 'bold' }}>
          Loading Segmentation Administration...
        </Typography>
        <Typography variant="body2" sx={{ color: '#999', textAlign: 'center', maxWidth: 400 }}>
          Initializing React Admin interface with enhanced pagination fix for 27+ segmentation records
        </Typography>
      </Box>
    ),
  }
);

export default function SegmentationAdminPage() {
  return <SegmentationAdminApp />;
}