"use client";

import { useEffect } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useRouter, useSearchParams } from 'next/navigation';

export default function AssignmentsPage() {
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
