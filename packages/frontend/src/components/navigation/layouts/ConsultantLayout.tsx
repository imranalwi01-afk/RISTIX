// ============================================================================
// IFRS9 FRONTEND - CONSULTANT LAYOUT COMPONENT (FINAL)
// ============================================================================
// File Path: packages/frontend/src/components/navigation/layouts/ConsultantLayout.tsx
// Purpose: Layout component for consultant stakeholder type
// Dependencies: Material-UI, React, basic configuration
// Stakeholder: Consultant (Professional, Neutral Design)
// ============================================================================

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  Box,
  CircularProgress,
  Alert,
  AppBar,
  Toolbar,
  Typography,
  Container,
  Paper,
  Breadcrumbs,
  Link,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Assessment as AssessmentIcon,
  Business as BusinessIcon,
  Settings as SettingsIcon,
  AccountCircle as AccountIcon,
  Logout as LogoutIcon,
  Home as HomeIcon,
} from '@mui/icons-material';

// ✅ Import only the basic config function
import { getConfigValue } from '../../../config/environment.config';

// ✅ Stakeholder type definitions from project requirements
export type StakeholderType = 'platform-admin' | 'banking' | 'consultant' | 'regulator';

interface ConsultantLayoutProps {
  children: React.ReactNode;
  title?: string;
  breadcrumbs?: Array<{ label: string; href?: string }>;
}

// ✅ Consultant-specific navigation items
const consultantNavigation = [
  {
    label: 'Dashboard',
    href: '/consultant/dashboard',
    icon: DashboardIcon,
  },
  {
    label: 'Project Analytics',
    href: '/consultant/analytics',
    icon: AssessmentIcon,
  },
  {
    label: 'Client Portfolio',
    href: '/consultant/portfolio',
    icon: BusinessIcon,
  },
  {
    label: 'Settings',
    href: '/consultant/settings',
    icon: SettingsIcon,
  },
];

