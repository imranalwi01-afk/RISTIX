'use client';

import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Divider from '@mui/material/Divider';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { getPermissionCanonicalKey } from '@/components/maintenance/access-management.utils';
import type { Permission, PermissionGroupingMode, PermissionSelectionGroup, Role } from './access-management.types';

interface PermissionDialogState {
  open: boolean;
  role: Role | null;
  selectedPermissions: string[];
}

interface AccessPermissionDialogProps {
  permissionDialog: PermissionDialogState;
  permissionSearch: string;
  permissionGroupingMode: PermissionGroupingMode;
  permissionSelectionGroups: PermissionSelectionGroup[];
  permissions: Permission[];
  onClose: () => void;
  onSave: () => void;
  onPermissionSearchChange: (value: string) => void;
  onPermissionGroupingModeChange: (mode: PermissionGroupingMode) => void;
  onPermissionDialogChange: (dialog: PermissionDialogState) => void;
  getPermissionSections: (permissions: Permission[]) => Array<{ key: string; label: string; hint: string; permissions: Permission[] }>;
}

const getRiskLevelColor = (risk: string) => {
  switch (risk) {
    case 'LOW': return 'success';
    case 'MEDIUM': return 'warning';
    case 'HIGH': return 'error';
    case 'CRITICAL': return 'error';
    default: return 'default';
  }
};

