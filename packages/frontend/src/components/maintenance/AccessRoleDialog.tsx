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
import Switch from '@mui/material/Switch';
import Checkbox from '@mui/material/Checkbox';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import type { Role, PermissionSelectionGroup } from './access-management.types';

interface RoleFormState {
  name: string;
  displayName: string;
  description: string;
  type: 'SYSTEM' | 'BANKING' | 'CUSTOM';
  level: 'PLATFORM' | 'TENANT' | 'DEPARTMENT';
  isActive: boolean;
  selectedPermissions: string[];
}

interface RoleDialogState {
  open: boolean;
  mode: 'create' | 'edit' | 'view';
  role: Role | null;
}

interface AccessRoleDialogProps {
  roleDialog: RoleDialogState;
  roleForm: RoleFormState;
  roleFormStep: number;
  permissionSelectionGroups: PermissionSelectionGroup[];
  onClose: () => void;
  onSave: () => void;
  onRoleFormChange: (form: RoleFormState) => void;
  onRoleFormStepChange: (step: number) => void;
}

export const AccessRoleDialog: React.FC<AccessRoleDialogProps> = ({
  roleDialog,
  roleForm,
  roleFormStep,
  permissionSelectionGroups,
  onClose,
  onSave,
  onRoleFormChange,
  onRoleFormStepChange,
}) => (
  <Dialog
    open={roleDialog.open}
    onClose={onClose}
    maxWidth={roleFormStep === 0 ? "md" : "xl"}
    fullWidth
  >
    <DialogTitle>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {roleDialog.mode === 'create' && 'Create New Role'}
        {roleDialog.mode === 'edit' && 'Edit Role'}
        {roleDialog.mode === 'view' && 'Role Details'}
        <Chip label={roleFormStep === 0 ? 'Basic Info' : 'Permissions'} size="small" color="primary" variant="outlined" sx={{ ml: 'auto' }} />
      </Box>
    </DialogTitle>
    <Stepper activeStep={roleFormStep} sx={{ px: 3, pt: 1, pb: 2 }}>
      <Step><StepLabel>Basic Information</StepLabel></Step>
      <Step><StepLabel>Permissions</StepLabel></Step>
    </Stepper>
    <DialogContent>
      {roleFormStep === 0 && (
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Role Name (System)"
              value={roleForm.name}
              onChange={(e) => onRoleFormChange({ ...roleForm, name: e.target.value.toUpperCase() })}
              disabled={roleDialog.mode === 'view' || (roleDialog.role?.isBuiltIn)}
              placeholder="ROLE_NAME"
              inputProps={{ 'data-testid': 'access-management-role-name' }}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Display Name"
              value={roleForm.displayName}
              onChange={(e) => onRoleFormChange({ ...roleForm, displayName: e.target.value })}
              disabled={roleDialog.mode === 'view'}
              placeholder="Human readable name"
              inputProps={{ 'data-testid': 'access-management-role-display-name' }}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              label="Description"
              value={roleForm.description}
              onChange={(e) => onRoleFormChange({ ...roleForm, description: e.target.value })}
              disabled={roleDialog.mode === 'view'}
              multiline
              rows={3}
              placeholder="Role description and responsibilities"
              inputProps={{ 'data-testid': 'access-management-role-description' }}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <FormControl fullWidth disabled={roleDialog.mode === 'view'}>
              <InputLabel>Type</InputLabel>
              <Select
                value={roleForm.type}
                onChange={(e) => onRoleFormChange({ ...roleForm, type: e.target.value as any })}
                label="Type"
              >
                <MenuItem value="SYSTEM">System</MenuItem>
                <MenuItem value="BANKING">Banking</MenuItem>
                <MenuItem value="CUSTOM">Custom</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <FormControl fullWidth disabled={roleDialog.mode === 'view'}>
              <InputLabel>Level</InputLabel>
              <Select
                value={roleForm.level}
                onChange={(e) => onRoleFormChange({ ...roleForm, level: e.target.value as any })}
                label="Level"
              >
                <MenuItem value="PLATFORM">Platform</MenuItem>
                <MenuItem value="TENANT">Tenant</MenuItem>
                <MenuItem value="DEPARTMENT">Department</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={roleForm.isActive}
                  onChange={(e) => onRoleFormChange({ ...roleForm, isActive: e.target.checked })}
                  disabled={roleDialog.mode === 'view'}
                />
              }
              label="Active Role"
            />
          </Grid>
        </Grid>
      )}
      {roleFormStep === 1 && (
        <Box sx={{ mt: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="subtitle2">
              {roleForm.selectedPermissions.length} permissions selected
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button size="small" onClick={() => {
                const allPerms = permissionSelectionGroups.flatMap(g => g.permissions.map(p => p.code ?? ''));
                onRoleFormChange({ ...roleForm, selectedPermissions: allPerms });
              }}>Select All</Button>
              <Button size="small" onClick={() => onRoleFormChange({ ...roleForm, selectedPermissions: [] })}>Clear All</Button>
            </Box>
          </Box>
          {permissionSelectionGroups.map((group) => {
            const groupPerms = group.permissions.filter(p => p.code);
            const selectedCount = groupPerms.filter(p => roleForm.selectedPermissions.includes(p.code!)).length;
            const allSelected = selectedCount === groupPerms.length;
            return (
              <Accordion key={group.key} defaultExpanded={selectedCount > 0} sx={{ mb: 1 }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                    <Checkbox
                      size="small"
                      checked={allSelected}
                      indeterminate={selectedCount > 0 && !allSelected}
                      onChange={(e) => {
                        const codes = groupPerms.map(p => p.code!);
                        if (e.target.checked) {
                          onRoleFormChange({
                            ...roleForm,
                            selectedPermissions: [...new Set([...roleForm.selectedPermissions, ...codes])],
                          });
                        } else {
                          onRoleFormChange({
                            ...roleForm,
                            selectedPermissions: roleForm.selectedPermissions.filter(c => !codes.includes(c)),
                          });
                        }
                      }}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <Typography variant="subtitle2">{group.label}</Typography>
                    <Chip label={`${selectedCount}/${groupPerms.length}`} size="small" variant="outlined" />
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 1 }}>
                    {groupPerms.map((perm) => (
                      <FormControlLabel
                        key={perm.code}
                        control={
                          <Checkbox
                            size="small"
                            checked={roleForm.selectedPermissions.includes(perm.code!)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                onRoleFormChange({ ...roleForm, selectedPermissions: [...roleForm.selectedPermissions, perm.code!] });
                              } else {
                                onRoleFormChange({ ...roleForm, selectedPermissions: roleForm.selectedPermissions.filter(c => c !== perm.code) });
                              }
                            }}
                          />
                        }
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Typography variant="caption">{perm.displayName || perm.code}</Typography>
                            {perm.riskLevel === 'CRITICAL' && <Chip label="Critical" size="small" color="error" variant="outlined" sx={{ height: 18, fontSize: 10 }} />}
                            {perm.requiresApproval && <Chip label="Approval" size="small" color="warning" variant="outlined" sx={{ height: 18, fontSize: 10 }} />}
                          </Box>
                        }
                        componentsProps={{ typography: { variant: 'caption' } }}
                      />
                    ))}
                  </Box>
                </AccordionDetails>
              </Accordion>
            );
          })}
        </Box>
      )}
    </DialogContent>
    <DialogActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
      <Box>
        {roleFormStep > 0 && roleDialog.mode !== 'view' && (
          <Button onClick={() => onRoleFormStepChange(roleFormStep - 1)}>Back</Button>
        )}
      </Box>
      <Box>
        <Button onClick={onClose}>
          {roleDialog.mode === 'view' ? 'Close' : 'Cancel'}
        </Button>
        {roleDialog.mode !== 'view' && roleFormStep === 0 && (
          <Button variant="contained" onClick={() => onRoleFormStepChange(1)} sx={{ ml: 1 }}>
            Next: Permissions
          </Button>
        )}
        {roleDialog.mode !== 'view' && roleFormStep === 1 && (
          <Button variant="contained" onClick={onSave} sx={{ ml: 1 } as any} data-testid="access-management-save-role">
            {roleDialog.mode === 'create' ? 'Create Role' : 'Update Role'}
          </Button>
        )}
      </Box>
    </DialogActions>
  </Dialog>
);
