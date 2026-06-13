'use client';

import React, { memo } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';
import { Delete, Edit, ExpandLess, ExpandMore, Security, Visibility, VisibilityOff } from '@mui/icons-material';
import type { MenuItem, Role } from './types';

interface MenuTreePanelProps {
  menus: MenuItem[];
  roles: Role[];
  expandedMenus: string[];
  onToggleExpand: (menuId: string) => void;
  onEdit: (menu: MenuItem) => void;
  onPermissions: (menu: MenuItem) => void;
  onToggleActive: (menu: MenuItem) => void;
  onDelete: (menu: MenuItem) => void;
}

const MenuTreePanel = memo(function MenuTreePanel({
  menus,
  roles,
  expandedMenus,
  onToggleExpand,
  onEdit,
  onPermissions,
  onToggleActive,
  onDelete,
}: MenuTreePanelProps) {
  const renderMenuItem = (menu: MenuItem, level = 0): React.ReactNode => {
    const hasChildren = menus.filter((m) => m.parentId === menu.id).length > 0;
    const isExpanded = expandedMenus.includes(menu.id);

    return (
      <Box key={menu.id} sx={{ ml: level * 2 }}>
        <Card sx={{ mb: 1, bgcolor: menu.isActive ? 'background.paper' : (theme) => alpha(theme.palette.action.disabled, 0.1) }}>
          <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {hasChildren && (
                  <IconButton size="small" onClick={() => onToggleExpand(menu.id)}>
                    {isExpanded ? <ExpandLess /> : <ExpandMore />}
                  </IconButton>
                )}
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    {menu.label}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {menu.description}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  {menu.roles.map((roleId) => {
                    const role = roles.find((r) => r.id === roleId);
                    return role ? <Chip key={roleId} label={role.name} size="small" color="primary" variant="outlined" /> : null;
                  })}
                </Box>

                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  {menu.bankingModes.map((mode) => (
                    <Chip
                      key={mode}
                      label={mode}
                      size="small"
                      color={mode === 'syariah' ? 'success' : mode === 'dual' ? 'warning' : 'primary'}
                      variant="filled"
                    />
                  ))}
                </Box>

                <Tooltip title="Edit Menu">
                  <IconButton size="small" onClick={() => onEdit(menu)}>
                    <Edit fontSize="small" />
                  </IconButton>
                </Tooltip>

                <Tooltip title="Manage Permissions">
                  <IconButton size="small" onClick={() => onPermissions(menu)}>
                    <Security fontSize="small" />
                  </IconButton>
                </Tooltip>

                <Tooltip title={menu.isActive ? 'Deactivate' : 'Activate'}>
                  <IconButton size="small" onClick={() => onToggleActive(menu)}>
                    {menu.isActive ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                  </IconButton>
                </Tooltip>

                <Tooltip title="Delete Menu">
                  <IconButton size="small" onClick={() => onDelete(menu)} color="error">
                    <Delete fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {hasChildren && isExpanded && (
          <Box sx={{ mt: 1, ml: 3, pl: 2, borderLeft: '2px solid', borderColor: (theme) => alpha(theme.palette.primary.main, 0.2) }}>
            {menus
              .filter((m) => m.parentId === menu.id)
              .sort((a, b) => a.order - b.order)
              .map((child) => renderMenuItem(child, level + 1))}
          </Box>
        )}
      </Box>
    );
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          Menu Structure
        </Typography>
        <Box>
          {menus
            .filter((menu) => !menu.parentId)
            .sort((a, b) => a.order - b.order)
            .map((menu) => renderMenuItem(menu))}
        </Box>
      </CardContent>
    </Card>
  );
});

export default MenuTreePanel;
