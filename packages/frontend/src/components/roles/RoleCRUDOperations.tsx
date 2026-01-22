// packages/frontend/src/components/roles/RoleCRUDOperations.tsx
'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
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
  Grid,
  Chip,
  IconButton,
  Tooltip,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  Badge,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Checkbox,
  FormHelperText,
  CircularProgress,
  Backdrop
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Security as SecurityIcon,
  Settings as SettingsIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Refresh as RefreshIcon,
  ExpandMore as ExpandMoreIcon,
  Assessment as AssessmentIcon,
  Business as BusinessIcon,
  AdminPanelSettings as AdminIcon,
  Person as PersonIcon,
  Group as GroupIcon,
  MonetizationOn as MoneyIcon,
  Assignment as AssignmentIcon,
  Lock as LockIcon,
  LockOpen as LockOpenIcon,
  Key as KeyIcon
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { format, parseISO } from 'date-fns';
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
  permissions: Record<string, Permission[]>; // Grouped by category
  assignedUsers: number;
  createdBy: string;
  createdAt: string;
  updatedAt?: string;
  hierarchyLevel?: number;
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

interface RoleFormData {
  name: string;
  displayName: string;
  description: string;
  type: 'SYSTEM' | 'BANKING' | 'CUSTOM';
  level: 'PLATFORM' | 'TENANT' | 'DEPARTMENT';
  bankingAccess: 'CONVENTIONAL' | 'SYARIAH' | 'BOTH';
  isActive: boolean;
  permissions: string[];
}

interface RoleCRUDOperationsProps {
  onRoleChange?: (role: Role) => void;
  refreshTrigger?: number;
}

