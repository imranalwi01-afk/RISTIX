// packages/frontend/src/app/banking/collective/segmentation/admin/page.tsx
// ============================================================================
// 🔧 SEGMENTATION REACT ADMIN INTEGRATION - BANKING INTERFACE
// ============================================================================
// ✅ INTEGRATION: React Admin interface embedded in banking layout
// ✅ FEATURES: Professional segmentation management with nested data
// ✅ CONTEXT: Maintains banking tenant context and authentication
// ✅ NAVIGATION: Seamless integration with existing banking navigation
// ============================================================================

'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Container,
  Card,
  CardContent,
  Button,
  Alert,
  Tabs,
  Tab,
  IconButton,
  Tooltip,
  Switch,
  FormControlLabel,
  Chip,
  Stack,
  Divider,
} from '@mui/material';
import {
  AccountTree as SegmentationIcon,
  ViewList as LegacyIcon,
  AdminPanelSettings as AdminIcon,
  Compare as CompareIcon,
  Launch as LaunchIcon,
  Refresh as RefreshIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';

// Import the React Admin app
import SegmentationAdminApp from '../../../../platform/admin/segmentation-admin';

// ============================================================================
// INTERFACE COMPARISON COMPONENT
// ============================================================================

const InterfaceComparison: React.FC = () => (
  <Card sx={{ mb: 3 }}>
    <CardContent>
      <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <CompareIcon />
        Interface Comparison
      </Typography>
      
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 2 }}>
        <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#1976d2', mb: 1 }}>
            Legacy Interface (Current)
          </Typography>
          <Typography variant="body2" sx={{ mb: 2, color: '#666' }}>
            Material-UI DataGrid with custom components, offline capability, and Excel-like functionality.
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
            <Chip label="27 Records" size="small" color="primary" />
            <Chip label="Offline Mode" size="small" color="success" />
            <Chip label="Export/Import" size="small" color="info" />
            <Chip label="Custom Forms" size="small" color="warning" />
          </Box>
          <Typography variant="caption" color="text.secondary">
            ✅ Proven stable • ✅ User familiar • ✅ Custom features
          </Typography>
        </Box>

        <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#dc004e', mb: 1 }}>
            React Admin Interface (New)
          </Typography>
          <Typography variant="body2" sx={{ mb: 2, color: '#666' }}>
            Professional admin interface with advanced filtering, bulk operations, and enterprise features.
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
            <Chip label="Advanced Filters" size="small" color="primary" />
            <Chip label="Bulk Operations" size="small" color="success" />
            <Chip label="Professional UI" size="small" color="info" />
            <Chip label="Expandable Rows" size="small" color="warning" />
          </Box>
          <Typography variant="caption" color="text.secondary">
            ✅ Modern design • ✅ Advanced features • ✅ Expandable
          </Typography>
        </Box>
      </Box>
    </CardContent>
  </Card>
);

