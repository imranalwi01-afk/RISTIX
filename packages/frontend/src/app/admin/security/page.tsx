import React from 'react';
import { Box, Typography, Breadcrumbs, Link } from '@mui/material';
import SecuritySettings from '@/components/security/SecuritySettings';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

export default function SecurityPage() {
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
                    <Typography color="text.primary">Security</Typography>
                </Breadcrumbs>
                <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600, color: '#1a365d' }}>
                    Security Configuration
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Configure system-wide security policies, password requirements, and access controls.
                </Typography>
            </Box>

            <SecuritySettings />
        </Box>
    );
}
