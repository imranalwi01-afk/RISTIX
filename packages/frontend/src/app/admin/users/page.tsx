"use client";

import React from 'react';
import UserManagement from '@/components/users/UserManagement';
import { Box } from '@mui/material';

export default function UsersPage() {
    return (
        <Box sx={{ width: '100%', p: 2 }}>
            <UserManagement />
        </Box>
    );
}
