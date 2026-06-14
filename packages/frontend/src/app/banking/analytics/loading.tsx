'use client'

// Loading state — shown during Suspense

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Skeleton from '@mui/material/Skeleton';

export default function Loading() {
  return (
    <Box sx={{ p: 3, minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Skeleton variant="text" width={200} height={32} />
        <Skeleton variant="text" width={400} height={24} />
      </Box>

      {/* Filters */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <Skeleton variant="rectangular" width={160} height={40} sx={{ borderRadius: 1 }} />
        <Skeleton variant="rectangular" width={160} height={40} sx={{ borderRadius: 1 }} />
        <Box sx={{ flex: 1 }} />
        <Skeleton variant="rectangular" width={140} height={40} sx={{ borderRadius: 1 }} />
      </Box>

      {/* Stats Row */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[1, 2, 3, 4].map((i) => (
          <Grid size={{ xs: 12, md: 3 }} key={i}>
            <Card>
              <CardContent>
                <Skeleton variant="text" width="60%" />
                <Skeleton variant="text" width="80%" height={32} />
                <Skeleton variant="text" width="40%" />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Charts */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Skeleton variant="rectangular" height={340} sx={{ borderRadius: 3 }} />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Skeleton variant="rectangular" height={340} sx={{ borderRadius: 3 }} />
        </Grid>
      </Grid>
    </Box>
  );
}
