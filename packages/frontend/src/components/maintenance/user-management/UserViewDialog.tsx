'use client';

import React, { memo } from 'react';
import { Box, Button, Chip, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Grid, Typography } from '@mui/material';
import { Visibility as ViewIcon } from '@mui/icons-material';
import type { User, UserRoleSummary } from './types';

interface UserViewDialogProps {
  open: boolean;
  selectedUser: User | null;
  selectedUserRoles: UserRoleSummary[];
  loadingUserRoles: boolean;
  onClose: () => void;
  onAssignRoles: (user: User) => void;
  onEdit: (user: User) => void;
}

const UserViewDialog = memo(function UserViewDialog({
  open,
  selectedUser,
  selectedUserRoles,
  loadingUserRoles,
  onClose,
  onAssignRoles,
  onEdit,
}: UserViewDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ViewIcon />
          User Details
        </Box>
      </DialogTitle>
      <DialogContent>
        {selectedUser && (
          <Box sx={{ mt: 1 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 6 }}>
                <Typography variant="subtitle2" color="text.secondary">Full Name</Typography>
                <Typography>{selectedUser.fullName}</Typography>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Typography variant="subtitle2" color="text.secondary">Email</Typography>
                <Typography>{selectedUser.email}</Typography>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Typography variant="subtitle2" color="text.secondary">Username</Typography>
                <Typography>{selectedUser.username}</Typography>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Typography variant="subtitle2" color="text.secondary">Employee ID</Typography>
                <Typography>{selectedUser.employeeId || 'N/A'}</Typography>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Typography variant="subtitle2" color="text.secondary">Department</Typography>
                <Typography>{selectedUser.department || 'N/A'}</Typography>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Typography variant="subtitle2" color="text.secondary">Position</Typography>
                <Typography>{selectedUser.position || 'N/A'}</Typography>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Typography variant="subtitle2" color="text.secondary">Banking Access</Typography>
                <Chip label={selectedUser.bankingAccess} size="small" />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Typography variant="subtitle2" color="text.secondary">Status</Typography>
                <Chip label={selectedUser.isActive ? 'Active' : 'Inactive'} color={selectedUser.isActive ? 'success' : 'default'} size="small" />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Typography variant="subtitle2" color="text.secondary">Assigned Roles</Typography>
                {loadingUserRoles ? (
                  <Box sx={{ py: 1 }}>
                    <CircularProgress size={16} />
                  </Box>
                ) : selectedUserRoles.length > 0 ? (
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', pt: 0.5 }}>
                    {selectedUserRoles.filter((role) => role.isActive).map((role) => (
                      <Chip key={`selected-role-${role.id}`} label={role.roleName} variant="outlined" size="small" />
                    ))}
                  </Box>
                ) : (
                  <Typography>N/A</Typography>
                )}
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Typography variant="subtitle2" color="text.secondary">Dual Mode Certified</Typography>
                <Chip label={selectedUser.dualModeCertified ? 'Yes' : 'No'} color={selectedUser.dualModeCertified ? 'success' : 'default'} size="small" />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Typography variant="subtitle2" color="text.secondary">MFA Enabled</Typography>
                <Chip label={selectedUser.mfaEnabled ? 'Yes' : 'No'} color={selectedUser.mfaEnabled ? 'success' : 'default'} size="small" />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Typography variant="subtitle2" color="text.secondary">Last Login</Typography>
                <Typography>{selectedUser.lastLoginAt ? new Date(selectedUser.lastLoginAt).toLocaleString() : 'Never'}</Typography>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Typography variant="subtitle2" color="text.secondary">Created</Typography>
                <Typography>{new Date(selectedUser.createdAt).toLocaleString()}</Typography>
              </Grid>
            </Grid>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        {selectedUser && (
          <Button variant="contained" onClick={() => onAssignRoles(selectedUser)}>
            Assign Roles
          </Button>
        )}
        {selectedUser && (
          <Button variant="outlined" onClick={() => onEdit(selectedUser)}>
            Edit User
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
});

export default UserViewDialog;
