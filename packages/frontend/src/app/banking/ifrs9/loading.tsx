'use client'

// Loading state — shown during Suspense

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Skeleton from '@mui/material/Skeleton';

export default function Loading() {
  return (
    <Box sx={{ p: 3, minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Skeleton variant="text" width={200} height={32} />
        <Skeleton variant="text" width={400} height={24} />
      </Box>

      {/* Toolbar */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <Skeleton variant="rectangular" width={120} height={40} sx={{ borderRadius: 1 }} />
        <Skeleton variant="rectangular" width={120} height={40} sx={{ borderRadius: 1 }} />
        <Box sx={{ flex: 1 }} />
        <Skeleton variant="rectangular" width={200} height={40} sx={{ borderRadius: 1 }} />
      </Box>

      {/* Table */}
      <Card sx={{ borderRadius: 2 }}>
        <CardContent sx={{ p: 0 }}>
          <Box sx={{ display: 'flex', borderBottom: '1px solid', borderColor: 'divider', p: 2, gap: 2 }}>
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} variant="text" width={`${15 + i * 3}%`} height={24} />
            ))}
          </Box>
          {[1, 2, 3, 4, 5, 6, 7].map((row) => (
            <Box key={row} sx={{ display: 'flex', borderBottom: '1px solid', borderColor: 'divider', p: 2, gap: 2 }}>
              {[1, 2, 3, 4, 5].map((col) => (
                <Skeleton key={col} variant="text" width={`${15 + col * 3}%`} height={20} />
              ))}
            </Box>
          ))}
        </CardContent>
      </Card>

      {/* Pagination */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2, gap: 1 }}>
        <Skeleton variant="rectangular" width={80} height={32} sx={{ borderRadius: 1 }} />
        <Skeleton variant="rectangular" width={120} height={32} sx={{ borderRadius: 1 }} />
      </Box>
    </Box>
  );
}
