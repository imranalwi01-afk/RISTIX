// ============================================================================
// PSDD ARTIFACT DOCUMENTATION
// ============================================================================
// File Path: packages/frontend/src/admin/components/common/AdminLayout.tsx
// Generated: Day 2 Hour 6 - Part 2 of 8
// Phase: D2H6 - React Admin Dual Banking Foundation
// Methodology: Phased Shell-Driven Development (PSDD)
// Dependencies: React Admin v4, Material-UI v6
// Purpose: Main layout with dual banking navigation and theme switching
// ============================================================================

import React, { useState } from 'react';
import { Layout, LayoutProps, Menu, useGetIdentity } from 'react-admin';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Avatar,
  Chip,
  Button,
  Menu as MuiMenu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Badge,
  Tooltip
} from '@mui/material';
import {
  AccountBalance,
  Security,
  Notifications,
  Settings,
  ExitToApp,
  Brightness4,
  Brightness7,
  SwapHoriz,
  Dashboard,
  People,
  Assessment,
  Upload,
  GetApp,
  AccountTree,
  Business
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

// Types
interface AdminLayoutProps extends LayoutProps {
  bankingType: 'conventional' | 'syariah' | 'dual';
  tenantConfig: any;
  onBankingTypeChange: (type: 'conventional' | 'syariah' | 'dual') => void;
}

/**
 * Custom App Bar with Banking Type Switching and User Menu
 */
const CustomAppBar: React.FC<{
  bankingType: 'conventional' | 'syariah' | 'dual';
  tenantConfig: any;
  onBankingTypeChange: (type: 'conventional' | 'syariah' | 'dual') => void;
}> = ({ bankingType, tenantConfig, onBankingTypeChange }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notificationAnchor, setNotificationAnchor] = useState<null | HTMLElement>(null);
  const { data: identity } = useGetIdentity();
  const theme = useTheme();

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClick = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationAnchor(event.currentTarget);
  };

  const handleNotificationClose = () => {
    setNotificationAnchor(null);
  };

  const handleBankingTypeSwitch = () => {
    const newType = bankingType === 'syariah' ? 'conventional' : 'syariah';
    onBankingTypeChange(newType);
    handleMenuClose();
  };

  const getBankingTypeIcon = () => {
    return bankingType === 'syariah' ? <Security /> : <AccountBalance />;
  };

  const getBankingTypeColor = () => {
    return bankingType === 'syariah' ? 'success' : 'primary';
  };

  return (
    <AppBar position="static" elevation={1}>
      <Toolbar>
        {/* Logo and Title */}
        <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
          <Avatar
            sx={{
              bgcolor: getBankingTypeColor() === 'success' ? 'success.light' : 'primary.light',
              mr: 2
            }}
          >
            {getBankingTypeIcon()}
          </Avatar>
          
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            IFRS 9 Platform
          </Typography>

          <Chip
            icon={getBankingTypeIcon()}
            label={bankingType === 'syariah' ? 'Islamic Banking' : 'Conventional Banking'}
            color={getBankingTypeColor() as any}
            variant="outlined"
            sx={{ 
              mr: 2,
              bgcolor: 'rgba(255,255,255,0.1)',
              color: 'white',
              borderColor: 'rgba(255,255,255,0.3)'
            }}
          />
        </Box>

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Banking Type Switch */}
          <Tooltip title={`Switch to ${bankingType === 'syariah' ? 'Conventional' : 'Islamic'} Banking`}>
            <IconButton
              color="inherit"
              onClick={handleBankingTypeSwitch}
              sx={{ 
                bgcolor: 'rgba(255,255,255,0.1)',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' }
              }}
            >
              <SwapHoriz />
            </IconButton>
          </Tooltip>

          {/* Notifications */}
          <Tooltip title="Notifications">
            <IconButton color="inherit" onClick={handleNotificationClick}>
              <Badge badgeContent={3} color="error">
                <Notifications />
              </Badge>
            </IconButton>
          </Tooltip>

          {/* User Menu */}
          <Tooltip title="User Menu">
            <IconButton color="inherit" onClick={handleMenuClick}>
              <Avatar
                sx={{ width: 32, height: 32 }}
                src={identity?.avatar}
              >
                {identity?.fullName?.charAt(0) || 'U'}
              </Avatar>
            </IconButton>
          </Tooltip>
        </Box>

        {/* Notification Menu */}
        <MuiMenu
          anchorEl={notificationAnchor}
          open={Boolean(notificationAnchor)}
          onClose={handleNotificationClose}
        >
          <MenuItem>
            <ListItemIcon>
              <Assessment />
            </ListItemIcon>
            <ListItemText 
              primary="ECL Calculation Complete"
              secondary="Portfolio ABC - 2 minutes ago"
            />
          </MenuItem>
          <MenuItem>
            <ListItemIcon>
              <Upload />
            </ListItemIcon>
            <ListItemText 
              primary="Data Upload Successful"
              secondary="Monthly data - 1 hour ago"
            />
          </MenuItem>
          <MenuItem>
            <ListItemIcon>
              <Security />
            </ListItemIcon>
            <ListItemText 
              primary="Compliance Check Required"
              secondary="Portfolio XYZ - 3 hours ago"
            />
          </MenuItem>
        </MuiMenu>

        {/* User Menu */}
        <MuiMenu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem disabled>
            <ListItemText 
              primary={identity?.fullName || 'User'}
              secondary={identity?.email || 'user@example.com'}
            />
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleBankingTypeSwitch}>
            <ListItemIcon>
              {bankingType === 'syariah' ? <AccountBalance /> : <Security />}
            </ListItemIcon>
            <ListItemText>
              Switch to {bankingType === 'syariah' ? 'Conventional' : 'Islamic'} Banking
            </ListItemText>
          </MenuItem>
          <MenuItem>
            <ListItemIcon>
              <Settings />
            </ListItemIcon>
            <ListItemText>Settings</ListItemText>
          </MenuItem>
          <Divider />
          <MenuItem>
            <ListItemIcon>
              <ExitToApp />
            </ListItemIcon>
            <ListItemText>Logout</ListItemText>
          </MenuItem>
        </MuiMenu>
      </Toolbar>
    </AppBar>
  );
};

