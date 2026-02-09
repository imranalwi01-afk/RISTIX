
'use client';

import React from 'react';
import { Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, AppBar, Toolbar, Typography, IconButton } from '@mui/material';
import { SupervisorAccount as AdminIcon, Business as TenantIcon, People as UsersIcon, Logout as LogoutIcon } from '@mui/icons-material';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';

const DRAWER_WIDTH = 240;

export default function PlatformLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const pathname = usePathname();
    const { logout } = useAuth();

    const menuItems = [
        { text: 'Users', icon: <AdminIcon />, path: '/platform/users' },
        { text: 'Tenants', icon: <TenantIcon />, path: '/platform/tenants' },
        { text: 'Tenant Users', icon: <UsersIcon />, path: '/platform/tenant-users' },
    ];

    const handleLogout = async () => {
        await logout();
        router.push('/platform/login');
    };

    // If on login page, don't show layout
    if (pathname === '/platform/login') {
        return children;
    }

    return (
        <Box sx={{ display: 'flex', height: '100vh' }}>
            <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, bgcolor: '#d32f2f' }}>
                <Toolbar>
                    <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
                        Platform Control Center
                    </Typography>
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
                    [`& .MuiDrawer-paper`]: { width: DRAWER_WIDTH, boxSizing: 'border-box' },
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
            <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8, bgcolor: '#f5f5f5', overflow: 'auto' }}>
                {children}
            </Box>
        </Box>
    );
}
