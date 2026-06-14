
'use client';

import React, { useState, useCallback } from 'react';
import {
    Box,
    CircularProgress,
    Drawer,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    AppBar,
    Toolbar,
    Typography,
    IconButton,
    Chip,
    Divider,
    useMediaQuery,
    Avatar,
    Tooltip,
    SwipeableDrawer,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
    SupervisorAccount as AdminIcon,
    Business as TenantIcon,
    People as UsersIcon,
    Logout as LogoutIcon,
    Security as SecurityIcon,
    Email as EmailIcon,
    Menu as MenuIcon,
    Dashboard as DashboardIcon,
    ChevronLeft as ChevronLeftIcon,
    Close as CloseIcon,
} from '@mui/icons-material';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { TenantSwitcher } from '@/components/admin/TenantSwitcher';
import { usePlatformAccessGuard } from '@/features/platform-access/hooks/usePlatformAccessGuard';

const DRAWER_WIDTH = 260;
const MOBILE_DRAWER_WIDTH = 280;
const APPBAR_HEIGHT = { xs: 56, md: 64 };

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

const menuItems = [
    { text: 'Users', icon: <AdminIcon />, path: '/platform/users' },
    { text: 'Tenants', icon: <TenantIcon />, path: '/platform/tenants' },
    { text: 'Tenant Users', icon: <UsersIcon />, path: '/platform/tenant-users' },
    { text: 'RBAC', icon: <SecurityIcon />, path: '/platform/rbac' },
    { text: 'Menus', icon: <MenuIcon />, path: '/platform/menus' },
    { text: 'SMTP Settings', icon: <EmailIcon />, path: '/platform/settings/smtp' },
];

// ─── Sidebar Navigation List ──────────────────────────────────────────
function SidebarNavList({
    pathname,
    onNavigate,
    dense = false,
}: {
    pathname: string;
    onNavigate: (path: string) => void;
    dense?: boolean;
}) {
    return (
        <List sx={{ px: 0.5, py: 1 }}>
            {menuItems.map((item) => {
                const selected = pathname === item.path ||
                    (item.path !== '/platform/users' && pathname.startsWith(item.path));
                return (
                    <ListItem key={item.text} disablePadding sx={{ mb: 0.25 }}>
                        <ListItemButton
                            selected={selected}
                            onClick={() => onNavigate(item.path)}
                            sx={{
                                mx: 0.5,
                                my: 0.25,
                                borderRadius: 2,
                                minHeight: dense ? 44 : 48,
                                px: 2,
                                transition: 'all 0.15s ease',
                                '& .MuiListItemIcon-root': {
                                    color: selected ? PLATFORM_COLORS.textPrimary : PLATFORM_COLORS.textSecondary,
                                    minWidth: 40,
                                    fontSize: '1.25rem',
                                },
                                '& .MuiListItemText-primary': {
                                    color: selected ? PLATFORM_COLORS.textPrimary : PLATFORM_COLORS.textSecondary,
                                    fontWeight: selected ? 700 : 500,
                                    fontSize: dense ? '0.8125rem' : '0.875rem',
                                },
                                '&.Mui-selected': {
                                    bgcolor: PLATFORM_COLORS.navSelected,
                                    '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.36)' },
                                },
                                '&:hover': { bgcolor: PLATFORM_COLORS.navHover },
                                // PWA: larger touch ripple
                                '& .MuiTouchRipple-root': {
                                    borderRadius: 2,
                                },
                            }}
                        >
                            <ListItemIcon>{item.icon}</ListItemIcon>
                            <ListItemText primary={item.text} />
                        </ListItemButton>
                    </ListItem>
                );
            })}
        </List>
    );
}

