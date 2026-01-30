"use client";

import React from 'react';
import UserRoleAssignment from '@/components/roles/UserRoleAssignment';
import { Box, Typography } from '@mui/material';

export default function AssignmentsPage() {
    return (
        <Box sx={{ width: '100%', p: 3 }}>
            <Box mb={3}>
                <Typography variant="h4" component="h1">
                    User Role Assignments
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Manage role assignments for system users.
                </Typography>
            </Box>
            <UserRoleAssignment />
        </Box>
    );
}
