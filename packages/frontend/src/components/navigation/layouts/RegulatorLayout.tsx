// ============================================================================
// PSDD ARTIFACT DOCUMENTATION
// ============================================================================
// File Path: packages/frontend/src/components/navigation/layouts/RegulatorLayout.tsx
// Generated: 2025-01-21T10:50:00Z
// Phase: D2H6 - Stakeholder Layout Components Implementation
// Purpose: Regulator Portal Layout Component with Compliance Oversight Features
// Dependencies: @mui/material v6.1.6, Regulatory Context, Audit Controls
// Security: Regulatory role validation and compliance monitoring
// ============================================================================

'use client';

import React from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Container,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Breadcrumbs,
  Link,
  Alert,
  Badge
} from '@mui/material';
import {
  Gavel,
  Security,
  Visibility,
  AccountCircle,
  Settings,
  ExitToApp,
  Warning,
  Shield,
  Assessment
} from '@mui/icons-material';
import { useAuth } from '../../../providers/AuthProvider';
import { getConfigValue } from '../../../config/environment.config';

interface RegulatorLayoutProps {
  children: React.ReactNode;
}

const RegulatorLayout: React.FC<RegulatorLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [complianceAlerts] = React.useState(3); // This would come from real data

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleMenuClose();
    logout();
  };

  const regulatoryAuthority = (user as any)?.authority || getConfigValue('REGULATOR_DEFAULT_AUTHORITY', 'Financial Authority');
  const jurisdiction = (user as any)?.jurisdiction || 'National';

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Regulator Header */}
      <AppBar
        position="static"
        sx={{
          bgcolor: getConfigValue('THEME_REGULATOR_PRIMARY_COLOR', '#6a1b9a'),
          borderBottom: '3px solid',
          borderBottomColor: getConfigValue('THEME_REGULATOR_ACCENT_COLOR', '#4a148c'),
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Gavel sx={{ mr: 1, fontSize: '1.5rem' }} />
            <Box>
              <Typography variant="h6" component="div" sx={{ lineHeight: 1.2 }}>
                Regulatory Oversight
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.9 }}>
                Banking Supervision & Compliance
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {/* Jurisdiction Badge */}
            <Chip
              icon={<Shield />}
              label={`${jurisdiction} Jurisdiction`}
              color="default"
              size="small"
              sx={{
                bgcolor: 'rgba(255,255,255,0.2)',
                color: 'white',
                '& .MuiChip-icon': { color: 'white' }
              }}
            />

            {/* Authority Info */}
            <Chip
              icon={<Security />}
              label={regulatoryAuthority}
              color="default"
              size="small"
              sx={{
                bgcolor: 'rgba(255,255,255,0.15)',
                color: 'white',
                '& .MuiChip-icon': { color: 'white' }
              }}
            />

            {/* Compliance Alerts */}
            <IconButton sx={{ color: 'white' }}>
              <Badge badgeContent={complianceAlerts} color="error">
                <Warning />
              </Badge>
            </IconButton>

            {/* User Menu */}
            <IconButton
              onClick={handleMenuClick}
              sx={{ color: 'white' }}
            >
              <Avatar sx={{ width: 32, height: 32, bgcolor: 'rgba(255,255,255,0.2)' }}>
                <AccountCircle />
              </Avatar>
            </IconButton>

            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
              <MenuItem onClick={handleMenuClose}>
                <Settings sx={{ mr: 1 }} />
                Regulatory Settings
              </MenuItem>
              <MenuItem onClick={handleMenuClose}>
                <Assessment sx={{ mr: 1 }} />
                Compliance Reports
              </MenuItem>
              <MenuItem onClick={handleMenuClose}>
                <Visibility sx={{ mr: 1 }} />
                Audit Oversight
              </MenuItem>
              <MenuItem onClick={handleLogout}>
                <ExitToApp sx={{ mr: 1 }} />
                Logout
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Breadcrumb Navigation */}
      <Box sx={{ bgcolor: 'grey.50', py: 1, px: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Breadcrumbs aria-label="regulatory navigation">
          <Link underline="hover" color="inherit" href="/regulator">
            Regulatory Hub
          </Link>
          <Typography color="text.primary">Oversight Dashboard</Typography>
        </Breadcrumbs>
      </Box>

      {/* Regulatory Warning Banner */}
      <Alert
        severity="info"
        icon={<Shield />}
        sx={{
          borderRadius: 0,
          bgcolor: 'info.light',
          borderBottom: '1px solid',
          borderColor: 'divider'
        }}
      >
        <Typography variant="body2" fontWeight="bold">
          Regulatory Oversight Mode Active
        </Typography>
        <Typography variant="caption">
          All system activities are subject to regulatory supervision. Data access is logged and monitored.
        </Typography>
      </Alert>

      {/* Main Content */}
      <Container
        maxWidth="xl"
        sx={{
          flex: 1,
          py: 3,
          backgroundColor: getConfigValue('THEME_REGULATOR_BG_COLOR', '#fafafa'),
        }}
      >
        {children as any}
      </Container>

      {/* Footer */}
      <Box
        component="footer"
        sx={{
          py: 2,
          px: 3,
          mt: 'auto',
          bgcolor: 'grey.100',
          borderTop: '1px solid',
          borderColor: 'divider'
        }}
      >
        <Typography variant="caption" color="text.secondary" align="center" display="block">
          {regulatoryAuthority} • Regulatory Oversight Portal • {jurisdiction} Jurisdiction
        </Typography>
      </Box>
    </Box>
  );
};

export default RegulatorLayout;