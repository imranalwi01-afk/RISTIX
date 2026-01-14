// packages/frontend/src/components/roles/RoleHierarchyVisualization.tsx
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Badge,
  LinearProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Paper,
  Divider,
  Grid,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  AccountTree as TreeIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Security as PermissionIcon,
  People as UsersIcon,
  ExpandMore as ExpandMoreIcon,
  Group as GroupIcon,
  AdminPanelSettings as AdminIcon,
  Business as BusinessIcon,
  Person as PersonIcon,
  Assessment as ReportIcon,
  Settings as SettingsIcon,
  FilterList as FilterIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  Refresh as RefreshIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { api } from '@/services/api';

// Types
interface Role {
  id: string;
  name: string;
  displayName: string;
  description: string;
  type: 'SYSTEM' | 'BANKING' | 'CUSTOM';
  level: 'PLATFORM' | 'TENANT' | 'DEPARTMENT';
  bankingAccess?: 'CONVENTIONAL' | 'SYARIAH' | 'BOTH';
  isActive: boolean;
  isBuiltIn: boolean;
  permissions: Permission[];
  assignedUsers: number;
  createdBy: string;
  createdAt: string;
  updatedAt?: string;
  parentRoleId?: string;
  childRoleIds?: string[];
  hierarchyLevel: number;
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
  bankingSpecific: boolean;
  syariahRequired?: boolean;
}

interface User {
  id: string;
  email: string;
  fullName: string;
  roleAssignments: Array<{
    roleId: string;
    roleName: string;
    assignedAt: string;
    isActive: boolean;
  }>;
}

interface HierarchyNode {
  role: Role;
  children: HierarchyNode[];
  level: number;
  expanded: boolean;
}

interface RoleHierarchyVisualizationProps {
  onRoleSelect?: (role: Role) => void;
  onRoleEdit?: (role: Role) => void;
  onRoleView?: (role: Role) => void;
  onPermissionManage?: (role: Role) => void;
  refreshTrigger?: number;
}

