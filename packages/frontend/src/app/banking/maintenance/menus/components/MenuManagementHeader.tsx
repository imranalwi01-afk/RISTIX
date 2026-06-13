'use client';

import React, { memo } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { Add, Menu as MenuIcon, Refresh, Settings } from '@mui/icons-material';

interface MenuManagementHeaderProps {
  loading: boolean;
  onRefresh: () => void;
  onInitialize: () => void;
  onAdd: () => void;
}

const MenuManagementHeader = memo(function MenuManagementHeader({
  loading,
  onRefresh,
  onInitialize,
  onAdd,
}: MenuManagementHeaderProps) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
      <Typography variant="h4" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 2 }}>
        <MenuIcon color="primary" />
        Menu Management
      </Typography>
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button variant="outlined" startIcon={<Refresh />} onClick={onRefresh} disabled={loading}>
          {loading ? 'Loading...' : 'Refresh'}
        </Button>
        <Button variant="outlined" startIcon={<Settings />} onClick={onInitialize} disabled={loading}>
          Initialize Default Structure
        </Button>
        <Button variant="contained" startIcon={<Add />} onClick={onAdd}>
          Add Menu
        </Button>
      </Box>
    </Box>
  );
});

export default MenuManagementHeader;
