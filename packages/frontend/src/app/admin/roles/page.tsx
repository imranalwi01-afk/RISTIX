"use client";

import React from 'react';
import RoleCRUDOperations from '@/components/roles/RoleCRUDOperations';
import { Box, Typography } from '@mui/material';

export default function RolesPage() {
    return (
        <Box sx={{ width: '100%', p: 3 }}>
            <Box mb={3}>
                <Typography variant="h4" component="h1">
                    Role Management
                </Typography>
            </Box>
            <RoleCRUDOperations />
        </Box>
    );
}
