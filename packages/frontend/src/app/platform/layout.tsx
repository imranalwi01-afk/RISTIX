
'use client';

import React from 'react';
import { Box, CircularProgress, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, AppBar, Toolbar, Typography, IconButton, Chip } from '@mui/material';
import { SupervisorAccount as AdminIcon, Business as TenantIcon, People as UsersIcon, Logout as LogoutIcon, Security as SecurityIcon } from '@mui/icons-material';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { TenantSwitcher } from '@/components/admin/TenantSwitcher';
import { usePlatformAccessGuard } from '@/features/platform-access/hooks/usePlatformAccessGuard';

const DRAWER_WIDTH = 240;
const PLATFORM_COLORS = {
    headerStart: '#7f1d1d',
    headerEnd: '#991b1b',
    sidebarTop: '#2b0f12',
    sidebarBottom: '#17090b',
    sidebarBorder: '#3f1a1f',
    textPrimary: '#f5f5f5',
    textSecondary: '#d6c9cb',
    navSelected: 'rgba(239, 68, 68, 0.28)',
    navHover: 'rgba(239, 68, 68, 0.14)',
};

export default function PlatformLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const pathname = usePathname();
    const { logout, user } = useAuth();
    const { isLoading, isLoginRoute, canRenderPlatformShell } = usePlatformAccessGuard();

    const menuItems = [
        { text: 'Users', icon: <AdminIcon />, path: '/platform/users' },
        { text: 'Tenants', icon: <TenantIcon />, path: '/platform/tenants' },
        { text: 'Tenant Users', icon: <UsersIcon />, path: '/platform/tenant-users' },
        { text: 'RBAC', icon: <SecurityIcon />, path: '/platform/rbac' },
    ];

    const handleLogout = async () => {
        await logout();
        router.push('/platform/login');
    };

    // If on login page, don't show layout
    if (isLoginRoute) {
        return children;
    }

    if (!canRenderPlatformShell) {
        return (
            <Box
                sx={{
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)',
                }}
            >
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ display: 'flex', height: '100vh', bgcolor: '#f3f6fb' }}>
            <AppBar
                position="fixed"
                sx={{
                    zIndex: (theme) => theme.zIndex.drawer + 1,
                    background: `linear-gradient(92deg, ${PLATFORM_COLORS.headerStart} 0%, ${PLATFORM_COLORS.headerEnd} 100%)`,
                    color: PLATFORM_COLORS.textPrimary,
                    borderBottom: '1px solid rgba(255,255,255,0.14)',
                }}
            >
                <Toolbar>
                    <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 700 }}>
                            Platform Control Center
                        </Typography>
                        <Typography variant="caption" sx={{ opacity: 0.92, color: PLATFORM_COLORS.textSecondary }}>
                            Centralized tenant administration
                        </Typography>
                    </Box>
                    <Chip
                        size="small"
                        label={user?.email || 'Platform Admin'}
                        sx={{ mr: 1, bgcolor: 'rgba(255,255,255,0.16)', color: PLATFORM_COLORS.textPrimary }}
                    />
                    <TenantSwitcher />
                    <IconButton color="inherit" onClick={handleLogout}>
                        <LogoutIcon />
                    </IconButton>
                </Toolbar>
            </AppBar>
            <Drawer
                variant="permanent"
                sx={{
                    width: DRAWER_WIDTH,
                    flexShrink: 0,
                    [`& .MuiDrawer-paper`]: {
                        width: DRAWER_WIDTH,
                        boxSizing: 'border-box',
                        background: `linear-gradient(180deg, ${PLATFORM_COLORS.sidebarTop} 0%, ${PLATFORM_COLORS.sidebarBottom} 100%)`,
                        color: PLATFORM_COLORS.textPrimary,
                        borderRight: `1px solid ${PLATFORM_COLORS.sidebarBorder}`,
                    },
                }}
            >
                <Toolbar />
                <Box sx={{ overflow: 'auto' }}>
                    <List>
                        {menuItems.map((item) => (
                            <ListItem key={item.text} disablePadding>
                                <ListItemButton
                                    selected={pathname === item.path}
                                    onClick={() => router.push(item.path)}
                                    sx={{
                                        mx: 1,
                                        my: 0.5,
                                        borderRadius: 1.5,
                                        '& .MuiListItemIcon-root': { color: PLATFORM_COLORS.textSecondary, minWidth: 36 },
                                        '& .MuiListItemText-primary': { color: PLATFORM_COLORS.textSecondary, fontWeight: 500 },
                                        '&.Mui-selected': {
                                            bgcolor: PLATFORM_COLORS.navSelected,
                                            '& .MuiListItemIcon-root': { color: PLATFORM_COLORS.textPrimary },
                                            '& .MuiListItemText-primary': { color: PLATFORM_COLORS.textPrimary, fontWeight: 700 },
                                        },
                                        '&.Mui-selected:hover': { bgcolor: 'rgba(239, 68, 68, 0.36)' },
                                        '&:hover': { bgcolor: PLATFORM_COLORS.navHover },
                                    }}
                                >
                                    <ListItemIcon>
                                        {item.icon}
                                    </ListItemIcon>
                                    <ListItemText primary={item.text} />
                                </ListItemButton>
                            </ListItem>
                        ))}
                    </List>
                </Box>
            </Drawer>
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: 3,
                    mt: 8,
                    background: 'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)',
                    overflow: 'auto'
                }}
            >
                {children}
            </Box>
        </Box>
    );
}
