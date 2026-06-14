'use client';

import React from 'react';
import { Box } from '@mui/material';
import UserProfile from '@/components/users/UserProfile';

export default function ProfilePage() {
    return (
        <Box sx={{ p: 4 }}>
            <UserProfile />
        </Box>
    );
}