export const ConsultantLayout: React.FC<ConsultantLayoutProps> = ({
  children,
  title = 'Consultant Dashboard',
  breadcrumbs = [],
}) => {
  const router = useRouter();
  const pathname = usePathname();

  // ✅ Local state management (no hooks dependencies)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ✅ Simple configuration values
  const appName = getConfigValue('APP_NAME', 'IFRS Pro Platform');
  const appVersion = getConfigValue('APP_VERSION', '1.0.0');
  const stakeholderType = 'consultant'; // Fixed for consultant layout
  const isConfigValid = true; // Assume valid for now

  // ✅ Initialize component
  useEffect(() => {
    const initializeLayout = async () => {
      try {
        // Simulate initialization
        await new Promise(resolve => setTimeout(resolve, 500));
        setIsInitialized(true);
        setError(null);
      } catch (err) {
        setError('Failed to initialize consultant layout');
        console.error('Consultant layout initialization error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    initializeLayout();
  }, []);

  // ✅ Handle user menu
  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    console.log('Consultant logout');
    handleUserMenuClose();
    // Clear any stored auth data
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('ifrs9_refresh_token');
    }
    router.push('/login');
  };

  // ✅ Loading state
  if (isLoading || !isInitialized) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        bgcolor="#f5f5f5"
      >
        <Paper elevation={2} sx={{ p: 4, textAlign: 'center' }}>
          <CircularProgress size={40} sx={{ mb: 2 }} />
          <Typography variant="body1" color="textSecondary">
            Initializing Consultant Dashboard...
          </Typography>
        </Paper>
      </Box>
    );
  }

  // ✅ Error state
  if (error || !isConfigValid) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          <Typography variant="h6" gutterBottom>
            Configuration Error
          </Typography>
          <Typography variant="body2">
            {error || 'Invalid configuration detected. Please check environment settings.'}
          </Typography>
        </Alert>
      </Container>
    );
  }

  // ✅ Generate breadcrumb navigation
  const breadcrumbItems = [
    { label: 'Home', href: '/consultant' },
    ...breadcrumbs,
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* ✅ Consultant App Bar - Professional & Neutral Design */}
      <AppBar
        position="sticky"
        elevation={1}
        sx={{
          bgcolor: '#ffffff',
          color: '#333333',
          borderBottom: '1px solid #e0e0e0',
        }}
      >
        <Toolbar>
          {/* ✅ Application Title */}
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <BusinessIcon sx={{ mr: 2, color: '#1976d2' }} />
            <Typography variant="h6" component="div" sx={{ fontWeight: 'medium' }}>
              {appName} - Consultant
            </Typography>
          </Box>

          {/* ✅ Navigation Links */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, mr: 2 }}>
            {consultantNavigation.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Box
                  key={item.href}
                  component="button"
                  onClick={() => router.push(item.href)}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    px: 2,
                    py: 1,
                    mx: 0.5,
                    border: 'none',
                    borderRadius: 1,
                    backgroundColor: isActive ? '#e3f2fd' : 'transparent',
                    color: isActive ? '#1976d2' : '#666666',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      backgroundColor: '#f5f5f5',
                      color: '#1976d2',
                    },
                  }}
                >
                  <Icon sx={{ fontSize: 20, mr: 1 }} />
                  <Typography variant="body2" sx={{ fontWeight: isActive ? 'medium' : 'normal' }}>
                    {item.label}
                  </Typography>
                </Box>
              );
            })}
          </Box>

          {/* ✅ User Menu */}
          <IconButton
            size="large"
            aria-label="account of current user"
            aria-controls="consultant-menu"
            aria-haspopup="true"
            onClick={handleUserMenuOpen}
            color="inherit"
            sx={{ color: '#666666' }}
          >
            <Avatar sx={{ width: 32, height: 32, bgcolor: '#1976d2' }}>
              <AccountIcon />
            </Avatar>
          </IconButton>

          <Menu
            id="consultant-menu"
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={Boolean(anchorEl)}
            onClose={handleUserMenuClose}
          >
            <MenuItem onClick={handleUserMenuClose}>
              <AccountIcon sx={{ mr: 1 }} />
              Profile
            </MenuItem>
            <MenuItem onClick={handleUserMenuClose}>
              <SettingsIcon sx={{ mr: 1 }} />
              Settings
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <LogoutIcon sx={{ mr: 1 }} />
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* ✅ Breadcrumb Navigation */}
      {breadcrumbItems.length > 1 && (
        <Box sx={{ bgcolor: '#fafafa', borderBottom: '1px solid #e0e0e0' }}>
          <Container maxWidth="xl" sx={{ py: 1 }}>
            <Breadcrumbs aria-label="breadcrumb">
              {breadcrumbItems.map((crumb, index) => {
                const isLast = index === breadcrumbItems.length - 1;

                if (isLast) {
                  return (
                    <Typography key={index} color="text.primary" variant="body2">
                      {crumb.label}
                    </Typography>
                  );
                }

                return (
                  <Link
                    key={index}
                    color="inherit"
                    href={crumb.href}
                    onClick={(e) => {
                      e.preventDefault();
                      if (crumb.href) router.push(crumb.href);
                    }}
                    sx={{
                      textDecoration: 'none',
                      '&:hover': { textDecoration: 'underline' },
                      cursor: 'pointer',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {index === 0 && <HomeIcon sx={{ mr: 0.5, fontSize: 16 }} />}
                      <Typography variant="body2">{crumb.label}</Typography>
                    </Box>
                  </Link>
                );
              })}
            </Breadcrumbs>
          </Container>
        </Box>
      )}

      {/* ✅ Page Title */}
      {title && (
        <Box sx={{ bgcolor: '#ffffff', borderBottom: '1px solid #e0e0e0' }}>
          <Container maxWidth="xl" sx={{ py: 2 }}>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 'medium', color: '#333333' }}>
              {title}
            </Typography>
          </Container>
        </Box>
      )}

      {/* ✅ Main Content Area */}
      <Box sx={{ flexGrow: 1, bgcolor: '#f8f9fa' }}>
        <Container maxWidth="xl" sx={{ py: 3 }}>
          {children as any}
        </Container>
      </Box>

      {/* ✅ Footer */}
      <Box
        component="footer"
        sx={{
          bgcolor: '#ffffff',
          borderTop: '1px solid #e0e0e0',
          py: 2,
          mt: 'auto',
        }}
      >
        <Container maxWidth="xl">
          <Typography
            variant="body2"
            color="text.secondary"
            align="center"
            sx={{ opacity: 0.7 }}
          >
            © 2025 {appName} - Consultant Portal v{appVersion}
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default ConsultantLayout;