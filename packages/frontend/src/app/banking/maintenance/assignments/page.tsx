"use client";

import { useEffect, Suspense } from 'react';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import { useRouter, useSearchParams } from 'next/navigation';

function AssignmentsPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const nextQuery = new URLSearchParams(searchParams.toString());
        nextQuery.delete('tab');
        const query = nextQuery.toString();
        router.replace(query ? `/banking/maintenance/access-management/assignments?${query}` : '/banking/maintenance/access-management/assignments');
    }, [router, searchParams]);

    return (
        <Box sx={{ width: '100%', p: 3 }}>
            <Box
                sx={{
                    minHeight: 220,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 2,
                }}
            >
                <CircularProgress size={28} />
                <Typography variant="body2" color="text.secondary">
                    Redirecting to consolidated assignment workspace...
                </Typography>
            </Box>
        </Box>
    );
}

export default function AssignmentsPageWrapper() {
  return (
    <Suspense fallback={<div style={{ padding: 40, textAlign: 'center' }}>Loading...</div>}>
      <AssignmentsPage />
    </Suspense>
  );
}
