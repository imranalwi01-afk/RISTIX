// packages/frontend/src/components/roles/PermissionsMatrix.tsx
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Checkbox,
  Chip,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Badge,
  LinearProgress,
  Grid,
  Switch,
  FormControlLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  TextField,
  InputAdornment,
  Menu,
  MenuList,
  MenuItem as MuiMenuItem
} from '@mui/material';
import {
  GridOn as GridIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  Security as PermissionIcon,
  Settings as SettingsIcon,
  Assessment as ReportIcon,
  Business as BusinessIcon,
  Person as PersonIcon,
  Group as GroupIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Close as CloseIcon,
  MoreVert as MoreVertIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  ViewColumn as ViewColumnIcon,
  ViewModule as ViewModuleIcon,
  ExpandMore as ExpandMoreIcon
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { api } from '@/services/api';

// Types
interface Role {
  id: string;
  name: string;
  displayName: string;
  type: 'SYSTEM' | 'BANKING' | 'CUSTOM';
  level: 'PLATFORM' | 'TENANT' | 'DEPARTMENT';
  isActive: boolean;
  isBuiltIn: boolean;
  permissions: Permission[];
  assignedUsers: number;
}

interface Permission {
  id: string;
  module: string;
  resource: string;
  action: string;
  displayName: string;
  description: string;
  category: 'CORE' | 'BANKING' | 'IFRS9' | 'REPORTING' | 'ADMIN';
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  requiresApproval: boolean;
  requiredApprovalLevel?: number | null;
  requiredApprovers?: number;
  bankingSpecific: boolean;
  syariahRequired?: boolean;
}

interface PermissionCategory {
  name: string;
  displayName: string;
  permissions: Permission[];
}

interface CellData {
  roleId: string;
  permissionId: string;
  hasPermission: boolean;
  isReadonly: boolean;
  riskLevel: string;
  category: string;
}

interface PermissionsMatrixProps {
  onPermissionUpdate?: (roleId: string, permissionIds: string[]) => void;
  refreshTrigger?: number;
}

const PermissionsMatrix: React.FC<PermissionsMatrixProps> = ({
  onPermissionUpdate,
  refreshTrigger = 0
}) => {
  const theme = useTheme();
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [permissionCategories, setPermissionCategories] = useState<PermissionCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRiskLevel, setFilterRiskLevel] = useState<string>('all');
  const [showSystemRoles, setShowSystemRoles] = useState(true);
  const [compactView, setCompactView] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [pendingChanges, setPendingChanges] = useState<Map<string, Set<string>>>(new Map());
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedCell, setSelectedCell] = useState<{ roleId: string, permissionId: string } | null>(null);

  // Fetch data
  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('🔑 Fetching permissions matrix data...');
      const [rolesResponse, permissionsResponse] = await Promise.all([
        api.roles.getAll({}),
        api.roles.getPermissions()
      ]);

      const rolesData = rolesResponse.data || [];
      const permissionsData = permissionsResponse.data || [];

      setRoles(rolesData);
      setPermissions(permissionsData);

      // Group permissions by category
      const categories = groupPermissionsByCategory(permissionsData);
      setPermissionCategories(categories);

      console.log(`✅ Fetched ${rolesData.length} roles and ${permissionsData.length} permissions`);

    } catch (error) {
      console.error('❌ Error fetching permissions matrix data:', error);
      setError('Failed to load permissions data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [refreshTrigger]);

  // Group permissions by category
  const groupPermissionsByCategory = (permissions: Permission[]): PermissionCategory[] => {
    const categories: { [key: string]: PermissionCategory } = {};

    permissions.forEach(permission => {
      if (!categories[permission.category]) {
        categories[permission.category] = {
          name: permission.category,
          displayName: permission.category.replace('_', ' '),
          permissions: []
        };
      }
      categories[permission.category].permissions.push(permission);
    });

    return Object.values(categories);
  };

  // Filter data
  const filteredRoles = useMemo(() => {
    return roles.filter(role => {
      if (!showSystemRoles && role.type === 'SYSTEM') return false;
      if (selectedRoles.length > 0 && !selectedRoles.includes(role.id)) return false;
      return true;
    });
  }, [roles, showSystemRoles, selectedRoles]);

  const filteredPermissions = useMemo(() => {
    return permissions.filter(permission => {
      if (selectedCategories.length > 0 && !selectedCategories.includes(permission.category)) return false;
      if (searchTerm && !permission.displayName.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !permission.description.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      if (filterRiskLevel !== 'all' && permission.riskLevel !== filterRiskLevel) return false;
      return true;
    });
  }, [permissions, selectedCategories, searchTerm, filterRiskLevel]);

  // Generate matrix data
  const matrixData = useMemo(() => {
    const cells: CellData[] = [];

    filteredRoles.forEach(role => {
      filteredPermissions.forEach(permission => {
        const hasPermission = role.permissions.some(p => p.id === permission.id);
        const isReadonly = role.isBuiltIn && hasPermission;

        cells.push({
          roleId: role.id,
          permissionId: permission.id,
          hasPermission,
          isReadonly,
          riskLevel: permission.riskLevel,
          category: permission.category
        });
      });
    });

    return cells;
  }, [filteredRoles, filteredPermissions]);

  // Get risk level color
  const getRiskLevelColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'LOW': return theme.palette.success.light;
      case 'MEDIUM': return theme.palette.warning.light;
      case 'HIGH': return theme.palette.error.light;
      case 'CRITICAL': return theme.palette.error.dark;
      default: return theme.palette.grey[100];
    }
  };

  const getRiskLevelTextColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'LOW': return theme.palette.success.dark;
      case 'MEDIUM': return theme.palette.warning.dark;
      case 'HIGH': return theme.palette.error.dark;
      case 'CRITICAL': return theme.palette.grey[100];
      default: return theme.palette.text.primary;
    }
  };

  // Toggle permission
  const togglePermission = (roleId: string, permissionId: string) => {
    if (!editMode) return;

    const role = filteredRoles.find(r => r.id === roleId);
    if (role?.isBuiltIn) return;

    setPendingChanges(prev => {
      const newChanges = new Map(prev);
      const roleChanges = newChanges.get(roleId) || new Set();

      if (roleChanges.has(permissionId)) {
        roleChanges.delete(permissionId);
      } else {
        roleChanges.add(permissionId);
      }

      if (roleChanges.size === 0) {
        newChanges.delete(roleId);
      } else {
        newChanges.set(roleId, roleChanges);
      }

      return newChanges;
    });
  };

  // Save changes
  const saveChanges = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('💾 Saving permission changes...');

      for (const [roleId, permissionIds] of pendingChanges) {
        const foundRole = filteredRoles.find(r => r.id === roleId);
        const rolePermissions = foundRole ? foundRole.permissions.map(p => p.id) : [];

        const updatedPermissions = Array.from(permissionIds);
        await api.roles.updatePermissions(roleId, updatedPermissions);

        onPermissionUpdate?.(roleId, updatedPermissions);
      }

      setPendingChanges(new Map());
      setEditMode(false);
      await fetchData();

      console.log('✅ Permission changes saved successfully');

    } catch (error) {
      console.error('❌ Error saving permission changes:', error);
      setError('Failed to save permission changes');
    } finally {
      setLoading(false);
    }
  };

  // Cancel changes
  const cancelChanges = () => {
    setPendingChanges(new Map());
    setEditMode(false);
  };

  // Export matrix
  const exportMatrix = () => {
    const csvContent = generateCSV();
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `permissions-matrix-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const generateCSV = () => {
    let csv = 'Role,';

    // Add permission headers
    filteredPermissions.forEach(permission => {
      csv += `"${permission.displayName}",`;
    });
    csv += '\n';

    // Add role rows
    filteredRoles.forEach(role => {
      csv += `"${role.displayName}",`;

      filteredPermissions.forEach(permission => {
        const hasPermission = role.permissions.some(p => p.id === permission.id);
        csv += hasPermission ? '✓,' : '×,';
      });

      csv += '\n';
    });

    return csv;
  };

  // Get statistics
  const getStatistics = () => {
    const totalCells = matrixData.length;
    const assignedCells = matrixData.filter(cell => cell.hasPermission).length;
    const criticalCells = matrixData.filter(cell => cell.riskLevel === 'CRITICAL').length;
    const highRiskCells = matrixData.filter(cell => cell.riskLevel === 'HIGH').length;
    const systemRoles = filteredRoles.filter(r => r.type === 'SYSTEM').length;
    const customRoles = filteredRoles.filter(r => r.type === 'CUSTOM').length;

    return {
      total: totalCells,
      assigned: assignedCells,
      unassigned: totalCells - assignedCells,
      critical: criticalCells,
      highRisk: highRiskCells,
      systemRoles,
      customRoles,
      coverage: totalCells > 0 ? ((assignedCells / totalCells) * 100).toFixed(1) : '0'
    };
  };

  const stats = getStatistics();

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Typography>Loading permissions matrix...</Typography>
          <LinearProgress sx={{ mt: 2 }} />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <GridIcon color="primary" />
          Permissions Matrix
        </Typography>

        <Box sx={{ display: 'flex', gap: 1 }}>
          {editMode ? (
            <>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={saveChanges}
                disabled={pendingChanges.size === 0 || loading}
                color="success"
              >
                Save ({pendingChanges.size})
              </Button>
              <Button
                variant="outlined"
                startIcon={<CancelIcon />}
                onClick={cancelChanges}
              >
                Cancel
              </Button>
            </>
          ) : (
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={() => setEditMode(true)}
              color="primary"
            >
              Edit Matrix
            </Button>
          )}

          <IconButton onClick={exportMatrix}>
            <DownloadIcon />
          </IconButton>
          <IconButton onClick={fetchData}>
            <RefreshIcon />
          </IconButton>
        </Box>
      </Box>

      {/* Statistics */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
          <Paper sx={{ p: 2, textAlign: 'center', borderLeft: `4px solid ${theme.palette.primary.main}` }}>
            <Typography variant="h4" color="primary">{stats.total}</Typography>
            <Typography variant="body2" color="text.secondary">Total Cells</Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
          <Paper sx={{ p: 2, textAlign: 'center', borderLeft: `4px solid ${theme.palette.success.main}` }}>
            <Typography variant="h4" color="success.main">{stats.assigned}</Typography>
            <Typography variant="body2" color="text.secondary">Assigned ({stats.coverage}%)</Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
          <Paper sx={{ p: 2, textAlign: 'center', borderLeft: `4px solid ${theme.palette.error.main}` }}>
            <Typography variant="h4" color="error.main">{stats.critical}</Typography>
            <Typography variant="body2" color="text.secondary">Critical</Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
          <Paper sx={{ p: 2, textAlign: 'center', borderLeft: `4px solid ${theme.palette.warning.main}` }}>
            <Typography variant="h4" color="warning.main">{stats.highRisk}</Typography>
            <Typography variant="body2" color="text.secondary">High Risk</Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
          <Paper sx={{ p: 2, textAlign: 'center', borderLeft: `4px solid ${theme.palette.secondary.main}` }}>
            <Typography variant="h4" color="secondary.main">{stats.systemRoles}</Typography>
            <Typography variant="body2" color="text.secondary">System Roles</Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
          <Paper sx={{ p: 2, textAlign: 'center', borderLeft: `4px solid ${theme.palette.info.main}` }}>
            <Typography variant="h4" color="info.main">{stats.customRoles}</Typography>
            <Typography variant="body2" color="text.secondary">Custom Roles</Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <FilterIcon />
              <Typography variant="subtitle1">Filters & Settings</Typography>
              <Chip
                label={`${filteredRoles.length} roles × ${filteredPermissions.length} permissions`}
                size="small"
                color="primary"
              />
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={2} alignItems="center">
              <Grid size={{ xs: 12, md: 3 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Search Permissions"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>
                  }}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 2 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Risk Level</InputLabel>
                  <Select
                    value={filterRiskLevel}
                    onChange={(e) => setFilterRiskLevel(e.target.value)}
                    label="Risk Level"
                  >
                    <MenuItem value="all">All Levels</MenuItem>
                    <MenuItem value="LOW">Low</MenuItem>
                    <MenuItem value="MEDIUM">Medium</MenuItem>
                    <MenuItem value="HIGH">High</MenuItem>
                    <MenuItem value="CRITICAL">Critical</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, md: 2 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Categories</InputLabel>
                  <Select
                    multiple
                    value={selectedCategories}
                    onChange={(e) => setSelectedCategories(e.target.value as string[])}
                    label="Categories"
                    renderValue={(selected) => selected.join(', ')}
                  >
                    {permissionCategories.map((category) => (
                      <MenuItem key={category.name} value={category.name}>
                        {category.displayName}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, md: 2 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={showSystemRoles}
                      onChange={(e) => setShowSystemRoles(e.target.checked)}
                      size="small"
                    />
                  }
                  label="Show System Roles"
                />
              </Grid>

              <Grid size={{ xs: 12, md: 2 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={compactView}
                      onChange={(e) => setCompactView(e.target.checked)}
                      size="small"
                    />
                  }
                  label="Compact View"
                />
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>
      </Paper>

      {/* Permissions Matrix */}
      <Paper sx={{ overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: 600, overflow: 'auto' }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ minWidth: 150, fontWeight: 'bold', backgroundColor: theme.palette.grey[100] }}>
                  Role
                </TableCell>
                {filteredPermissions.map((permission) => (
                  <TableCell
                    key={permission.id}
                    sx={{
                      minWidth: compactView ? 80 : 120,
                      fontWeight: 'bold',
                      backgroundColor: getRiskLevelColor(permission.riskLevel),
                      color: getRiskLevelTextColor(permission.riskLevel),
                      textAlign: 'center',
                      fontSize: compactView ? '0.75rem' : '0.875rem',
                      padding: compactView ? '4px' : '16px'
                    }}
                  >
                    <Box>
                      <Typography variant="inherit" sx={{ fontSize: 'inherit', fontWeight: 'bold' }}>
                        {compactView ? permission.displayName.substring(0, 15) + '...' : permission.displayName}
                      </Typography>
                      <Typography variant="caption" sx={{ fontSize: '0.6rem', display: 'block' }}>
                        {permission.riskLevel}
                      </Typography>
                    </Box>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredRoles.map((role) => (
                <TableRow
                  key={role.id}
                  sx={{
                    '&:hover': {
                      backgroundColor: theme.palette.action.hover
                    }
                  }}
                >
                  <TableCell
                    sx={{
                      fontWeight: 'bold',
                      minWidth: 150,
                      backgroundColor: theme.palette.grey[50],
                      position: 'sticky',
                      left: 0,
                      zIndex: 1
                    }}
                  >
                    <Box>
                      <Typography variant="inherit" sx={{ fontWeight: 'bold' }}>
                        {role.displayName}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5 }}>
                        <Chip
                          label={role.type}
                          size="small"
                          variant="outlined"
                          sx={{ height: 16, fontSize: '0.6rem' }}
                        />
                        {role.isBuiltIn && (
                          <Chip
                            label="SYSTEM"
                            size="small"
                            color="warning"
                            sx={{ height: 16, fontSize: '0.6rem' }}
                          />
                        )}
                      </Box>
                    </Box>
                  </TableCell>
                  {filteredPermissions.map((permission) => {
                    const hasPermission = role.permissions.some(p => p.id === permission.id);
                    const isReadonly = role.isBuiltIn && hasPermission;
                    const isPendingChange = pendingChanges.get(role.id)?.has(permission.id);
                    const cellData = {
                      roleId: role.id,
                      permissionId: permission.id
                    };

                    return (
                      <TableCell
                        key={permission.id}
                        sx={{
                          textAlign: 'center',
                          backgroundColor: isPendingChange
                            ? theme.palette.warning.light
                            : hasPermission
                              ? getRiskLevelColor(permission.riskLevel)
                              : 'transparent',
                          padding: compactView ? '4px' : '16px',
                          minWidth: compactView ? 80 : 120,
                          cursor: editMode && !isReadonly ? 'pointer' : 'default',
                          border: isPendingChange ? `2px solid ${theme.palette.warning.main}` : '1px solid rgba(224, 224, 224, 1)'
                        }}
                        onClick={() => {
                          if (editMode && !isReadonly) {
                            togglePermission(role.id, permission.id);
                          }
                        }}
                        onContextMenu={(e) => {
                          e.preventDefault();
                          setSelectedCell(cellData);
                          setMenuAnchor(e.currentTarget);
                        }}
                      >
                        <Checkbox
                          checked={isPendingChange !== undefined ? isPendingChange : hasPermission}
                          disabled={!editMode || isReadonly}
                          size="small"
                          onChange={() => {
                            if (editMode && !isReadonly) {
                              togglePermission(role.id, permission.id);
                            }
                          }}
                          sx={{
                            color: hasPermission ? getRiskLevelTextColor(permission.riskLevel) : undefined
                          }}
                        />
                        {compactView && (
                          <Typography variant="caption" sx={{ fontSize: '0.6rem', display: 'block' }}>
                            {permission.riskLevel[0]}
                          </Typography>
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Context Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={() => {
          setMenuAnchor(null);
          setSelectedCell(null);
        }}
      >
        <MenuList>
          <MuiMenuItem onClick={() => {
            if (selectedCell) {
              togglePermission(selectedCell.roleId, selectedCell.permissionId);
            }
            setMenuAnchor(null);
          }}>
            Toggle Permission
          </MuiMenuItem>
          <MuiMenuItem onClick={() => {
            setMenuAnchor(null);
          }}>
            View Details
          </MuiMenuItem>
        </MenuList>
      </Menu>

      {/* Edit Mode Alert */}
      {editMode && (
        <Alert
          severity="info"
          sx={{ mt: 2 }}
          action={
            <Button
              color="inherit"
              size="small"
              onClick={() => setEditMode(false)}
            >
              <CloseIcon fontSize="small" />
            </Button>
          }
        >
          Edit mode enabled. Click checkboxes to modify permissions. {pendingChanges.size} changes pending.
        </Alert>
      )}
    </Box>
  );
};

export default PermissionsMatrix;