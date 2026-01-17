// packages/frontend/src/app/banking/dashboard/loading.tsx
// ============================================================================
// Dashboard Loading State - Shown during Suspense
// ============================================================================

'use client'

import { Box, CircularProgress, Typography, Skeleton, Grid, Card, CardContent } from '@mui/material'

export default function DashboardLoading() {
    return (
        <Box sx={{ p: 3, minHeight: '100vh' }}>
            {/* Header Skeleton */}
            <Skeleton
                variant="rectangular"
                height={120}
                sx={{ borderRadius: 2, mb: 3 }}
            />

            {/* Alert Skeleton */}
            <Skeleton
                variant="rectangular"
                height={48}
                sx={{ borderRadius: 1, mb: 3 }}
            />

            {/* Stats Grid Skeleton */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                {[1, 2, 3, 4].map((i) => (
                    <Grid item xs={12} md={6} key={i}>
                        <Card sx={{ height: 140 }}>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Skeleton variant="circular" width={48} height={48} />
                                    <Box sx={{ flex: 1 }}>
                                        <Skeleton variant="text" width="40%" />
                                        <Skeleton variant="text" width="60%" height={32} />
                                        <Skeleton variant="text" width="30%" />
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* Charts Skeleton */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} md={8}>
                    <Skeleton variant="rectangular" height={340} sx={{ borderRadius: 3 }} />
                </Grid>
                <Grid item xs={12} md={4}>
                    <Skeleton variant="rectangular" height={340} sx={{ borderRadius: 3 }} />
                </Grid>
            </Grid>

            {/* Quick Actions Skeleton */}
            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <Skeleton variant="rectangular" height={280} sx={{ borderRadius: 2 }} />
                </Grid>
                <Grid item xs={12} md={6}>
                    <Skeleton variant="rectangular" height={280} sx={{ borderRadius: 2 }} />
                </Grid>
            </Grid>
        </Box>
    )
}
