// packages/frontend/src/app/platform/components/PlatformNavigation.tsx
// ============================================================================
// ENHANCED PLATFORM NAVIGATION - Seamless Integration
// ============================================================================
// ✅ Works with your existing platform dashboard
// ✅ Integrates with your authentication system
// ✅ Supports DANA Digital Bank and multi-tenant context
// ✅ Provides smooth switching between classic and React Admin
// ============================================================================

'use client';

import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Chip,
  Box,
  Tooltip,
  Avatar,
  Divider,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Dashboard as ClassicIcon,
  AdminPanelSettings as AdminIcon,
  MoreVert as MoreIcon,
  ArrowBack as BackIcon,
  Business as TenantsIcon,
  Group as ConsultantsIcon,
  Analytics as AnalyticsIcon,
  Monitor as InfrastructureIcon,
  ExitToApp as LogoutIcon,
  Person as ProfileIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { getAuthToken, clearAuthTokens } from '../../../utils/auth-token';

// ============================================================================
// INTERFACES
// ============================================================================

interface PlatformNavigationProps {
  currentView: 'classic' | 'admin';
  userRole?: string;
  userName?: string;
  userEmail?: string;
  onViewChange?: (view: 'classic' | 'admin') => void;
}

interface PlatformUser {
  id: string;
  email: string;
  fullName: string;
  role: string;
  avatar?: string;
}

// ============================================================================
// PLATFORM NAVIGATION COMPONENT
// ============================================================================

