'use client';

import React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import CircularProgress from '@mui/material/CircularProgress';

export function LoadingFallback() {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
      <CircularProgress size={32} />
    </Box>
  );
}

export function TableSkeleton() {
  return (
    <Box sx={{ p: 2 }}>
      <Stack direction="row" spacing={2} sx={{ mb: 1 }}>
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} variant="rounded" sx={{ flex: i === 0 ? 2 : 1 }} height={20} />
        ))}
      </Stack>
      {[...Array(6)].map((_, i) => (
        <Stack key={i} direction="row" spacing={2} sx={{ mb: 1 }}>
          {[...Array(5)].map((_, j) => (
            <Skeleton key={j} variant="rounded" sx={{ flex: j === 0 ? 2 : 1 }} height={16} />
          ))}
        </Stack>
      ))}
    </Box>
  );
}

interface LoadingSkeletonProps {
  type?: 'table' | 'card' | 'list' | 'detail' | 'dashboard';
}

/**
 * Full-page loading skeleton with header, toolbar, table, and pagination.
 * Matches the standard layout used by most page loading.tsx files.
 */
export function PageLoadingSkeleton() {
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

export default function LoadingSkeleton({ type = 'table' }: LoadingSkeletonProps) {
  if (type === 'card') {
    return (
      <Stack spacing={1.5} sx={{ p: 3 }}>
        <Skeleton variant="rounded" width="60%" height={24} />
        <Skeleton variant="rounded" width="40%" height={16} />
        <Skeleton variant="rounded" width="100%" height={80} />
      </Stack>
    );
  }

  if (type === 'list') {
    return (
      <Stack spacing={1.5} sx={{ p: 3 }}>
        {[...Array(5)].map((_, i) => (
          <Box key={i} sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Skeleton variant="circular" width={32} height={32} />
            <Box sx={{ flex: 1 }}>
              <Skeleton variant="text" width="80%" />
              <Skeleton variant="text" width="50%" />
            </Box>
          </Box>
        ))}
      </Stack>
    );
  }

  if (type === 'detail') {
    return (
      <Stack spacing={2} sx={{ p: 3 }}>
        <Skeleton variant="rounded" width={48} height={48} />
        <Skeleton variant="rounded" width="70%" height={28} />
        <Skeleton variant="rounded" width="90%" height={16} />
        <Skeleton variant="rounded" width="100%" height={120} />
        <Skeleton variant="rounded" width="100%" height={60} />
      </Stack>
    );
  }

  if (type === 'dashboard') {
    return (
      <Box sx={{ p: 3 }}>
        <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
          {[...Array(4)].map((_, i) => (
            <Box key={i} sx={{ flex: 1 }}>
              <Skeleton variant="rounded" width="100%" height={100} />
            </Box>
          ))}
        </Stack>
        <Skeleton variant="rounded" width="100%" height={300} />
      </Box>
    );
  }

  // table (default)
  return (
    <Box sx={{ p: 2 }}>
      <Stack direction="row" spacing={2} sx={{ mb: 1 }}>
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} variant="rounded" sx={{ flex: i === 0 ? 2 : 1 }} height={20} />
        ))}
      </Stack>
      {[...Array(6)].map((_, i) => (
        <Stack key={i} direction="row" spacing={2} sx={{ mb: 1 }}>
          {[...Array(5)].map((_, j) => (
            <Skeleton key={j} variant="rounded" sx={{ flex: j === 0 ? 2 : 1 }} height={16} />
          ))}
        </Stack>
      ))}
    </Box>
  );
}
