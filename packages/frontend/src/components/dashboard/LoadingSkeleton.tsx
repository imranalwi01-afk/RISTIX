// packages/frontend/src/components/dashboard/LoadingSkeleton.tsx
// ============================================================================
// Dashboard Loading Skeleton Components
// ============================================================================
// Provides smooth loading experience while dashboard data is being fetched
// ============================================================================

import React from 'react';
import { Box, Card, CardContent, Skeleton, Grid } from '@mui/material';

export const StatCardSkeleton: React.FC = () => (
    <Card sx={{ height: '100%' }}>
        <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Skeleton variant="circular" width={48} height={48} sx={{ mr: 2 }} />
                <Box sx={{ flex: 1 }}>
                    <Skeleton variant="text" width="60%" height={20} />
                    <Skeleton variant="text" width="100%" height={40} sx={{ mt: 0.5 }} />
                </Box>
            </Box>
            <Skeleton variant="text" width="40%" height={16} />
        </CardContent>
    </Card>
);

export const ChartSkeleton: React.FC<{ height?: number }> = ({ height = 300 }) => (
    <Card sx={{ height: '100%' }}>
        <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Skeleton variant="text" width="40%" height={28} />
                <Skeleton variant="text" width="15%" height={24} />
            </Box>
            <Skeleton variant="rectangular" width="100%" height={height} sx={{ borderRadius: 1 }} />
        </CardContent>
    </Card>
);

export const ActivityListSkeleton: React.FC = () => (
    <Card sx={{ height: '100%' }}>
        <CardContent>
            <Skeleton variant="text" width="40%" height={28} sx={{ mb: 3 }} />
            {[1, 2, 3, 4, 5].map((item) => (
                <Box key={item} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Skeleton variant="circular" width={40} height={40} sx={{ mr: 2 }} />
                    <Box sx={{ flex: 1 }}>
                        <Skeleton variant="text" width="70%" height={20} />
                        <Skeleton variant="text" width="40%" height={16} />
                    </Box>
                </Box>
            ))}
        </CardContent>
    </Card>
);

export const DashboardSkeleton: React.FC = () => (
    <Box sx={{ pt: 8, pb: 4 }}>
        <Box sx={{ maxWidth: 'xl', mx: 'auto', px: 3 }}>
            {/* Header Skeleton */}
            <Card sx={{ p: 3, mb: 4, borderRadius: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                        <Skeleton variant="text" width={300} height={40} />
                        <Skeleton variant="text" width={400} height={24} sx={{ mt: 1 }} />
                        <Skeleton variant="text" width={500} height={20} sx={{ mt: 1 }} />
                    </Box>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Skeleton variant="circular" width={40} height={40} />
                        <Skeleton variant="circular" width={40} height={40} />
                        <Skeleton variant="circular" width={40} height={40} />
                    </Box>
                </Box>
            </Card>

            {/* Alert Skeleton */}
            <Skeleton variant="rectangular" height={60} sx={{ mb: 3, borderRadius: 1 }} />

            {/* Stats Cards Skeleton */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                {[1, 2, 3, 4].map((item) => (
                    <Grid size={{ xs: 12, md: 6 }} key={item}>
                        <StatCardSkeleton />
                    </Grid>
                ))}
            </Grid>

            {/* Charts Skeleton */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid size={{ xs: 12, md: 8 }}>
                    <ChartSkeleton />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                    <ChartSkeleton />
                </Grid>
            </Grid>

            {/* Bottom Section Skeleton */}
            <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 6 }}>
                    <Card sx={{ height: '100%' }}>
                        <CardContent>
                            <Skeleton variant="text" width="40%" height={28} sx={{ mb: 3 }} />
                            {[1, 2, 3, 4].map((item) => (
                                <Skeleton key={item} variant="rectangular" height={48} sx={{ mb: 2, borderRadius: 1 }} />
                            ))}
                        </CardContent>
                    </Card>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                    <ActivityListSkeleton />
                </Grid>
            </Grid>
        </Box>
    </Box>
);

export default DashboardSkeleton;
