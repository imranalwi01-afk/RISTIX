'use client';

import React from 'react';
import { Box, Typography, Breadcrumbs, Link } from '@mui/material';
import AuditLogList from '@/components/audit/AuditLogList';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

export default function AuditPage() {
    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ mb: 3 }}>
                <Breadcrumbs
                    separator={<NavigateNextIcon fontSize="small" />}
                    aria-label="breadcrumb"
                    sx={{ mb: 1 }}
                >
                    <Link underline="hover" color="inherit" href="/admin">
                        Admin
                    </Link>
                    <Typography color="text.primary">Audit Logs</Typography>
                </Breadcrumbs>
                <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600, color: '#1a365d' }}>
                    System Audit Logs
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Track and monitor system activities, changes, and security events.
                </Typography>
            </Box>

            <AuditLogList />
        </Box>
    );
}