export const AccessPermissionDialog: React.FC<AccessPermissionDialogProps> = ({
  permissionDialog,
  permissionSearch,
  permissionGroupingMode,
  permissionSelectionGroups,
  permissions,
  onClose,
  onSave,
  onPermissionSearchChange,
  onPermissionGroupingModeChange,
  onPermissionDialogChange,
  getPermissionSections,
}) => (
  <Dialog
    open={permissionDialog.open}
    onClose={onClose}
    maxWidth="xl"
    fullWidth
    PaperProps={{
      sx: { minHeight: '80vh' }
    }}
  >
    <DialogTitle>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h6" component="div">
            Manage Permissions: {permissionDialog.role?.displayName}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {permissionDialog.role?.type} • {permissionDialog.role?.level} Level
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Chip
            label={`${permissionDialog.selectedPermissions.length}/${permissions.length} Selected`}
            color={permissionDialog.selectedPermissions.length === permissions.length ? 'success' : 'default'}
            size="small"
          />
        </Box>
      </Box>
    </DialogTitle>
    <DialogContent>
      <Box sx={{ mt: 2 }}>
        {/* Search */}
        <TextField
          fullWidth
          size="small"
          placeholder="Search permissions..."
          value={permissionSearch}
          onChange={(e) => onPermissionSearchChange(e.target.value)}
          InputProps={{
            startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>,
          }}
          sx={{ mb: 2 }}
        />
        {/* Category Selection Controls */}
        <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={permissionSelectionGroups.every(group =>
                  group.permissions.every(p => permissionDialog.selectedPermissions.includes(p.id))
                )}
                indeterminate={permissionSelectionGroups.some(group =>
                  group.permissions.some(p => permissionDialog.selectedPermissions.includes(p.id)) &&
                  !group.permissions.every(p => permissionDialog.selectedPermissions.includes(p.id))
                )}
                onChange={(e) => {
                  if (e.target.checked) {
                    const allPermissionIds = permissionSelectionGroups.flatMap(group => group.permissions.map(p => p.id));
                    onPermissionDialogChange({
                      ...permissionDialog,
                      selectedPermissions: [...new Set([...permissionDialog.selectedPermissions, ...allPermissionIds])]
                    });
                  } else {
                    onPermissionDialogChange({
                      ...permissionDialog,
                      selectedPermissions: []
                    });
                  }
                }}
              />
            }
            label={<Typography variant="subtitle1" fontWeight="bold">Select All Permissions</Typography>}
          />
          <FormControl size="small" sx={{ minWidth: 250 }}>
            <InputLabel>Group Permissions By</InputLabel>
            <Select
              value={permissionGroupingMode}
              onChange={(e) => onPermissionGroupingModeChange(e.target.value as PermissionGroupingMode)}
              label="Group Permissions By"
            >
              <MenuItem value="resource">Menu (Recommended)</MenuItem>
              <MenuItem value="module">Module</MenuItem>
              <MenuItem value="category">Legacy Category</MenuItem>
            </Select>
          </FormControl>
          <Typography variant="body2" color="text.secondary">
            {permissionDialog.selectedPermissions.length} of {permissions.length} permissions selected
          </Typography>
        </Box>

        {/* Permission Groups */}
        {permissionSelectionGroups
          .map((group) => {
            const filtered = permissionSearch
              ? group.permissions.filter(p =>
                  (p.displayName || '').toLowerCase().includes(permissionSearch.toLowerCase()) ||
                  (p.code || '').toLowerCase().includes(permissionSearch.toLowerCase()) ||
                  (p.description || '').toLowerCase().includes(permissionSearch.toLowerCase())
                )
              : group.permissions;
            return { ...group, permissions: filtered };
          })
          .filter((group) => group.permissions.length > 0)
          .map((group) => {
          const groupPermissions = group.permissions;
          const selectedInGroup = groupPermissions.filter(p => permissionDialog.selectedPermissions.includes(p.id)).length;
          const isGroupFullySelected = selectedInGroup === groupPermissions.length;
          const isGroupPartiallySelected = selectedInGroup > 0 && selectedInGroup < groupPermissions.length;

          return (
            <Accordion key={group.key} defaultExpanded>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={isGroupFullySelected}
                        indeterminate={isGroupPartiallySelected}
                        onChange={(e) => {
                          e.stopPropagation();
                          const groupPermissionIds = groupPermissions.map(p => p.id);
                          if (e.target.checked) {
                            onPermissionDialogChange({
                              ...permissionDialog,
                              selectedPermissions: [...new Set([...permissionDialog.selectedPermissions, ...groupPermissionIds])]
                            });
                          } else {
                            onPermissionDialogChange({
                              ...permissionDialog,
                              selectedPermissions: permissionDialog.selectedPermissions.filter(id => !groupPermissionIds.includes(id))
                            });
                          }
                        }}
                        onClick={(e) => e.stopPropagation()}
                      />
                    }
                    label={
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        {group.label}
                      </Typography>
                    }
                    sx={{ flex: 1 }}
                  />
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip
                      label={`${selectedInGroup}/${groupPermissions.length}`}
                      size="small"
                      color={isGroupFullySelected ? 'success' : selectedInGroup > 0 ? 'warning' : 'default'}
                      variant="outlined"
                    />
                    <Typography variant="body2" color="text.secondary">
                      {group.hint}
                    </Typography>
                  </Box>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                {getPermissionSections(group.permissions).map((section) => (
                  <Box key={section.key} sx={{ mb: 2 }}>
                    {group.key !== section.key && (
                      <Box sx={{ mb: 1 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                          {section.label}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {section.hint}
                        </Typography>
                      </Box>
                    )}
                    <Grid container spacing={1}>
                      {section.permissions.map((permission) => (
                        <Grid size={{ xs: 12, sm: 6, md: 4 }} key={permission.id}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                size="small"
                                checked={permissionDialog.selectedPermissions.includes(permission.id)}
                                onChange={(e) => {
                                  const selected = permissionDialog.selectedPermissions;
                                  if (e.target.checked) {
                                    onPermissionDialogChange({
                                      ...permissionDialog,
                                      selectedPermissions: [...selected, permission.id]
                                    });
                                  } else {
                                    onPermissionDialogChange({
                                      ...permissionDialog,
                                      selectedPermissions: selected.filter(id => id !== permission.id)
                                    });
                                  }
                                }}
                              />
                            }
                            label={
                              <Box sx={{ minWidth: 0 }}>
                                <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                                  {permission.displayName}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                  {getPermissionCanonicalKey(permission)}
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5 }}>
                                  <Chip
                                    label={permission.riskLevel}
                                    size="small"
                                    color={getRiskLevelColor(permission.riskLevel) as any}
                                    variant="outlined"
                                  />
                                  {permission.requiresApproval && (
                                    <Chip label="Approval" size="small" color="warning" variant="filled" />
                                  )}

                                </Box>
                              </Box>
                            }
                          />
                        </Grid>
                      ))}
                    </Grid>
                    {group.key !== section.key && <Divider sx={{ mt: 1.5 }} />}
                  </Box>
                ))}
              </AccordionDetails>
            </Accordion>
          );
        })}
      </Box>
    </DialogContent>
    <DialogActions>
      <Box sx={{ display: 'flex', gap: 1, flex: 1 }}>
        <Button
          variant="outlined"
          size="small"
          onClick={() => {
            const criticalPermissions = permissions.filter(p => p.riskLevel === 'CRITICAL').map(p => p.id);
            onPermissionDialogChange({
              ...permissionDialog,
              selectedPermissions: [...new Set([...permissionDialog.selectedPermissions, ...criticalPermissions])]
            });
          }}
        >
          + Critical
        </Button>
        <Button
          variant="outlined"
          size="small"
          onClick={() => {
            const approvalPermissions = permissions.filter(p => p.requiresApproval).map(p => p.id);
            onPermissionDialogChange({
              ...permissionDialog,
              selectedPermissions: [...new Set([...permissionDialog.selectedPermissions, ...approvalPermissions])]
            });
          }}
        >
          + Approval Required
        </Button>
        <Button
          variant="outlined"
          size="small"
          color="error"
          onClick={() => {
            onPermissionDialogChange({
              ...permissionDialog,
              selectedPermissions: []
            });
          }}
        >
          Clear All
        </Button>
      </Box>
      <Button onClick={onClose}>
        Cancel
      </Button>
      <Button
        variant="contained"
        onClick={onSave}
        disabled={permissionDialog.selectedPermissions.length === 0}
      >
        Save {permissionDialog.selectedPermissions.length} Permission{permissionDialog.selectedPermissions.length !== 1 ? 's' : ''}
      </Button>
    </DialogActions>
  </Dialog>
);
