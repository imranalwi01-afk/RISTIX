// packages/frontend/src/app/banking/collective/loading.tsx
// ============================================================================
// Collective Pages Loading State - Shared Suspense Fallback
// ============================================================================

'use client'

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Skeleton from '@mui/material/Skeleton';

export default function CollectiveLoading() {
    return (
        <Box sx={{ p: 3, minHeight: '100vh' }}>
            {/* Header Skeleton */}
            <Box sx={{ mb: 3 }}>
                <Skeleton variant="text" width={200} height={32} />
                <Skeleton variant="text" width={400} height={24} />
            </Box>

            {/* Toolbar Skeleton */}
            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                <Skeleton variant="rectangular" width={120} height={40} sx={{ borderRadius: 1 }} />
                <Skeleton variant="rectangular" width={120} height={40} sx={{ borderRadius: 1 }} />
                <Box sx={{ flex: 1 }} />
                <Skeleton variant="rectangular" width={200} height={40} sx={{ borderRadius: 1 }} />
            </Box>

            {/* DataGrid Skeleton */}
            <Card sx={{ borderRadius: 2 }}>
                <CardContent sx={{ p: 0 }}>
                    {/* Header Row */}
                    <Box sx={{ display: 'flex', borderBottom: '1px solid', borderColor: 'divider', p: 2, gap: 2 }}>
                        {[1, 2, 3, 4, 5].map((i) => (
                            <Skeleton key={i} variant="text" width={`${15 + i * 3}%`} height={24} />
                        ))}
                    </Box>

                    {/* Data Rows */}
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((row) => (
                        <Box key={row} sx={{ display: 'flex', borderBottom: '1px solid', borderColor: 'divider', p: 2, gap: 2 }}>
                            {[1, 2, 3, 4, 5].map((col) => (
                                <Skeleton key={col} variant="text" width={`${15 + col * 3}%`} height={20} />
                            ))}
                        </Box>
                    ))}
                </CardContent>
            </Card>

            {/* Pagination Skeleton */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2, gap: 1 }}>
                <Skeleton variant="rectangular" width={80} height={32} sx={{ borderRadius: 1 }} />
                <Skeleton variant="rectangular" width={120} height={32} sx={{ borderRadius: 1 }} />
            </Box>
        </Box>
    )
}
