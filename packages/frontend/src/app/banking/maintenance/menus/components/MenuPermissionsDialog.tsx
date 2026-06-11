'use client';

import React, { memo } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import type { MenuItem, Role, User } from './types';

interface MenuPermissionsDialogProps {
  open: boolean;
  selectedMenu: MenuItem | null;
  users: User[];
  roles: Role[];
  onClose: () => void;
}

const MenuPermissionsDialog = memo(function MenuPermissionsDialog({
  open,
  selectedMenu,
  users,
  roles,
  onClose,
}: MenuPermissionsDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Manage Permissions - {selectedMenu?.label}</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 2 }}>
            Menu Permissions
          </Typography>
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>User</TableCell>
                  <TableCell>Roles</TableCell>
                  <TableCell>Access</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        {user.roles.map((roleId) => {
                          const role = roles.find((r) => r.id === roleId);
                          return role ? <Chip key={roleId} label={role.name} size="small" /> : null;
                        })}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={selectedMenu?.roles.some((roleId) => user.roles.includes(roleId)) ? 'Has Access' : 'No Access'}
                        color={selectedMenu?.roles.some((roleId) => user.roles.includes(roleId)) ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Button size="small" variant="outlined">
                        Manage
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
});

export default MenuPermissionsDialog;
