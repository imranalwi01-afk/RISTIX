'use client';

import React from 'react';
import {
    Box,
    Typography,
    Grid,
    Card,
    CardContent,
    Avatar,
    Divider,
} from '@mui/material';
import {
    AdminPanelSettings as AdminIcon,
    PeopleAlt as UsersIcon,
    Business as TenantIcon,
    Security as SecurityIcon,
} from '@mui/icons-material';
import { useAuth } from '@/providers/AuthProvider';
import { useRouter } from 'next/navigation';

export default function PlatformDashboard() {
    const { user } = useAuth();
    const router = useRouter();

    const platformModules = [
        {
            title: 'Tenants Management',
            subtitle: 'Manage client workspaces and environments.',
            icon: <TenantIcon sx={{ fontSize: 40, color: '#1976D2' }} />,
            route: '/platform/tenants'
        },
        {
            title: 'Platform Users',
            subtitle: 'Manage system-level administrators.',
            icon: <AdminIcon sx={{ fontSize: 40, color: '#D32F2F' }} />,
            route: '/platform/users'
        },
        {
            title: 'Tenant Users',
            subtitle: 'View and manage users within tenants.',
            icon: <UsersIcon sx={{ fontSize: 40, color: '#388E3C' }} />,
            route: '/platform/tenant-users'
        },
        {
            title: 'RBAC Security',
            subtitle: 'Configure Global Roles and Permissions.',
            icon: <SecurityIcon sx={{ fontSize: 40, color: '#F57C00' }} />,
            route: '/platform/rbac'
        }
    ];

    return (
        <Box sx={{ p: 4, maxWidth: 1200, margin: '0 auto' }}>
            <Box sx={{ mb: 5 }}>
                <Typography variant="h4" sx={{ fontWeight: 800, color: '#1A2027', mb: 1 }}>
                    Platform Control Center
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Welcome back, {user?.name || 'Administrator'}. Manage your IFRS9 engine infrastructure here.
                </Typography>
            </Box>

            <Grid container spacing={4}>
                {platformModules.map((mod, idx) => (
                    <Grid item xs={12} md={6} key={idx}>
                        <Card
                            onClick={() => router.push(mod.route)}
                            sx={{
                                height: '100%',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                border: '1px solid #E0E0E0',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                                '&:hover': {
                                    transform: 'translateY(-4px)',
                                    boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                                    borderColor: '#1976D2'
                                }
                            }}
                        >
                            <CardContent sx={{ p: 4, display: 'flex', alignItems: 'flex-start', gap: 3 }}>
                                <Avatar sx={{ bgcolor: 'rgba(0,0,0,0.04)', width: 70, height: 70 }}>
                                    {mod.icon}
                                </Avatar>
                                <Box>
                                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                                        {mod.title}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {mod.subtitle}
                                    </Typography>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
}
