'use client';

import React, { memo } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  Switch,
  TextField,
} from '@mui/material';
import { Edit as EditIcon, PersonAdd as PersonAddIcon, Visibility as ViewIcon, VisibilityOff as HideIcon } from '@mui/icons-material';
import { PasswordInput } from '@/components/users/PasswordInput';
import type { UserFormData } from './types';

interface UserFormDialogProps {
  open: boolean;
  mode: 'create' | 'edit';
  formData: UserFormData;
  showPassword: boolean;
  onClose: () => void;
  onChange: (next: UserFormData) => void;
  onTogglePassword: () => void;
  onSubmit: () => void;
}

const UserFormDialog = memo(function UserFormDialog({
  open,
  mode,
  formData,
  showPassword,
  onClose,
  onChange,
  onTogglePassword,
  onSubmit,
}: UserFormDialogProps) {
  const isCreate = mode === 'create';
  const sendWelcomeEmail = formData.sendWelcomeEmail ?? true;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {isCreate ? <PersonAddIcon /> : <EditIcon />}
          {isCreate ? 'Create New User' : 'Edit User'}
        </Box>
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField fullWidth label="Full Name" value={formData.fullName} onChange={(e) => onChange({ ...formData, fullName: e.target.value })} required />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField fullWidth label="Email" type="email" value={formData.email} onChange={(e) => onChange({ ...formData, email: e.target.value })} required />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField fullWidth label="Username" value={formData.username} onChange={(e) => onChange({ ...formData, username: e.target.value })} required />
          </Grid>
          {isCreate && (
            <Grid size={{ xs: 12, sm: 6 }}>
              <PasswordInput
                fullWidth
                label="Password"
                value={formData.password || ''}
                onChange={(value) => onChange({ ...formData, password: value })}
                showValidation
              />
            </Grid>
          )}
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField fullWidth label="Employee ID" value={formData.employeeId} onChange={(e) => onChange({ ...formData, employeeId: e.target.value })} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField fullWidth label="Department" value={formData.department} onChange={(e) => onChange({ ...formData, department: e.target.value })} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField fullWidth label="Position" value={formData.position} onChange={(e) => onChange({ ...formData, position: e.target.value })} />
          </Grid>
          {isCreate && (
            <Grid size={{ xs: 12 }}>
              <FormControlLabel
                control={<Switch checked={sendWelcomeEmail} onChange={(e) => onChange({ ...formData, sendWelcomeEmail: e.target.checked })} />}
                label="Send welcome email with login credentials"
              />
            </Grid>
          )}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={onSubmit}>
          {isCreate ? 'Create User' : 'Update User'}
        </Button>
      </DialogActions>
    </Dialog>
  );
});

export default UserFormDialog;