const PlatformNavigation: React.FC<PlatformNavigationProps> = ({
  currentView,
  userRole = 'Platform Administrator',
  userName = 'Admin User',
  userEmail = 'admin@ifrspro.id',
  onViewChange
}) => {
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [user, setUser] = useState<PlatformUser | null>(null);
  const [isOnline, setIsOnline] = useState(true);

  // ✅ Get user data from your authentication system
  useEffect(() => {
    try {
      const userData = localStorage.getItem('user_data');
      if (userData) {
        const parsedUser = JSON.parse(userData);
        setUser({
          id: parsedUser.id || parsedUser.email,
          email: parsedUser.email || userEmail,
          fullName: parsedUser.fullName || parsedUser.full_name || userName,
          role: parsedUser.role || userRole,
          avatar: parsedUser.avatar,
        });
      }
    } catch (error) {
      console.warn('Failed to parse user data:', error);
      // Fallback to props
      setUser({
        id: userEmail,
        email: userEmail,
        fullName: userName,
        role: userRole,
      });
    }

    // Check online status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [userName, userEmail, userRole]);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const navigateToClassic = () => {
    router.push('/platform/dashboard');
    onViewChange?.('classic');
    handleMenuClose();
  };

  const navigateToAdmin = () => {
    router.push('/platform/admin');
    onViewChange?.('admin');
    handleMenuClose();
  };

  const navigateToHome = () => {
    router.push('/');
    handleMenuClose();
  };

  const handleLogout = async () => {
    try {
      // ✅ FIXED: Use centralized configuration for dual-mode support
      const token = localStorage.getItem('auth_token');
      if (token) {
        const getBackendUrl = () => {
          if (typeof window !== 'undefined' && window.location.hostname.includes('danafin.com')) {
            return 'https://iaf-ifrs-be.danafin.com';
          }
          return 'https://bifrs9-iaf.ifrspro.id';
        };

        await fetch(`${getBackendUrl()}/api/v1/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
      }
    } catch (error) {
      console.warn('Logout API failed:', error);
    } finally {
      // Clear all tokens (cookies + storage)
      clearAuthTokens();

      // Redirect to login
      router.push('/login');
    }
    handleMenuClose();
  };

  const platformTheme = {
    primary: '#667eea',
    secondary: '#764ba2',
  };

  const getUserAvatar = () => {
    if (user?.avatar) return user.avatar;
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || 'Admin')}&background=667eea&color=fff`;
  };

  const getStatusColor = () => {
    // if (!isOnline) return '#f44336'; // Red for offline - REMOVED
    if (currentView === 'admin') return '#2e7d32'; // Green for React Admin
    return '#1976d2'; // Blue for classic
  };

  return (
    <AppBar
      position="static"
      elevation={2}
      sx={{
        background: `linear-gradient(135deg, ${platformTheme.primary} 0%, ${platformTheme.secondary} 100%)`,
        mb: 0
      }}
    >
      <Toolbar>
        {/* ============================================================================ */}
        {/* LEFT SIDE - Logo and Current View */}
        {/* ============================================================================ */}

        <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
          <Typography variant="h6" component="div" sx={{ fontWeight: 'bold', mr: 2 }}>
            🏢 IFRS9 Platform
          </Typography>

          <Chip
            label={currentView === 'classic' ? 'Classic Dashboard' : 'React Admin'}
            icon={currentView === 'classic' ? <ClassicIcon /> : <AdminIcon />}
            sx={{
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              color: 'white',
              fontWeight: 'bold',
              '& .MuiChip-icon': { color: 'white' },
              mr: 2
            }}
          />


        </Box>

        {/* ============================================================================ */}
        {/* CENTER - Quick Switch Buttons */}
        {/* ============================================================================ */}

        <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1, mr: 2 }}>
          {currentView === 'admin' && (
            <Tooltip title="Switch to Classic Dashboard">
              <Button
                color="inherit"
                startIcon={<ClassicIcon />}
                onClick={navigateToClassic}
                sx={{
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.2)' },
                  fontSize: '0.8rem'
                }}
              >
                Classic View
              </Button>
            </Tooltip>
          )}

          {currentView === 'classic' && (
            <Tooltip title="Switch to React Admin Interface">
              <Button
                color="inherit"
                startIcon={<AdminIcon />}
                onClick={navigateToAdmin}
                sx={{
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.2)' },
                  fontSize: '0.8rem'
                }}
              >
                Admin Panel
              </Button>
            </Tooltip>
          )}
        </Box>

        {/* ============================================================================ */}
        {/* RIGHT SIDE - User Info and Menu */}
        {/* ============================================================================ */}

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* User Avatar and Info */}
          <Box sx={{ display: { xs: 'none', sm: 'flex' }, alignItems: 'center', gap: 1, mr: 1 }}>
            <Avatar
              src={getUserAvatar()}
              sx={{
                width: 32,
                height: 32,
                border: `2px solid ${getStatusColor()}`,
              }}
            />
            <Box sx={{ display: { xs: 'none', md: 'flex' }, flexDirection: 'column', alignItems: 'flex-start' }}>
              <Typography variant="body2" sx={{ fontWeight: 'bold', lineHeight: 1.2, fontSize: '0.8rem' }}>
                {user?.fullName || 'Loading...'}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.8, lineHeight: 1.2, fontSize: '0.7rem' }}>
                {user?.role || 'Platform Admin'}
              </Typography>
            </Box>
          </Box>



          {/* Menu Button */}
          <IconButton
            color="inherit"
            onClick={handleMenuOpen}
            sx={{ ml: 1 }}
          >
            <MoreIcon />
          </IconButton>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            PaperProps={{
              sx: { minWidth: 250 }
            }}
          >
            {/* ============================================================================ */}
            {/* USER PROFILE SECTION */}
            {/* ============================================================================ */}

            <MenuItem disabled>
              <ListItemIcon>
                <Avatar src={getUserAvatar()} sx={{ width: 24, height: 24 }} />
              </ListItemIcon>
              <ListItemText>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                  {user?.fullName}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {user?.email}
                </Typography>
              </ListItemText>
            </MenuItem>

            <Divider />

            {/* ============================================================================ */}
            {/* NAVIGATION MENU ITEMS */}
            {/* ============================================================================ */}

            <MenuItem onClick={navigateToClassic} disabled={currentView === 'classic'}>
              <ListItemIcon>
                <ClassicIcon />
              </ListItemIcon>
              <ListItemText>
                Classic Dashboard
                {currentView === 'classic' && (
                  <Chip label="Current" size="small" sx={{ ml: 1, height: 16, fontSize: '0.6rem' }} />
                )}
              </ListItemText>
            </MenuItem>

            <MenuItem onClick={navigateToAdmin} disabled={currentView === 'admin'}>
              <ListItemIcon>
                <AdminIcon />
              </ListItemIcon>
              <ListItemText>
                React Admin Panel
                {currentView === 'admin' && (
                  <Chip label="Current" size="small" sx={{ ml: 1, height: 16, fontSize: '0.6rem' }} />
                )}
              </ListItemText>
            </MenuItem>

            <Divider />

            {/* ============================================================================ */}
            {/* QUICK ACCESS MENU ITEMS */}
            {/* ============================================================================ */}

            <MenuItem onClick={() => { handleMenuClose(); router.push('/platform/admin#/tenants'); }}>
              <ListItemIcon>
                <TenantsIcon />
              </ListItemIcon>
              <ListItemText>Manage Tenants</ListItemText>
            </MenuItem>

            <MenuItem onClick={() => { handleMenuClose(); router.push('/platform/admin#/consultants'); }}>
              <ListItemIcon>
                <ConsultantsIcon />
              </ListItemIcon>
              <ListItemText>Consultants</ListItemText>
            </MenuItem>

            <MenuItem onClick={() => { handleMenuClose(); router.push('/platform/admin#/analytics'); }}>
              <ListItemIcon>
                <AnalyticsIcon />
              </ListItemIcon>
              <ListItemText>Platform Analytics</ListItemText>
            </MenuItem>

            <MenuItem onClick={() => { handleMenuClose(); router.push('/platform/admin#/infrastructure'); }}>
              <ListItemIcon>
                <InfrastructureIcon />
              </ListItemIcon>
              <ListItemText>Infrastructure</ListItemText>
            </MenuItem>

            <Divider />

            {/* ============================================================================ */}
            {/* SYSTEM MENU ITEMS */}
            {/* ============================================================================ */}

            <MenuItem onClick={navigateToHome}>
              <ListItemIcon>
                <BackIcon />
              </ListItemIcon>
              <ListItemText>Back to Home</ListItemText>
            </MenuItem>

            <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
              <ListItemIcon>
                <LogoutIcon sx={{ color: 'error.main' }} />
              </ListItemIcon>
              <ListItemText>Logout</ListItemText>
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default PlatformNavigation;