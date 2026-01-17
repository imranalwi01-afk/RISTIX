import React, { useState } from 'react';
import {
    Box,
    AppBar,
    Toolbar,
    Typography,
    IconButton,
    Avatar,
    Tooltip,
    alpha,
    useTheme
} from '@mui/material';
import {
    Menu as MenuIcon,
    MenuOpen,
    ChevronLeft,
    Brightness4,
    Brightness7
} from '@mui/icons-material';
import { useBankingTheme } from '../../../providers/BankingThemeProvider'; // Adjust path
import { TenantSwitcher } from '../../admin/TenantSwitcher'; // Adjust path
import { BankingProfileMenu } from './BankingProfileMenu';

interface BankingAppBarProps {
    drawerWidth: number;
    appBarHeight: number;
    sidebarCollapsed: boolean;
    onSidebarToggle: () => void;
    onDrawerToggle: () => void;
    userName: string;
    userRole: string | string[];
}

export const BankingAppBar: React.FC<BankingAppBarProps> = ({
    drawerWidth,
    appBarHeight,
    sidebarCollapsed,
    onSidebarToggle,
    onDrawerToggle,
    userName,
    userRole
}) => {
    const theme = useTheme();
    const { colorMode, toggleColorMode } = useBankingTheme();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleProfileMenuClose = () => {
        setAnchorEl(null);
    };

    return (
        <>
            <AppBar
                position="fixed"
                sx={{
                    width: { md: `calc(100% - ${drawerWidth}px)` },
                    ml: { md: `${drawerWidth}px` },
                    background: colorMode === 'dark' ? 'rgba(15, 23, 42, 0.75)' : 'rgba(255, 255, 255, 0.85)',
                    backdropFilter: 'blur(16px)',
                    borderBottom: `1px solid ${colorMode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)'}`,
                    boxShadow: theme.shadows[1],
                    zIndex: theme.zIndex.drawer + 1,
                    transition: theme.transitions.create(['width', 'margin'], {
                        easing: theme.transitions.easing.sharp,
                        duration: theme.transitions.duration.leavingScreen,
                    }),
                }}
            >
                <Toolbar
                    sx={{
                        minHeight: `${appBarHeight}px !important`,
                        height: appBarHeight,
                        px: 2
                    }}
                    disableGutters
                >
                    {/* Mobile menu button */}
                    <IconButton
                        aria-label="open drawer"
                        edge="start"
                        onClick={onDrawerToggle}
                        size="small"
                        sx={{ mr: 1.5, display: { md: 'none' }, color: colorMode === 'dark' ? 'inherit' : '#1565C0' }}
                    >
                        <MenuIcon fontSize="small" />
                    </IconButton>

                    {/* Desktop sidebar toggle button */}
                    <Tooltip title={sidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}>
                        <IconButton
                            onClick={onSidebarToggle}
                            size="small"
                            sx={{
                                mr: 1.5,
                                display: { xs: 'none', md: 'inline-flex' },
                                color: colorMode === 'dark' ? 'inherit' : '#1565C0',
                                backgroundColor: alpha(theme.palette.primary.main, 0.05),
                                '&:hover': {
                                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                                    transform: 'scale(1.05)'
                                },
                                transition: 'all 0.2s ease-in-out'
                            }}
                        >
                            {sidebarCollapsed ? <MenuOpen fontSize="small" /> : <ChevronLeft fontSize="small" />}
                        </IconButton>
                    </Tooltip>

                    {/* Title */}
                    <Box sx={{ flexGrow: 1 }}>
                        <Typography
                            variant="h6"
                            noWrap
                            component="div"
                            sx={{
                                fontWeight: 700,
                                fontSize: '1rem',
                                lineHeight: 1.2,
                                color: colorMode === 'dark' ? 'inherit' : '#1565C0'
                            }}
                        >
                            IFRS 9 | i9 model platform
                        </Typography>
                    </Box>

                    {/* Theme Toggle Button */}
                    <Tooltip title={`Switch to ${colorMode === 'dark' ? 'Light' : 'Dark'} Mode`}>
                        <IconButton onClick={toggleColorMode} color="inherit" size="small" sx={{ ml: 1 }}>
                            {colorMode === 'dark' ? <Brightness7 /> : <Brightness4 />}
                        </IconButton>
                    </Tooltip>

                    {/* Tenant Switcher */}
                    <TenantSwitcher />

                    {/* User avatar */}
                    <Tooltip title="User menu">
                        <IconButton
                            size="small"
                            edge="end"
                            color="inherit"
                            onClick={handleProfileMenuOpen}
                        >
                            <Avatar sx={{
                                width: 28,
                                height: 28,
                                bgcolor: alpha(theme.palette.primary.main, 0.1),
                                color: theme.palette.primary.main,
                                fontWeight: 600,
                                fontSize: '0.875rem'
                            }}>
                                {userName.charAt(0).toUpperCase()}
                            </Avatar>
                        </IconButton>
                    </Tooltip>
                </Toolbar>
            </AppBar>

            <BankingProfileMenu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleProfileMenuClose}
                userName={userName}
                userRole={userRole}
            />
        </>
    );
};