const RoleCRUDOperations: React.FC<RoleCRUDOperationsProps> = ({
  onRoleChange,
  refreshTrigger = 0
}) => {
  const theme = useTheme();
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Helper function to flatten grouped permissions
  const flattenPermissions = (groupedPermissions: Record<string, Permission[]>): Permission[] => {
    return Object.values(groupedPermissions).flat();
  };

  // Dialog states
  const [crudDialog, setCrudDialog] = useState<{
    open: boolean;
    mode: 'create' | 'edit' | 'view' | 'delete';
    role: Role | null;
  }>({
    open: false,
    mode: 'create',
    role: null
  });

  // Form state
  const [formData, setFormData] = useState<RoleFormData>({
    name: '',
    displayName: '',
    description: '',
    type: 'CUSTOM',
    level: 'TENANT',
    bankingAccess: 'CONVENTIONAL',
    isActive: true,
    permissions: []
  });

  // Form validation state
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof RoleFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  // Permission selection state
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [permissionDialog, setPermissionDialog] = useState(false);

  // Validation rules
  const validationRules = {
    name: {
      required: true,
      minLength: 3,
      maxLength: 100,
      pattern: /^[A-Z_]+$/,
      message: 'Role name must be uppercase letters and underscores only'
    },
    displayName: {
      required: true,
      minLength: 3,
      maxLength: 100,
      message: 'Display name is required'
    },
    description: {
      required: false,
      maxLength: 500,
      message: 'Description must be less than 500 characters'
    },
    type: {
      required: true,
      message: 'Role type is required'
    },
    level: {
      required: true,
      message: 'Role level is required'
    },
    bankingAccess: {
      required: false,
      message: 'Banking access is required for banking roles'
    }
  };

  // Fetch data
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      console.log('🔧 Fetching roles and permissions for CRUD operations...');
      const [rolesResponse, permissionsResponse] = await Promise.all([
        api.roles.getAll({}),
        api.roles.getPermissions()
      ]);

      setRoles(rolesResponse.data || []);
      setPermissions(permissionsResponse.data || []);

      console.log(`✅ Fetched ${rolesResponse.data?.length || 0} roles and ${permissionsResponse.data?.length || 0} permissions`);

    } catch (error) {
      console.error('❌ Error fetching CRUD data:', error);
      setError('Failed to load roles and permissions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [refreshTrigger]);

  // Validate form field
  const validateField = (name: keyof RoleFormData, value: any): string | null => {
    const rule = validationRules[name];
    if (!rule) return null;

    if (rule.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
      return `${name.charAt(0).toUpperCase() + name.slice(1)} is required`;
    }

    if (rule.minLength && value.length < rule.minLength) {
      return `${name} must be at least ${rule.minLength} characters`;
    }

    if (rule.maxLength && value.length > rule.maxLength) {
      return `${name} must be less than ${rule.maxLength} characters`;
    }

    if (rule.pattern && !rule.pattern.test(value)) {
      return rule.message;
    }

    return null;
  };

  // Validate entire form
  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof RoleFormData, string>> = {};

    Object.keys(formData).forEach(key => {
      const fieldName = key as keyof RoleFormData;
      const error = validateField(fieldName, formData[fieldName]);
      if (error) {
        errors[fieldName] = error;
      }
    });

    // Special validations
    if (formData.type === 'BANKING' && !formData.bankingAccess) {
      errors.bankingAccess = 'Banking access is required for banking roles';
    }

    // Check for duplicate role name
    const duplicateRole = roles.find(
      role => role.name === formData.name && role.id !== crudDialog.role?.id
    );
    if (duplicateRole) {
      errors.name = 'Role name already exists';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form field changes
  const handleFieldChange = (field: keyof RoleFormData) => (
    event: any
  ) => {
    const value = event.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));

    // Clear error for this field when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }));
    }

    // Auto-format role name to uppercase
    if (field === 'name' && typeof value === 'string') {
      const formatted = value.toUpperCase().replace(/\s+/g, '_');
      setFormData(prev => ({ ...prev, name: formatted }));
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      displayName: '',
      description: '',
      type: 'CUSTOM',
      level: 'TENANT',
      bankingAccess: 'CONVENTIONAL',
      isActive: true,
      permissions: []
    });
    setFormErrors({});
    setSelectedPermissions([]);
    setActiveStep(0);
  };

  // Initialize form with role data for editing
  const initializeForm = (role: Role) => {
    setFormData({
      name: role.name,
      displayName: role.displayName,
      description: role.description || '',
      type: role.type,
      level: role.level,
      bankingAccess: role.bankingAccess || 'CONVENTIONAL',
      isActive: role.isActive,
      permissions: flattenPermissions(role.permissions).map(p => p.id)
    });
    setSelectedPermissions(flattenPermissions(role.permissions).map(p => p.id));
    setFormErrors({});
    setActiveStep(0);
  };

  // Open CRUD dialog
  const openCrudDialog = (mode: 'create' | 'edit' | 'view' | 'delete', role?: Role) => {
    resetForm();

    if (mode === 'edit' && role) {
      initializeForm(role);
    }

    setCrudDialog({
      open: true,
      mode,
      role: role || null
    });
  };

  // Handle permission selection
  const handlePermissionSelection = (permissionId: string) => {
    setSelectedPermissions(prev => {
      if (prev.includes(permissionId)) {
        return prev.filter(id => id !== permissionId);
      } else {
        return [...prev, permissionId];
      }
    });
  };

  // Save role
  const saveRole = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      console.log(`💾 ${crudDialog.mode === 'create' ? 'Creating' : 'Updating'} role:`, formData.name);

      let response;
      if (crudDialog.mode === 'create') {
        response = await api.roles.create(formData);
      } else if (crudDialog.mode === 'edit' && crudDialog.role) {
        response = await api.roles.update(crudDialog.role.id, formData);
      }

      setSuccess(`Role ${crudDialog.mode === 'create' ? 'created' : 'updated'} successfully`);
      onRoleChange?.(response.data);
      setCrudDialog({ open: false, mode: 'create', role: null });

      // Re-fetch data to get updated list
      await fetchData();

    } catch (error) {
      console.error(`❌ Error ${crudDialog.mode === 'create' ? 'creating' : 'updating'} role:`, error);
      setError(`Failed to ${crudDialog.mode === 'create' ? 'create' : 'update'} role`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete role
  const deleteRole = async () => {
    if (!crudDialog.role) return;

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      console.log(`🗑️ Deleting role:`, crudDialog.role.name);
      await api.roles.delete(crudDialog.role.id);

      setSuccess('Role deleted successfully');
      onRoleChange?.(roles.find(r => r.id !== crudDialog.role!.id)!);
      setCrudDialog({ open: false, mode: 'create', role: null });

      // Re-fetch data to get updated list
      await fetchData();

    } catch (error) {
      console.error('❌ Error deleting role:', error);
      setError('Failed to delete role');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get role type icon
  const getRoleTypeIcon = (type: string) => {
    switch (type) {
      case 'SYSTEM': return <AdminIcon />;
      case 'BANKING': return <BusinessIcon />;
      case 'CUSTOM': return <SettingsIcon />;
      default: return <GroupIcon />;
    }
  };

  // Get role level color
  const getRoleLevelColor = (level: string) => {
    switch (level) {
      case 'PLATFORM': return theme.palette.error.main;
      case 'TENANT': return theme.palette.warning.main;
      case 'DEPARTMENT': return theme.palette.success.main;
      default: return theme.palette.grey[500];
    }
  };

  // Stepper steps
  const steps = [
    'Basic Information',
    'Role Configuration',
    'Permissions',
    'Review & Save'
  ];

  // Render step content
  const renderStepContent = (step: number) => {
    switch (step) {
      case 0: // Basic Information
        return (
          <Grid container spacing={3}>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Role Name *"
                value={formData.name}
                onChange={handleFieldChange('name')}
                error={!!formErrors.name}
                helperText={formErrors.name}
                placeholder="ROLE_NAME"
                disabled={crudDialog.mode === 'view' || crudDialog.mode === 'delete'}
                inputProps={{ style: { textTransform: 'uppercase' } }}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Display Name *"
                value={formData.displayName}
                onChange={handleFieldChange('displayName')}
                error={!!formErrors.displayName}
                helperText={formErrors.displayName}
                placeholder="Human readable name"
                disabled={crudDialog.mode === 'view' || crudDialog.mode === 'delete'}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Description"
                value={formData.description}
                onChange={handleFieldChange('description')}
                error={!!formErrors.description}
                helperText={formErrors.description}
                placeholder="Role description and responsibilities"
                multiline
                rows={3}
                disabled={crudDialog.mode === 'view' || crudDialog.mode === 'delete'}
              />
            </Grid>
          </Grid>
        );

      case 1: // Role Configuration
        return (
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 4 }}>
              <FormControl fullWidth>
                <InputLabel>Role Type *</InputLabel>
                <Select
                  value={formData.type}
                  onChange={handleFieldChange('type')}
                  label="Role Type"
                  disabled={crudDialog.mode === 'view' || crudDialog.mode === 'delete' || crudDialog.role?.isBuiltIn}
                >
                  <MenuItem value="SYSTEM">System</MenuItem>
                  <MenuItem value="BANKING">Banking</MenuItem>
                  <MenuItem value="CUSTOM">Custom</MenuItem>
                </Select>
                {formErrors.type && (
                  <FormHelperText error>{formErrors.type}</FormHelperText>
                )}
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <FormControl fullWidth>
                <InputLabel>Role Level *</InputLabel>
                <Select
                  value={formData.level}
                  onChange={handleFieldChange('level')}
                  label="Role Level"
                  disabled={crudDialog.mode === 'view' || crudDialog.mode === 'delete' || crudDialog.role?.isBuiltIn}
                >
                  <MenuItem value="PLATFORM">Platform</MenuItem>
                  <MenuItem value="TENANT">Tenant</MenuItem>
                  <MenuItem value="DEPARTMENT">Department</MenuItem>
                </Select>
                {formErrors.level && (
                  <FormHelperText error>{formErrors.level}</FormHelperText>
                )}
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <FormControl fullWidth>
                <InputLabel>Banking Access</InputLabel>
                <Select
                  value={formData.bankingAccess}
                  onChange={handleFieldChange('bankingAccess')}
                  label="Banking Access"
                  disabled={crudDialog.mode === 'view' || crudDialog.mode === 'delete'}
                >
                  <MenuItem value="CONVENTIONAL">Conventional</MenuItem>
                  <MenuItem value="SYARIAH">Syariah</MenuItem>
                  <MenuItem value="BOTH">Both</MenuItem>
                </Select>
                {formErrors.bankingAccess && (
                  <FormHelperText error>{formErrors.bankingAccess}</FormHelperText>
                )}
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isActive}
                    onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                    disabled={crudDialog.mode === 'view' || crudDialog.mode === 'delete'}
                  />
                }
                label="Active Role"
              />
            </Grid>

            {formData.type === 'BANKING' && (
              <Alert severity="info" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  Banking roles have access to financial modules and may require additional approvals.
                </Typography>
              </Alert>
            )}
          </Grid>
        );

      case 2: // Permissions
        return (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Select Permissions</Typography>
              <Button
                variant="outlined"
                startIcon={<SettingsIcon />}
                onClick={() => setPermissionDialog(true)}
              >
                Manage Permissions
              </Button>
            </Box>

            <Alert severity="info" sx={{ mb: 2 }}>
              <Typography variant="body2">
                Selected: {selectedPermissions.length} permissions
              </Typography>
            </Alert>

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>Permission Categories</Typography>
              </AccordionSummary>
              <AccordionDetails>
                {['CORE', 'BANKING', 'IFRS9', 'REPORTING', 'ADMIN'].map(category => (
                  <Accordion key={category}>
                    <AccordionSummary>
                      <Typography variant="subtitle1">{category.replace('_', ' ')}</Typography>
                      <Chip
                        label={permissions.filter(p => p.category === category).length}
                        size="small"
                        sx={{ ml: 2 }}
                      />
                    </AccordionSummary>
                    <AccordionDetails>
                      <List dense>
                        {permissions
                          .filter(p => p.category === category)
                          .map((permission) => (
                            <ListItem key={permission.id} sx={{ py: 0.5 }}>
                              <ListItemIcon>
                                <Checkbox
                                  checked={selectedPermissions.includes(permission.id)}
                                  onChange={() => handlePermissionSelection(permission.id)}
                                  disabled={crudDialog.mode === 'view' || crudDialog.mode === 'delete'}
                                />
                              </ListItemIcon>
                              <ListItemText
                                primary={permission.displayName}
                                secondary={
                                  <Box>
                                    <Typography variant="caption" display="block">
                                      {permission.description}
                                    </Typography>
                                    <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5 }}>
                                      <Chip
                                        label={permission.riskLevel}
                                        size="small"
                                        color={permission.riskLevel === 'CRITICAL' ? 'error' : permission.riskLevel === 'HIGH' ? 'warning' : 'default'}
                                        variant="outlined"
                                      />
                                      {permission.requiresApproval && (
                                        <Chip label="Approval Required" size="small" color="warning" />
                                      )}
                                    </Box>
                                  </Box>
                                }
                              />
                            </ListItem>
                          ))}
                      </List>
                    </AccordionDetails>
                  </Accordion>
                ))}
              </AccordionDetails>
            </Accordion>
          </Box>
        );

      case 3: // Review & Save
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Review Role Configuration
            </Typography>

            <Paper sx={{ p: 3, mb: 2 }}>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="subtitle2">Basic Information</Typography>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="body2">
                    <strong>Name:</strong> {formData.name}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Display Name:</strong> {formData.displayName}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Type:</strong> {formData.type}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Level:</strong> {formData.level}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Status:</strong> {formData.isActive ? 'Active' : 'Inactive'}
                  </Typography>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="subtitle2">Configuration</Typography>
                  <Divider sx={{ my: 1 }} />
                  {formData.bankingAccess && (
                    <Typography variant="body2">
                      <strong>Banking Access:</strong> {formData.bankingAccess}
                    </Typography>
                  )}
                  <Typography variant="body2">
                    <strong>Permissions:</strong> {selectedPermissions.length} selected
                  </Typography>
                </Grid>
              </Grid>

              {formData.description && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2">Description</Typography>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="body2">{formData.description}</Typography>
                </Box>
              )}
            </Paper>

            {crudDialog.mode === 'create' && (
              <Alert severity="success" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  Click "Create Role" to create this new role with the selected permissions.
                </Typography>
              </Alert>
            )}

            {crudDialog.mode === 'edit' && (
              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  Review the changes before updating the role.
                </Typography>
              </Alert>
            )}
          </Box>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Typography>Loading roles data...</Typography>
          <LinearProgress sx={{ mt: 2 }} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SecurityIcon color="primary" />
          Role CRUD Operations
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => openCrudDialog('create')}
        >
          Create Role
        </Button>
      </Box>

      {/* Success/Error Messages */}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* CRUD Dialog */}
      <Dialog
        open={crudDialog.open}
        onClose={() => setCrudDialog({ open: false, mode: 'create', role: null })}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {getRoleTypeIcon(crudDialog.mode === 'create' ? 'CUSTOM' : crudDialog.role?.type || 'CUSTOM')}
            {crudDialog.mode === 'create' && 'Create New Role'}
            {crudDialog.mode === 'edit' && 'Edit Role'}
            {crudDialog.mode === 'view' && 'Role Details'}
            {crudDialog.mode === 'delete' && 'Delete Role'}
          </Box>
        </DialogTitle>

        <DialogContent>
          {crudDialog.mode === 'delete' ? (
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <WarningIcon sx={{ fontSize: 64, color: 'warning.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Confirm Role Deletion
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Are you sure you want to delete the role "{crudDialog.role?.displayName}"? This action cannot be undone.
              </Typography>
              {(crudDialog.role?.assignedUsers || 0) > 0 && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  This role has {crudDialog.role?.assignedUsers} assigned user(s). Please reassign users before deleting.
                </Alert>
              )}
            </Box>
          ) : (
            <>
              <Stepper activeStep={activeStep} orientation="vertical">
                {steps.map((label, index) => (
                  <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                    <StepContent>
                      {renderStepContent(index)}
                    </StepContent>
                  </Step>
                ))}
              </Stepper>

              {/* Navigation */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                <Button
                  disabled={activeStep === 0}
                  onClick={() => setActiveStep(prev => Math.max(0, prev - 1))}
                >
                  Previous
                </Button>
                <Button
                  variant="contained"
                  disabled={activeStep === steps.length - 1}
                  onClick={() => {
                    if (activeStep === steps.length - 1) {
                      saveRole();
                    } else {
                      setActiveStep(prev => Math.min(steps.length - 1, prev + 1));
                    }
                  }}
                >
                  {activeStep === steps.length - 1 ? (crudDialog.mode === 'create' ? 'Create' : 'Save') : 'Next'}
                </Button>
              </Box>
            </>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setCrudDialog({ open: false, mode: 'create', role: null })}>
            {crudDialog.mode === 'view' ? 'Close' : 'Cancel'}
          </Button>
          {crudDialog.mode !== 'view' && crudDialog.mode !== 'delete' && (
            <Button
              variant="contained"
              color="primary"
              onClick={saveRole}
              disabled={isSubmitting || !validateForm()}
              startIcon={isSubmitting ? <CircularProgress size={20} /> : <SaveIcon />}
            >
              {isSubmitting ? 'Saving...' : (crudDialog.mode === 'create' ? 'Create Role' : 'Update Role')}
            </Button>
          )}
          {crudDialog.mode === 'delete' && (
            <Button
              variant="contained"
              color="error"
              onClick={deleteRole}
              disabled={isSubmitting || (crudDialog.role?.assignedUsers ?? 0) > 0}
              startIcon={isSubmitting ? <CircularProgress size={20} /> : <DeleteIcon />}
            >
              {isSubmitting ? 'Deleting...' : 'Delete Role'}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Permission Selection Dialog */}
      <Dialog
        open={permissionDialog}
        onClose={() => setPermissionDialog(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>Select Permissions</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Select the permissions that this role should have access to.
          </Typography>
          {/* Permission selection UI would go here */}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPermissionDialog(false)}>
            Done
          </Button>
        </DialogActions>
      </Dialog>

      {/* Loading Overlay */}
      <Backdrop
        open={isSubmitting}
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.tooltip + 1 }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
          <CircularProgress color="inherit" />
          <Typography variant="h6" sx={{ mt: 2 }}>
            {isSubmitting ? 'Processing...' : 'Loading...'}
          </Typography>
        </Box>
      </Backdrop>
    </Box>
  );
};

export default RoleCRUDOperations;