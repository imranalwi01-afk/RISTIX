'use client';

import React, { memo } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';
import { AccountTree, Add, FilterList, Menu as MenuIcon, Refresh, Search, Security, Settings, Visibility } from '@mui/icons-material';
import type { MenuItem, Role } from './types';

interface MenuAnalyticsPanelProps {
  menus: MenuItem[];
  roles: Role[];
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onRefresh: () => void;
  onShowFilterInfo: () => void;
  onAddRoot: () => void;
  onToggleExpandAll: () => void;
  onInitializeDefault: () => void;
  onTestConfiguration: () => void;
  expandModeActive: boolean;
}

const MenuAnalyticsPanel = memo(function MenuAnalyticsPanel({
  menus,
  roles,
  searchTerm,
  onSearchChange,
  onRefresh,
  onShowFilterInfo,
  onAddRoot,
  onToggleExpandAll,
  onInitializeDefault,
  onTestConfiguration,
  expandModeActive,
}: MenuAnalyticsPanelProps) {
  return (
    <>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <TextField
              fullWidth
              placeholder="Search menus..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
            />
            <Button variant="outlined" startIcon={<FilterList />} onClick={onShowFilterInfo}>
              Filter
            </Button>
          </Box>
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Menu Statistics & Analytics
            </Typography>
            <Button startIcon={<Refresh />} onClick={onRefresh} size="small" variant="outlined">
              Refresh
            </Button>
          </Box>

          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2, backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.05) }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <MenuIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {menus.length}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Total Menu Items
                </Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2, backgroundColor: (theme) => alpha(theme.palette.success.main, 0.05) }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Visibility sx={{ mr: 1, color: 'success.main' }} />
                  <Typography variant="h4" sx={{ fontWeight: 700, color: 'success.main' }}>
                    {menus.filter((m) => m.isActive).length}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Active Items
                </Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2, backgroundColor: (theme) => alpha(theme.palette.warning.main, 0.05) }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Banking Mode Distribution
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  <Chip label={`Conventional: ${menus.filter((m) => m.bankingModes?.includes('conventional')).length}`} size="small" />
                  <Chip label={`Syariah: ${menus.filter((m) => m.bankingModes?.includes('syariah')).length}`} size="small" />
                  <Chip label={`Dual: ${menus.filter((m) => m.bankingModes?.includes('dual')).length}`} size="small" />
                </Box>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2, backgroundColor: (theme) => alpha(theme.palette.info.main, 0.05) }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Role Coverage
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {Array.from(new Set(menus.flatMap((m) => m.roles || []))).length} unique roles
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {roles.length} loaded roles
                </Typography>
              </Box>
            </Grid>
          </Grid>

          <Box sx={{ mt: 3, p: 2, backgroundColor: (theme) => alpha(theme.palette.background.paper, 0.5), borderRadius: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
              Quick Actions
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Button startIcon={<Add />} onClick={onAddRoot} variant="contained" size="small">
                Add Root Menu
              </Button>
              <Button startIcon={<AccountTree />} onClick={onToggleExpandAll} variant="outlined" size="small">
                {expandModeActive ? 'Collapse All' : 'Expand All'}
              </Button>
              <Button startIcon={<Settings />} onClick={onInitializeDefault} variant="outlined" size="small" color="secondary">
                Initialize Default Menu
              </Button>
              <Button startIcon={<Security />} onClick={onTestConfiguration} variant="outlined" size="small" color="info">
                Test Configuration
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </>
  );
});

export default MenuAnalyticsPanel;
