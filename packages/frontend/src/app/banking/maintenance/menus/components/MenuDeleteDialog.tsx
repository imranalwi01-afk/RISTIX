'use client';

import React, { memo } from 'react';
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import type { MenuItem } from './types';

interface MenuDeleteDialogProps {
  open: boolean;
  selectedMenu: MenuItem | null;
  onClose: () => void;
  onConfirm: () => void;
}

const MenuDeleteDialog = memo(function MenuDeleteDialog({
  open,
  selectedMenu,
  onClose,
  onConfirm,
}: MenuDeleteDialogProps) {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Delete Menu</DialogTitle>
      <DialogContent>
        <Alert severity="warning" sx={{ mb: 2 }}>
          Are you sure you want to delete "{selectedMenu?.label}"? This action cannot be undone.
        </Alert>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={onConfirm} color="error" variant="contained">
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
});

export default MenuDeleteDialog;
