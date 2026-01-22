"use client";

import React from 'react';
import AuditLogList from '@/components/audit/AuditLogList';
import { Box, Typography } from '@mui/material';

export default function AuditPage() {
    return (
        <Box sx={{ width: '100%', p: 3 }}>
            <Box mb={3}>
                <Typography variant="h4" component="h1">
                    System Audit Logs
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Track all system activities and security events.
                </Typography>
            </Box>
            <AuditLogList />
        </Box>
    );
}
