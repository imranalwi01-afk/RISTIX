// packages/frontend/src/components/admin/MenuAdmin.tsx
// ============================================================================
// Menu Administration Component
// ============================================================================
// Generated: 2025-01-12
// Purpose: Admin interface for managing database-driven menu configurations
// Methodology: Core Platform MVP - Menu Admin Interface
// Dependencies: React, Material-UI, React Admin
// ============================================================================

import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Alert,
  Skeleton,
  Tooltip
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Visibility as VisibilityIcon,
  Analytics as AnalyticsIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { SafeDataGrid } from '@/components/shared/SafeDataGrid';
import { menuApi, MenuConfiguration, MenuConfigurationRequest } from '../../services/api/menu.api';
import { useMenuConfigurationsQuery, useSaveMenuConfigurationMutation } from '@/features/menu-admin/hooks/useMenuAdminQueries';

interface MenuAdminProps {
  maxHeight?: number;
  showAnalytics?: boolean;
}

export const MenuAdmin: React.FC<MenuAdminProps> = ({
  maxHeight = 600,
  showAnalytics = true
}) => {
  // State management
  const [error, setError] = useState<string | null>(null);
  const [selectedConfig, setSelectedConfig] = useState<MenuConfiguration | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [analyticsDialogOpen, setAnalyticsDialogOpen] = useState(false);
  const menuConfigurationsQuery = useMenuConfigurationsQuery();
  const saveMenuConfigurationMutation = useSaveMenuConfigurationMutation();
  const configurations = menuConfigurationsQuery.data ?? [];
  const loading =
    menuConfigurationsQuery.isLoading ||
    menuConfigurationsQuery.isFetching ||
    saveMenuConfigurationMutation.isPending;

  // Form state
  const [formData, setFormData] = useState<MenuConfigurationRequest>({
    name: '',
    description: '',
    target_audience: 'banking_staff',
    banking_mode: undefined,
    tenant_specific: false,
    is_default: false,
    is_active: true,
    version: '1.0.0'
  });

  // Handle create/edit configuration
  const handleSaveConfiguration = async () => {
    try {
      setError(null);
      await saveMenuConfigurationMutation.mutateAsync(formData);
      setEditDialogOpen(false);
      resetForm();
    } catch (error: any) {
      setError(error.message || 'Failed to save menu configuration');
    }
  };

  // Handle edit configuration
  const handleEditConfiguration = (config: MenuConfiguration) => {
    setFormData({
      id: config.id,
      name: config.name,
      description: config.description,
      target_audience: config.target_audience as any,
      banking_mode: config.banking_mode as any,
      tenant_specific: false, // Would need to fetch from full config
      is_default: false, // Would need to fetch from full config
      is_active: true, // Would need to fetch from full config
      version: config.version
    });
    setSelectedConfig(config);
    setEditDialogOpen(true);
  };

  // Handle view configuration details
  const handleViewConfiguration = async (config: MenuConfiguration) => {
    try {
      const menuItems = await menuApi.getMenuItems(config.id);
      // Could open a detailed view dialog here
    } catch (error) {
      console.error('Failed to load menu items:', error);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      target_audience: 'banking_staff',
      banking_mode: undefined,
      tenant_specific: false,
      is_default: false,
      is_active: true,
      version: '1.0.0'
    });
    setSelectedConfig(null);
  };

  // Data Grid columns
  const columns: GridColDef[] = [
    {
      field: 'name',
      headerName: 'Menu Name',
      flex: 2,
      minWidth: 200
    },
    {
      field: 'target_audience',
      headerName: 'Target Audience',
      flex: 1,
      minWidth: 150,
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          label={params.value.replace('_', ' ')}
          size="small"
          color="primary"
          variant="outlined"
        />
      )
    },
    {
      field: 'banking_mode',
      headerName: 'Banking Mode',
      flex: 1,
      minWidth: 130,
      renderCell: (params: GridRenderCellParams) => {
        if (!params.value) return <Typography variant="body2" color="text.secondary">All</Typography>;
        return (
          <Chip
            label={params.value.charAt(0).toUpperCase() + params.value.slice(1)}
            size="small"
            color={params.value === 'syariah' ? 'success' : 'default'}
            variant="outlined"
          />
        );
      }
    },
    {
      field: 'version',
      headerName: 'Version',
      flex: 0.5,
      minWidth: 80
    },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 1,
      minWidth: 150,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="View Details">
            <IconButton
              size="small"
              onClick={() => handleViewConfiguration(params.row)}
            >
              <VisibilityIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit Configuration">
            <IconButton
              size="small"
              onClick={() => handleEditConfiguration(params.row)}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          {showAnalytics && (
            <Tooltip title="View Analytics">
              <IconButton
                size="small"
                onClick={() => {
                  setSelectedConfig(params.row);
                  setAnalyticsDialogOpen(true);
                }}
              >
                <AnalyticsIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      )
    }
  ];

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight={600}>
          Menu Administration
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            startIcon={<RefreshIcon />}
            onClick={() => menuConfigurationsQuery.refetch()}
            disabled={loading}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              resetForm();
              setEditDialogOpen(true);
            }}
          >
            Create Menu
          </Button>
        </Box>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      {!error && menuConfigurationsQuery.error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Failed to load menu configurations.
        </Alert>
      )}

      {/* Data Grid */}
      <Paper sx={{ height: maxHeight }}>
        <SafeDataGrid
          rows={configurations}
          columns={columns}
          loading={loading}
          disableRowSelectionOnClick
          pageSizeOptions={[10, 25, 50]}
          initialState={{
            pagination: { paginationModel: { pageSize: 25 } }
          }}
          sx={{
            '& .MuiDataGrid-cell': {
              borderBottom: 1,
              borderColor: 'divider'
            }
          }}
        />
      </Paper>

      {/* Edit/Create Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedConfig ? 'Edit Menu Configuration' : 'Create Menu Configuration'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              label="Menu Name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
              fullWidth
            />

            <TextField
              label="Description"
              value={formData.description || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              multiline
              rows={3}
              fullWidth
            />

            <FormControl fullWidth required>
              <InputLabel>Target Audience</InputLabel>
              <Select
                value={formData.target_audience}
                label="Target Audience"
                onChange={(e) => setFormData(prev => ({ ...prev, target_audience: e.target.value as MenuConfigurationRequest['target_audience'] }))}
              >
                <MenuItem value="banking_staff">Banking Staff</MenuItem>
                <MenuItem value="consultant">Consultant</MenuItem>
                <MenuItem value="regulator">Regulator</MenuItem>
                <MenuItem value="platform_admin">Platform Admin</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Banking Mode</InputLabel>
              <Select
                value={formData.banking_mode || ''}
                label="Banking Mode"
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  banking_mode: (e.target.value as MenuConfigurationRequest['banking_mode']) || undefined
                }))}
              >
                <MenuItem value="">All Banking Types</MenuItem>
                <MenuItem value="conventional">Conventional</MenuItem>
                <MenuItem value="syariah">Syariah</MenuItem>
                <MenuItem value="dual">Dual Banking</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Version"
              value={formData.version}
              onChange={(e) => setFormData(prev => ({ ...prev, version: e.target.value }))}
              placeholder="1.0.0"
              helperText="Use semantic versioning (x.y.z)"
              fullWidth
            />

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.tenant_specific}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      tenant_specific: e.target.checked
                    }))}
                  />
                }
                label="Tenant Specific"
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={formData.is_default}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      is_default: e.target.checked
                    }))}
                  />
                }
                label="Default Configuration"
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={formData.is_active}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      is_active: e.target.checked
                    }))}
                  />
                }
                label="Active"
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveConfiguration}
            disabled={!formData.name || loading}
          >
            {loading ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Analytics Dialog */}
      <Dialog
        open={analyticsDialogOpen}
        onClose={() => setAnalyticsDialogOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          Menu Analytics - {selectedConfig?.name}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ p: 2 }}>
            <Alert severity="info">
              Menu analytics feature coming soon. This will show usage statistics,
              most accessed items, and user interaction patterns.
            </Alert>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAnalyticsDialogOpen(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box >
  );
};

export default MenuAdmin;