// ─── Sidebar Content ──────────────────────────────────────────────────
function SidebarContent({
    pathname,
    onNavigate,
    showHeader = false,
    onClose,
    user,
}: {
    pathname: string;
    onNavigate: (path: string) => void;
    showHeader?: boolean;
    onClose?: () => void;
    user: any;
}) {
    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                background: `linear-gradient(180deg, ${PLATFORM_COLORS.sidebarTop} 0%, ${PLATFORM_COLORS.sidebarBottom} 100%)`,
                color: PLATFORM_COLORS.textPrimary,
            }}
        >
            {/* Mobile header with close button */}
            {showHeader && (
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        px: 2,
                        py: 1.5,
                        borderBottom: `1px solid ${PLATFORM_COLORS.sidebarBorder}`,
                        // PWA safe area
                        pt: 'max(12px, env(safe-area-inset-top))',
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar
                            sx={{
                                width: 32,
                                height: 32,
                                bgcolor: 'rgba(239, 68, 68, 0.4)',
                                fontSize: '0.875rem',
                                fontWeight: 700,
                            }}
                        >
                            {(user?.email?.[0] || 'P').toUpperCase()}
                        </Avatar>
                        <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                                Platform
                            </Typography>
                            <Typography variant="caption" sx={{ color: PLATFORM_COLORS.textSecondary, fontSize: '0.6875rem' }}>
                                {user?.email || 'Admin'}
                            </Typography>
                        </Box>
                    </Box>
                    <IconButton
                        onClick={onClose}
                        size="small"
                        sx={{ color: PLATFORM_COLORS.textSecondary }}
                    >
                        <CloseIcon fontSize="small" />
                    </IconButton>
                </Box>
            )}

            {/* Desktop header */}
            {!showHeader && (
                <Box
                    sx={{
                        px: 2,
                        py: 2,
                        borderBottom: `1px solid ${PLATFORM_COLORS.sidebarBorder}`,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                    }}
                >
                    <Avatar
                        sx={{
                            width: 36,
                            height: 36,
                            bgcolor: 'rgba(239, 68, 68, 0.4)',
                            fontSize: '1rem',
                            fontWeight: 700,
                        }}
                    >
                        {(user?.email?.[0] || 'P').toUpperCase()}
                    </Avatar>
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, lineHeight: 1.2, color: PLATFORM_COLORS.textPrimary }}>
                            Platform Admin
                        </Typography>
                        <Typography
                            variant="caption"
                            sx={{
                                color: PLATFORM_COLORS.textSecondary,
                                display: 'block',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                fontSize: '0.6875rem',
                            }}
                        >
                            {user?.email || 'admin@ifrs9.com'}
                        </Typography>
                    </Box>
                </Box>
            )}

            {/* Navigation */}
            <Box sx={{ flex: 1, overflow: 'auto', py: 0.5 }}>
                <SidebarNavList pathname={pathname} onNavigate={onNavigate} />
            </Box>

            {/* Footer */}
            <Box
                sx={{
                    px: 2,
                    py: 1.5,
                    borderTop: `1px solid ${PLATFORM_COLORS.sidebarBorder}`,
                    // PWA safe area
                    pb: 'max(12px, env(safe-area-inset-bottom))',
                }}
            >
                <Typography variant="caption" sx={{ color: PLATFORM_COLORS.textSecondary, opacity: 0.6, fontSize: '0.625rem' }}>
                    IFRS9 Platform v1.0
                </Typography>
            </Box>
        </Box>
    );
}

// ─── Platform AppBar ──────────────────────────────────────────────────
function PlatformAppBar({
    onMenuClick,
    isMobile,
    user,
    onLogout,
}: {
    onMenuClick: () => void;
    isMobile: boolean;
    user: any;
    onLogout: () => void;
}) {
    return (
        <AppBar
            position="fixed"
            sx={{
                zIndex: (theme) => theme.zIndex.drawer + 1,
                background: `linear-gradient(92deg, ${PLATFORM_COLORS.headerStart} 0%, ${PLATFORM_COLORS.headerEnd} 100%)`,
                color: PLATFORM_COLORS.textPrimary,
                borderBottom: '1px solid rgba(255,255,255,0.14)',
                // PWA safe area
                pl: 'max(0px, env(safe-area-inset-left))',
                pr: 'max(0px, env(safe-area-inset-right))',
                pt: 'max(0px, env(safe-area-inset-top))',
            }}
        >
            <Toolbar
                sx={{
                    minHeight: APPBAR_HEIGHT,
                    px: { xs: 1.5, md: 2 },
                    gap: 1,
                }}
            >
                {/* Hamburger on mobile */}
                {isMobile && (
                    <IconButton
                        color="inherit"
                        edge="start"
                        onClick={onMenuClick}
                        sx={{
                            mr: 0.5,
                            // PWA: larger touch target
                            minWidth: 44,
                            minHeight: 44,
                        }}
                    >
                        <MenuIcon />
                    </IconButton>
                )}

                {/* Title */}
                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                    <Typography
                        variant={isMobile ? 'subtitle1' : 'h6'}
                        noWrap
                        component="div"
                        sx={{ fontWeight: 700, lineHeight: 1.2 }}
                    >
                        Platform Control Center
                    </Typography>
                    {!isMobile && (
                        <Typography variant="caption" sx={{ opacity: 0.92, color: PLATFORM_COLORS.textSecondary }}>
                            Centralized tenant administration
                        </Typography>
                    )}
                </Box>

                {/* Right side — hide TenantSwitcher on very small screens */}
                {!isMobile && (
                    <Chip
                        size="small"
                        label={user?.email || 'Platform Admin'}
                        sx={{
                            mr: 1,
                            bgcolor: 'rgba(255,255,255,0.16)',
                            color: PLATFORM_COLORS.textPrimary,
                            maxWidth: 180,
                            '& .MuiChip-label': {
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                            },
                        }}
                    />
                )}
                <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                    <TenantSwitcher />
                </Box>
                <Tooltip title="Logout">
                    <IconButton
                        color="inherit"
                        onClick={onLogout}
                        sx={{
                            // PWA: larger touch target
                            minWidth: 44,
                            minHeight: 44,
                        }}
                    >
                        <LogoutIcon />
                    </IconButton>
                </Tooltip>
            </Toolbar>
        </AppBar>
    );
}