const RoleHierarchyVisualization: React.FC<RoleHierarchyVisualizationProps> = ({
  onRoleSelect,
  onRoleEdit,
  onRoleView,
  onPermissionManage,
  refreshTrigger = 0
}) => {
  const theme = useTheme();
  const [roles, setRoles] = useState<Role[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hierarchyView, setHierarchyView] = useState(true);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterLevel, setFilterLevel] = useState<string>('all');
  const [showInactive, setShowInactive] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [roleDetailsOpen, setRoleDetailsOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);

  // Fetch roles and users data
  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('🔒 Fetching roles and users for hierarchy visualization...');
      const [rolesResponse, usersResponse] = await Promise.all([
        api.roles.getAll({}),
        api.users.getAll({})
      ]);

      setRoles(rolesResponse.data || []);
      setUsers(usersResponse.data || []);
      console.log(`✅ Fetched ${rolesResponse.data?.length || 0} roles and ${usersResponse.data?.length || 0} users`);

    } catch (error) {
      console.error('❌ Error fetching hierarchy data:', error);
      setError('Failed to load role hierarchy data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [refreshTrigger]);

  // Build role hierarchy tree
  const buildHierarchy = useMemo(() => {
    const nodeMap = new Map<string, HierarchyNode>();
    const rootNodes: HierarchyNode[] = [];

    // Create node map
    roles.forEach(role => {
      let level = 0;
      if (role.level === 'TENANT') level = 1;
      if (role.level === 'DEPARTMENT') level = 2;

      nodeMap.set(role.id, {
        role,
        children: [],
        level,
        expanded: true
      });
    });

    // Build parent-child relationships
    roles.forEach(role => {
      const node = nodeMap.get(role.id);
      if (!node) return;

      // Determine parent based on role level and type
      let parentId: string | undefined;

      if (role.level === 'DEPARTMENT') {
        const parentRole = roles.find(
          r => r.level === 'TENANT' && r.type === role.type
        );
        parentId = parentRole?.id;
      } else if (role.level === 'TENANT') {
        const parentRole = roles.find(
          r => r.level === 'PLATFORM' && r.type === role.type
        );
        parentId = parentRole?.id;
      }

      if (parentId && nodeMap.has(parentId)) {
        const parentNode = nodeMap.get(parentId)!;
        parentNode.children.push(node);
      } else {
        // Add to root nodes if no parent found (typically PLATFORM roles or orphans)
        // Only add if it's effectively a root in this view
        if (role.level === 'PLATFORM' || !parentId) {
          rootNodes.push(node);
        }
      }
    });

    // Sort children by hierarchy level and name -- recursive sort not needed if we insert sorted? 
    // But helpful for display
    const sortNodes = (nodes: HierarchyNode[]): HierarchyNode[] => {
      return nodes.sort((a, b) => {
        // Sort by level then name
        if (a.level !== b.level) return a.level - b.level;
        return a.role.displayName.localeCompare(b.role.displayName);
      }).map(node => ({
        ...node,
        children: sortNodes(node.children)
      }));
    };

    return sortNodes(rootNodes);
  }, [roles]);

  // Filter roles
  const filteredRoles = useMemo(() => {
    return roles.filter(role => {
      if (!showInactive && !role.isActive) return false;
      if (filterType !== 'all' && role.type !== filterType) return false;
      if (filterLevel !== 'all' && role.level !== filterLevel) return false;
      return true;
    });
  }, [roles, filterType, filterLevel, showInactive]);

  // Get role statistics
  const getRoleStats = () => {
    const totalRoles = filteredRoles.length;
    const activeRoles = filteredRoles.filter(r => r.isActive).length;
    const systemRoles = filteredRoles.filter(r => r.type === 'SYSTEM').length;
    const bankingRoles = filteredRoles.filter(r => r.type === 'BANKING').length;
    const customRoles = filteredRoles.filter(r => r.type === 'CUSTOM').length;
    const totalUsers = filteredRoles.reduce((sum, role) => sum + role.assignedUsers, 0);

    return {
      total: totalRoles,
      active: activeRoles,
      inactive: totalRoles - activeRoles,
      system: systemRoles,
      banking: bankingRoles,
      custom: customRoles,
      users: totalUsers
    };
  };

  // Get role type color
  const getRoleTypeColor = (type: string) => {
    switch (type) {
      case 'SYSTEM': return theme.palette.error.main;
      case 'BANKING': return theme.palette.primary.main;
      case 'CUSTOM': return theme.palette.secondary.main;
      default: return theme.palette.grey[500];
    }
  };

  // Get role level color
  const getRoleLevelColor = (level: string) => {
    switch (level) {
      case 'PLATFORM': return theme.palette.error.dark;
      case 'TENANT': return theme.palette.warning.main;
      case 'DEPARTMENT': return theme.palette.success.main;
      default: return theme.palette.grey[500];
    }
  };

  // Render hierarchy tree node
  const renderHierarchyNode = (node: HierarchyNode, depth: number = 0) => {
    const { role, children, expanded } = node;
    const hasChildren = children.length > 0;
    const userCount = role.assignedUsers;

    return (
      <Box key={role.id} sx={{ ml: depth * 3 }}>
        <Card
          sx={{
            mb: 1,
            border: `2px solid ${getRoleTypeColor(role.type)}20`,
            backgroundColor: role.isActive ? 'background.paper' : 'grey.50',
            cursor: 'pointer',
            transform: `scale(${zoomLevel})`,
            transformOrigin: 'left center',
            transition: 'all 0.2s ease',
            '&:hover': {
              boxShadow: 3,
              transform: `scale(${zoomLevel * 1.02})`
            }
          }}
          onClick={() => {
            setSelectedRole(role);
            if (hasChildren) {
              node.expanded = !expanded;
              setHierarchyView(!hierarchyView); // Force re-render
            }
          }}
        >
          <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs="auto">
                {hasChildren && (
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      node.expanded = !expanded;
                      setHierarchyView(!hierarchyView);
                    }}
                  >
                    <ExpandMoreIcon
                      sx={{
                        transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.2s ease'
                      }}
                    />
                  </IconButton>
                )}
                <Box
                  sx={{
                    width: 16,
                    height: 16,
                    borderRadius: '50%',
                    backgroundColor: getRoleLevelColor(role.level),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    ml: 1
                  }}
                />
              </Grid>

              <Grid item xs>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: getRoleTypeColor(role.type) }}>
                    {role.displayName}
                  </Typography>
                  <Chip
                    label={role.type}
                    size="small"
                    sx={{
                      backgroundColor: getRoleTypeColor(role.type) + '20',
                      color: getRoleTypeColor(role.type),
                      fontWeight: 'bold'
                    }}
                  />
                  <Chip
                    label={role.level}
                    size="small"
                    sx={{
                      backgroundColor: getRoleLevelColor(role.level) + '20',
                      color: getRoleLevelColor(role.level),
                      fontWeight: 'bold'
                    }}
                  />
                  {!role.isActive && (
                    <Chip label="INACTIVE" size="small" color="error" />
                  )}
                  {role.isBuiltIn && (
                    <Chip label="SYSTEM" size="small" color="warning" />
                  )}
                </Box>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {role.description || 'No description available'}
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Badge badgeContent={userCount} color="primary" showZero>
                    <UsersIcon fontSize="small" color="action" />
                  </Badge>
                  <Typography variant="caption" color="text.secondary">
                    {userCount} user{userCount !== 1 ? 's' : ''}
                  </Typography>

                  <Badge badgeContent={role.permissions.length} color="secondary" showZero>
                    <PermissionIcon fontSize="small" color="action" />
                  </Badge>
                  <Typography variant="caption" color="text.secondary">
                    {role.permissions.length} permission{role.permissions.length !== 1 ? 's' : ''}
                  </Typography>

                  {role.bankingAccess && (
                    <Chip
                      label={role.bankingAccess}
                      size="small"
                      variant="outlined"
                      color="info"
                    />
                  )}
                </Box>
              </Grid>

              <Grid item xs="auto">
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  <Tooltip title="View Details">
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRoleView?.(role);
                      }}
                    >
                      <ViewIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>

                  {!role.isBuiltIn && (
                    <Tooltip title="Edit Role">
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          onRoleEdit?.(role);
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}

                  <Tooltip title="Manage Permissions">
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        onPermissionManage?.(role);
                      }}
                    >
                      <PermissionIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {expanded && hasChildren && (
          <Box sx={{ mt: 1 }}>
            {children.map(child => renderHierarchyNode(child, depth + 1))}
          </Box>
        )}
      </Box>
    );
  };

  const stats = getRoleStats();

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Typography>Loading role hierarchy...</Typography>
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
          <TreeIcon color="primary" />
          Role Hierarchy Visualization
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton onClick={() => setZoomLevel(prev => Math.min(prev + 0.1, 1.5))}>
            <ZoomInIcon />
          </IconButton>
          <IconButton onClick={() => setZoomLevel(prev => Math.max(prev - 0.1, 0.7))}>
            <ZoomOutIcon />
          </IconButton>
          <IconButton onClick={fetchData}>
            <RefreshIcon />
          </IconButton>
        </Box>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={2}>
          <Paper sx={{ p: 2, textAlign: 'center', borderLeft: `4px solid ${theme.palette.primary.main}` }}>
            <Typography variant="h4" color="primary">{stats.total}</Typography>
            <Typography variant="body2" color="text.secondary">Total Roles</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Paper sx={{ p: 2, textAlign: 'center', borderLeft: `4px solid ${theme.palette.success.main}` }}>
            <Typography variant="h4" color="success.main">{stats.active}</Typography>
            <Typography variant="body2" color="text.secondary">Active Roles</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Paper sx={{ p: 2, textAlign: 'center', borderLeft: `4px solid ${theme.palette.error.main}` }}>
            <Typography variant="h4" color="error.main">{stats.system}</Typography>
            <Typography variant="body2" color="text.secondary">System Roles</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Paper sx={{ p: 2, textAlign: 'center', borderLeft: `4px solid ${theme.palette.primary.main}` }}>
            <Typography variant="h4" color="primary">{stats.banking}</Typography>
            <Typography variant="body2" color="text.secondary">Banking Roles</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Paper sx={{ p: 2, textAlign: 'center', borderLeft: `4px solid ${theme.palette.secondary.main}` }}>
            <Typography variant="h4" color="secondary.main">{stats.custom}</Typography>
            <Typography variant="body2" color="text.secondary">Custom Roles</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Paper sx={{ p: 2, textAlign: 'center', borderLeft: `4px solid ${theme.palette.info.main}` }}>
            <Typography variant="h4" color="info.main">{stats.users}</Typography>
            <Typography variant="body2" color="text.secondary">Total Users</Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          <FilterIcon color="action" />
          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Filters:</Typography>

          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Type</InputLabel>
            <Select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              label="Type"
            >
              <MenuItem value="all">All Types</MenuItem>
              <MenuItem value="SYSTEM">System</MenuItem>
              <MenuItem value="BANKING">Banking</MenuItem>
              <MenuItem value="CUSTOM">Custom</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Level</InputLabel>
            <Select
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value)}
              label="Level"
            >
              <MenuItem value="all">All Levels</MenuItem>
              <MenuItem value="PLATFORM">Platform</MenuItem>
              <MenuItem value="TENANT">Tenant</MenuItem>
              <MenuItem value="DEPARTMENT">Department</MenuItem>
            </Select>
          </FormControl>

          <FormControlLabel
            control={
              <Switch
                checked={showInactive}
                onChange={(e) => setShowInactive(e.target.checked)}
                size="small"
              />
            }
            label="Show Inactive"
          />
        </Box>
      </Paper>

      {/* Hierarchy Tree */}
      <Paper sx={{ p: 2, minHeight: 400 }}>
        <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <TreeIcon />
          Role Hierarchy Tree
          <Chip label={`${filteredRoles.length} roles`} size="small" />
        </Typography>

        {filteredRoles.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <InfoIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              No roles found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Try adjusting the filters or create new roles.
            </Typography>
          </Box>
        ) : (
          <Box sx={{ overflow: 'auto' }}>
            {buildHierarchy.map(node => renderHierarchyNode(node))}
          </Box>
        )}
      </Paper>

      {/* Role Details Dialog */}
      <Dialog
        open={roleDetailsOpen}
        onClose={() => setRoleDetailsOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Role Details: {selectedRole?.displayName}
        </DialogTitle>
        <DialogContent>
          {selectedRole && (
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Basic Information
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemText
                    primary="Role Name"
                    secondary={selectedRole.name}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Type"
                    secondary={selectedRole.type}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Level"
                    secondary={selectedRole.level}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Banking Access"
                    secondary={selectedRole.bankingAccess || 'N/A'}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Assigned Users"
                    secondary={selectedRole.assignedUsers}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Permissions"
                    secondary={selectedRole.permissions.length}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Status"
                    secondary={selectedRole.isActive ? 'Active' : 'Inactive'}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Created"
                    secondary={new Date(selectedRole.createdAt).toLocaleString()}
                  />
                </ListItem>
              </List>

              {selectedRole.permissions.length > 0 && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle1" gutterBottom>
                    Permissions ({selectedRole.permissions.length})
                  </Typography>
                  <List dense>
                    {selectedRole.permissions.map((permission) => (
                      <ListItem key={permission.id}>
                        <ListItemText
                          primary={permission.displayName}
                          secondary={`${permission.category} - ${permission.riskLevel}`}
                        />
                      </ListItem>
                    ))}
                  </List>
                </>
              )}
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default RoleHierarchyVisualization;