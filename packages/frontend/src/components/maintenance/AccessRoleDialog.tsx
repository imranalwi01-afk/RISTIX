'use client';

import React, { useState, useEffect, useCallback } from 'react';
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

export interface RoleFormData {
  name: string;
  displayName: string;
  description: string;
  type: 'SYSTEM' | 'BANKING' | 'CUSTOM';
  level: 'PLATFORM' | 'TENANT' | 'DEPARTMENT';
  isActive: boolean;
  selectedPermissions: string[];
}

interface AccessRoleDialogProps {
  open: boolean;
  mode: 'create' | 'edit' | 'view';
  role: Role | null;
  permissionSelectionGroups: PermissionSelectionGroup[];
  onClose: () => void;
  onSave: (formData: RoleFormData) => void;
}

const DEFAULT_FORM: RoleFormData = {
  name: '',
  displayName: '',
  description: '',
  type: 'CUSTOM',
  level: 'TENANT',
  isActive: true,
  selectedPermissions: [],
};

export const AccessRoleDialog: React.FC<AccessRoleDialogProps> = ({
  open,
  mode,
  role,
  permissionSelectionGroups,
  onClose,
  onSave,
}) => {
  const [form, setForm] = useState<RoleFormData>(DEFAULT_FORM);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (open) {
      if (role) {
        setForm({
          name: role.name,
          displayName: role.displayName,
          description: role.description,
          type: role.type,
          level: role.level,
          isActive: role.isActive,
          selectedPermissions: role.permissions?.map((p: any) => p.code ?? p) ?? [],
        });
      } else {
        setForm(DEFAULT_FORM);
      }
      setStep(0);
    }
  }, [open, role]);

  const updateForm = useCallback((next: RoleFormData) => {
    setForm(next);
  }, []);

  const handleSave = useCallback(() => {
    onSave(form);
  }, [form, onSave]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth={step === 0 ? 'md' : 'xl'} fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {mode === 'create' && 'Create New Role'}
          {mode === 'edit' && 'Edit Role'}
          {mode === 'view' && 'Role Details'}
          <Chip label={step === 0 ? 'Basic Info' : 'Permissions'} size="small" color="primary" variant="outlined" sx={{ ml: 'auto' }} />
        </Box>
      </DialogTitle>
      <Stepper activeStep={step} sx={{ px: 3, pt: 1, pb: 2 }}>
        <Step><StepLabel>Basic Information</StepLabel></Step>
        <Step><StepLabel>Permissions</StepLabel></Step>
      </Stepper>
      <DialogContent>
        {step === 0 && (
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Role Name (System)"
                value={form.name}
                onChange={(e) => updateForm({ ...form, name: e.target.value.toUpperCase() })}
                disabled={mode === 'view' || (role?.isBuiltIn ?? false)}
                placeholder="ROLE_NAME"
                inputProps={{ 'data-testid': 'access-management-role-name' }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Display Name"
                value={form.displayName}
                onChange={(e) => updateForm({ ...form, displayName: e.target.value })}
                disabled={mode === 'view'}
                placeholder="Human readable name"
                inputProps={{ 'data-testid': 'access-management-role-display-name' }}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Description"
                value={form.description}
                onChange={(e) => updateForm({ ...form, description: e.target.value })}
                disabled={mode === 'view'}
                multiline
                rows={3}
                placeholder="Role description and responsibilities"
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <FormControl fullWidth disabled={mode === 'view'}>
                <InputLabel>Type</InputLabel>
                <Select
                  value={form.type}
                  onChange={(e) => updateForm({ ...form, type: e.target.value as any })}
                  label="Type"
                >
                  <MenuItem value="SYSTEM">System</MenuItem>
                  <MenuItem value="BANKING">Banking</MenuItem>
                  <MenuItem value="CUSTOM">Custom</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <FormControl fullWidth disabled={mode === 'view'}>
                <InputLabel>Level</InputLabel>
                <Select
                  value={form.level}
                  onChange={(e) => updateForm({ ...form, level: e.target.value as any })}
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
                    checked={form.isActive}
                    onChange={(e) => updateForm({ ...form, isActive: e.target.checked })}
                    disabled={mode === 'view'}
                  />
                }
                label="Active Role"
              />
            </Grid>
          </Grid>
        )}
        {step === 1 && (
          <Box sx={{ mt: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle2">
                {form.selectedPermissions.length} permissions selected
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button size="small" onClick={() => {
                  const allPerms = permissionSelectionGroups.flatMap(g => g.permissions.map(p => p.code ?? ''));
                  updateForm({ ...form, selectedPermissions: allPerms });
                }}>Select All</Button>
                <Button size="small" onClick={() => updateForm({ ...form, selectedPermissions: [] })}>Clear All</Button>
              </Box>
            </Box>
            {permissionSelectionGroups.map((group) => {
              const groupPerms = group.permissions.filter(p => p.code);
              const selectedCount = groupPerms.filter(p => form.selectedPermissions.includes(p.code!)).length;
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
                            updateForm({ ...form, selectedPermissions: [...new Set([...form.selectedPermissions, ...codes])] });
                          } else {
                            updateForm({ ...form, selectedPermissions: form.selectedPermissions.filter(c => !codes.includes(c)) });
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
                              checked={form.selectedPermissions.includes(perm.code!)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  updateForm({ ...form, selectedPermissions: [...form.selectedPermissions, perm.code!] });
                                } else {
                                  updateForm({ ...form, selectedPermissions: form.selectedPermissions.filter(c => c !== perm.code) });
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
          {step > 0 && mode !== 'view' && (
            <Button onClick={() => setStep(step - 1)}>Back</Button>
          )}
        </Box>
        <Box>
          <Button onClick={onClose}>
            {mode === 'view' ? 'Close' : 'Cancel'}
          </Button>
          {mode !== 'view' && step === 0 && (
            <Button variant="contained" onClick={() => setStep(1)} sx={{ ml: 1 }}>
              Next: Permissions
            </Button>
          )}
          {mode !== 'view' && step === 1 && (
            <Button variant="contained" onClick={handleSave} sx={{ ml: 1 }} data-testid="access-management-save-role">
              {mode === 'create' ? 'Create Role' : 'Update Role'}
            </Button>
          )}
        </Box>
      </DialogActions>
    </Dialog>
  );
};