// ─── Main Layout ──────────────────────────────────────────────────────
export default function PlatformLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const router = useRouter();
    const pathname = usePathname();
    const { logout, user } = useAuth();
    const { isLoading, isLoginRoute, canRenderPlatformShell } = usePlatformAccessGuard();

    const [mobileOpen, setMobileOpen] = useState(false);

    const handleDrawerToggle = useCallback(() => {
        setMobileOpen((prev) => !prev);
    }, []);

    const handleNavigation = useCallback(
        (path: string) => {
            router.push(path);
            // Auto-close mobile drawer on navigation
            if (isMobile) {
                setMobileOpen(false);
            }
        },
        [router, isMobile],
    );

    const handleLogout = useCallback(async () => {
        await logout();
        router.push('/platform/login');
    }, [logout, router]);

    // Login page — no shell
    if (isLoginRoute) {
        return children;
    }

    // Loading state
    if (!canRenderPlatformShell) {
        return (
            <Box
                sx={{
                    minHeight: '100dvh',
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

    const iOS = typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent);

    return (
        <Box sx={{ display: 'flex', minHeight: '100dvh', bgcolor: '#f3f6fb' }}>
            {/* AppBar */}
            <PlatformAppBar
                onMenuClick={handleDrawerToggle}
                isMobile={isMobile}
                user={user}
                onLogout={handleLogout}
            />

            {/* Navigation Drawer */}
            <Box
                component="nav"
                sx={{
                    width: { md: DRAWER_WIDTH },
                    flexShrink: { md: 0 },
                }}
            >
                {/* Mobile: Swipeable drawer for PWA gesture support */}
                <SwipeableDrawer
                    variant="temporary"
                    open={mobileOpen}
                    onClose={handleDrawerToggle}
                    onOpen={handleDrawerToggle}
                    disableBackdropTransition={!iOS}
                    disableDiscovery={iOS}
                    ModalProps={{
                        keepMounted: true, // Better mobile performance
                    }}
                    PaperProps={{
                        sx: {
                            width: MOBILE_DRAWER_WIDTH,
                            borderRight: 'none',
                            // PWA safe areas
                            pt: 'env(safe-area-inset-top)',
                            pb: 'env(safe-area-inset-bottom)',
                            pl: 'env(safe-area-inset-left)',
                        },
                    }}
                    sx={{
                        display: { xs: 'block', md: 'none' },
                    }}
                >
                    <SidebarContent
                        pathname={pathname}
                        onNavigate={handleNavigation}
                        showHeader
                        onClose={handleDrawerToggle}
                        user={user}
                    />
                </SwipeableDrawer>

                {/* Desktop: Permanent drawer */}
                <Drawer
                    variant="permanent"
                    open
                    PaperProps={{
                        sx: {
                            width: DRAWER_WIDTH,
                            borderRight: 'none',
                        },
                    }}
                    sx={{
                        display: { xs: 'none', md: 'block' },
                    }}
                >
                    <SidebarContent
                        pathname={pathname}
                        onNavigate={handleNavigation}
                        user={user}
                    />
                </Drawer>
            </Box>

            {/* Main Content */}
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    width: '100%',
                    minWidth: 0,
                    overflow: 'auto',
                    // PWA safe areas
                    pb: 'max(16px, env(safe-area-inset-bottom))',
                    pl: 'max(0px, env(safe-area-inset-left))',
                    pr: 'max(0px, env(safe-area-inset-right))',
                    background: 'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)',
                }}
            >
                {/* Spacer for fixed AppBar */}
                <Toolbar sx={{ minHeight: APPBAR_HEIGHT }} />

                {/* Page content */}
                <Box
                    sx={{
                        p: { xs: 1.5, sm: 2, md: 3 },
                        maxWidth: '100%',
                        overflowX: 'hidden',
                    }}
                >
                    {children}
                </Box>
            </Box>
        </Box>
    );
}
