// packages/frontend/src/app/banking/setup/loading.tsx
// Shared loading state for setup pages

'use client'

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Skeleton from '@mui/material/Skeleton';

export default function SetupLoading() {
    return (
        <Box sx={{ p: 3, minHeight: '100vh' }}>
            {/* Header Skeleton */}
            <Box sx={{ mb: 3 }}>
                <Skeleton variant="text" width={200} height={32} />
                <Skeleton variant="text" width={400} height={24} />
            </Box>

            {/* Tabs Skeleton */}
            <Skeleton variant="rectangular" height={48} sx={{ borderRadius: 1, mb: 3 }} />

            {/* Content Skeleton */}
            <Grid container spacing={3}>
                {[1, 2, 3, 4].map((i) => (
                    <Grid size={{ xs: 12, md: 6 }} key={i}>
                        <Card>
                            <CardContent>
                                <Skeleton variant="text" width="60%" height={28} sx={{ mb: 2 }} />
                                <Skeleton variant="rectangular" height={100} sx={{ borderRadius: 1 }} />
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Box>
    )
}