/**
 * Custom Menu with Banking-Specific Navigation
 */
const CustomMenu: React.FC<{
  bankingType: 'conventional' | 'syariah' | 'dual';
}> = ({ bankingType }) => {
  return (
    <Menu>
      <Menu.DashboardItem />
      
      <Menu.Item 
        to="/portfolios" 
        primaryText={bankingType === 'syariah' ? 'Islamic Portfolios' : 'Portfolios'}
        leftIcon={<AccountTree />}
      />
      
      <Menu.Item 
        to="/customers" 
        primaryText={bankingType === 'syariah' ? 'Islamic Customers' : 'Customers'}
        leftIcon={<People />}
      />
      
      <Menu.Item 
        to="/calculations" 
        primaryText="ECL Calculations"
        leftIcon={<Assessment />}
      />
      
      <Menu.Item 
        to="/reports" 
        primaryText={bankingType === 'syariah' ? 'Syariah Reports' : 'Reports'}
        leftIcon={<GetApp />}
      />
      
      <Menu.Item 
        to="/upload" 
        primaryText="Data Upload"
        leftIcon={<Upload />}
      />
      
      <Menu.Item 
        to="/configurations" 
        primaryText="Configuration"
        leftIcon={<Settings />}
      />

      {bankingType === 'syariah' && (
        <>
          <Menu.Item 
            to="/shariah-board" 
            primaryText="Shariah Board"
            leftIcon={<Security />}
          />
          <Menu.Item 
            to="/islamic-products" 
            primaryText="Islamic Products"
            leftIcon={<Business />}
          />
        </>
      )}
    </Menu>
  );
};

/**
 * Main Admin Layout Component
 * Provides the overall layout structure with dual banking support
 */
export const AdminLayout: React.FC<AdminLayoutProps> = (props) => {
  const { bankingType, tenantConfig, onBankingTypeChange, ...layoutProps } = props;

  return (
    <Layout
      {...layoutProps}
      appBar={() => (
        <CustomAppBar
          bankingType={bankingType}
          tenantConfig={tenantConfig}
          onBankingTypeChange={onBankingTypeChange}
        />
      )}
      menu={() => <CustomMenu bankingType={bankingType} />}
      sx={{
        // CRITICAL FIX: Allow proper scrolling for React Admin layout
        height: 'auto !important',
        minHeight: '100vh',
        overflow: 'visible !important',
        
        // Fix for React Admin content area
        '& .RaLayout-root': {
          height: 'auto !important',
          minHeight: '100vh',
          overflow: 'visible !important'
        },
        
        '& .RaLayout-appFrame': {
          height: 'auto !important',
          minHeight: '100vh',
          overflow: 'visible !important'
        },
        
        '& .RaLayout-content': {
          paddingLeft: 0,
          paddingTop: 0,
          height: 'auto !important',
          overflow: 'visible !important'
        },
        
        '& .RaLayout-contentWithSidebar': {
          height: 'auto !important',
          overflow: 'visible !important'
        },
        
        // Fix for the main content container
        '& main': {
          height: 'auto !important',
          overflow: 'visible !important'
        },
        
        // Ensure sidebar doesn't interfere with scrolling
        '& aside': {
          height: 'auto !important',
          maxHeight: '100vh',
          overflow: 'auto'
        }
      }}
    />
  );
};

export default AdminLayout;