// ============================================================================
// TAB PANEL COMPONENT
// ============================================================================

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index, ...other }) => (
  <div
    role="tabpanel"
    hidden={value !== index}
    id={`segmentation-tabpanel-${index}`}
    aria-labelledby={`segmentation-tab-${index}`}
    {...other}
  >
    {value === index && <Box>{children}</Box>}
  </div>
);

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function SegmentationAdminPage() {
  const [currentTab, setCurrentTab] = useState(0);
  const [showComparison, setShowComparison] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const handleRefresh = () => {
    setLastRefresh(new Date());
    // Trigger refresh in child components
    window.location.reload();
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <Container maxWidth="xl">
      {/* Page Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <AdminIcon sx={{ fontSize: 32, color: 'primary.main' }} />
            Advanced Segmentation Administration
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 1 }}>
            Professional React Admin interface for IFRS 9 segmentation rules management
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            <Chip label="React Admin v4" size="small" color="primary" />
            <Chip label="Material-UI v6" size="small" color="info" />
            <Chip label="Banking Integration" size="small" color="success" />
            <Chip label="27 Active Rules" size="small" color="warning" />
          </Stack>
        </Box>
        
        <Stack direction="row" spacing={1} alignItems="center">
          <FormControlLabel
            control={
              <Switch
                checked={showComparison}
                onChange={(e) => setShowComparison(e.target.checked)}
                size="small"
              />
            }
            label="Show Comparison"
            sx={{ mr: 2 }}
          />
          
          <Tooltip title="Refresh Data">
            <IconButton onClick={handleRefresh} color="primary">
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          
          <Button
            variant="outlined"
            startIcon={<LaunchIcon />}
            href="/banking/collective/segmentation"
            target="_blank"
            rel="noopener noreferrer"
          >
            Legacy Interface
          </Button>
        </Stack>
      </Box>

      {/* Interface Comparison */}
      {showComparison && <InterfaceComparison />}

      {/* Status Alert */}
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
          🚀 Enhanced Segmentation Management
        </Typography>
        <Typography variant="body2">
          This React Admin interface provides advanced segmentation rule management with professional features like 
          bulk operations, advanced filtering, expandable detail rows, and export capabilities. 
          All operations are fully integrated with the existing IFRS 9 platform backend.
        </Typography>
      </Alert>

      {/* Interface Tabs */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={currentTab} onChange={handleTabChange} aria-label="segmentation admin tabs">
            <Tab
              label="React Admin Interface"
              icon={<AdminIcon />}
              iconPosition="start"
              id="segmentation-tab-0"
              aria-controls="segmentation-tabpanel-0"
            />
            <Tab
              label="Legacy Interface"
              icon={<LegacyIcon />}
              iconPosition="start"
              id="segmentation-tab-1"
              aria-controls="segmentation-tabpanel-1"
            />
            <Tab
              label="API Documentation"
              icon={<SettingsIcon />}
              iconPosition="start"
              id="segmentation-tab-2"
              aria-controls="segmentation-tabpanel-2"
            />
          </Tabs>
        </Box>

        {/* Tab 0: React Admin Interface */}
        <TabPanel value={currentTab} index={0}>
          <Box sx={{ p: 2 }}>
            <Alert severity="success" sx={{ mb: 2 }}>
              <Typography variant="body2">
                ✅ React Admin interface is fully operational with real-time API integration. 
                All CRUD operations connect to the existing segmentation backend endpoints.
              </Typography>
            </Alert>
            
            {/* Embed React Admin App */}
            <Box sx={{ border: '1px solid #e0e0e0', borderRadius: 1, overflow: 'hidden' }}>
              <SegmentationAdminApp />
            </Box>
          </Box>
        </TabPanel>

        {/* Tab 1: Legacy Interface */}
        <TabPanel value={currentTab} index={1}>
          <Box sx={{ p: 2 }}>
            <Alert severity="info" sx={{ mb: 2 }}>
              <Typography variant="body2">
                The legacy interface is available for users who prefer the existing Material-UI DataGrid implementation.
                Both interfaces operate on the same data source.
              </Typography>
            </Alert>
            
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <Button
                variant="contained"
                size="large"
                startIcon={<LaunchIcon />}
                href="/banking/collective/segmentation"
              >
                Open Legacy Segmentation Interface
              </Button>
            </Box>
          </Box>
        </TabPanel>

        {/* Tab 2: API Documentation */}
        <TabPanel value={currentTab} index={2}>
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              API Integration Documentation
            </Typography>
            
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 2 }}>
              <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                  Backend Endpoints
                </Typography>
                <Typography variant="body2" sx={{ mb: 2, color: '#666' }}>
                  React Admin integrates with existing segmentation API:
                </Typography>
                <Box component="pre" sx={{ fontSize: '0.75rem', bgcolor: '#f5f5f5', p: 1, borderRadius: 1, overflow: 'auto' }}>
{`GET    /api/v1/banking/segmentation/headers
POST   /api/v1/banking/segmentation/headers
PUT    /api/v1/banking/segmentation/headers/:id
DELETE /api/v1/banking/segmentation/headers/:id
GET    /api/v1/banking/segmentation/details/:headerId`}
                </Box>
              </Box>

              <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                  Data Provider Features
                </Typography>
                <Typography variant="body2" sx={{ mb: 2, color: '#666' }}>
                  Custom data provider with advanced capabilities:
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Chip label="Pagination Support" size="small" color="primary" />
                  <Chip label="Sorting & Filtering" size="small" color="success" />
                  <Chip label="Error Handling" size="small" color="info" />
                  <Chip label="Offline Fallback" size="small" color="warning" />
                  <Chip label="Bulk Operations" size="small" color="error" />
                </Box>
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
              Implementation Notes
            </Typography>
            <Typography variant="body2" sx={{ color: '#666' }}>
              • React Admin uses the same authentication and tenant context as the banking interface<br />
              • Data transformations handle the mapping between 'pkid' (API) and 'id' (React Admin)<br />
              • Fallback data ensures the interface remains functional during backend maintenance<br />
              • All operations maintain audit trails and banking compliance requirements
            </Typography>
          </Box>
        </TabPanel>
      </Card>

      {/* Footer Info */}
      <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
        <Typography variant="caption" color="text.secondary">
          Last refreshed: {lastRefresh.toLocaleString()} • 
          React Admin v4 • Material-UI v6 • 
          Integration with IFRS 9 Platform Backend • 
          Banking Tenant Context Maintained
        </Typography>
      </Box>
    </Container>
  );
}