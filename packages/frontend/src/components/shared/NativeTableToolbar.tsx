'use client';

import React from 'react';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import type { EnterpriseColumnFilterValue, EnterpriseDensity } from '@/types/enterprise-table';
import type { NativeTableColumn } from './NativeTable.types';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface NativeTableToolbarProps {
  columns: NativeTableColumn[];
  activeFilterEntries: [string, EnterpriseColumnFilterValue][];
  onClearFilters: () => void;
  onRemoveFilter: (field: string) => void;
  showEnterpriseControls: boolean;
  visibleColumnCount: number;
  columnsMenuAnchor: HTMLElement | null;
  onOpenColumnsMenu: (anchor: HTMLElement) => void;
  onCloseColumnsMenu: () => void;
  columnVisibilityModel: Record<string, boolean>;
  onToggleColumn: (field: string) => void;
  density: EnterpriseDensity;
  onDensityChange: (density: EnterpriseDensity) => void;
  onSaveView?: () => void;
  onResetView: () => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function NativeTableToolbar({
  columns,
  activeFilterEntries,
  onClearFilters,
  onRemoveFilter,
  showEnterpriseControls,
  visibleColumnCount,
  columnsMenuAnchor,
  onOpenColumnsMenu,
  onCloseColumnsMenu,
  columnVisibilityModel,
  onToggleColumn,
  density,
  onDensityChange,
  onSaveView,
  onResetView,
}: NativeTableToolbarProps) {
  if (!showEnterpriseControls && activeFilterEntries.length === 0) {
    return null;
  }

  return (
    <Stack
      direction="row"
      spacing={1}
      alignItems="center"
      flexWrap="wrap"
      sx={{
        mb: 1.25,
        gap: 1,
        p: 1,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1.5,
        bgcolor: 'background.paper',
        boxShadow: '0 8px 22px rgba(15, 23, 42, 0.04)',
        flexShrink: 0,
      }}
    >
      {activeFilterEntries.map(([field, value]) => (
        <Chip
          key={field}
          size="small"
          label={`${columns.find((column) => String(column.field) === field)?.headerName ?? field}: ${String(value)}`}
          onDelete={() => onRemoveFilter(field)}
          sx={{ maxWidth: 260 }}
        />
      ))}
      {activeFilterEntries.length > 0 && (
        <Button size="small" onClick={onClearFilters}>
          Clear filters
        </Button>
      )}
      {showEnterpriseControls && (
        <>
          <Button
            size="small"
            variant="outlined"
            onClick={(event) => onOpenColumnsMenu(event.currentTarget)}
            sx={{ borderRadius: 1, bgcolor: 'background.paper' }}
          >
            Columns ({visibleColumnCount})
          </Button>
          <Menu
            anchorEl={columnsMenuAnchor}
            open={Boolean(columnsMenuAnchor)}
            onClose={onCloseColumnsMenu}
            PaperProps={{ sx: { minWidth: 240 } }}
          >
            {columns.map((column) => {
              const field = String(column.field);
              const checked = columnVisibilityModel[field] !== false;
              const disableToggle = checked && visibleColumnCount <= 1;

              return (
                <MenuItem key={field} dense>
                  <FormControlLabel
                    control={
                      <Switch
                        size="small"
                        checked={checked}
                        disabled={disableToggle}
                        onChange={() => onToggleColumn(field)}
                      />
                    }
                    label={column.headerName}
                    sx={{
                      m: 0,
                      width: '100%',
                      '.MuiFormControlLabel-label': {
                        fontSize: '0.875rem',
                      },
                    }}
                  />
                </MenuItem>
              );
            })}
          </Menu>
          <ToggleButtonGroup
            size="small"
            exclusive
            value={density}
            onChange={(_, nextDensity) => {
              if (nextDensity) onDensityChange(nextDensity);
            }}
            aria-label="Table density"
            sx={{
              '.MuiToggleButton-root': {
                px: 1.5,
                py: 0.55,
                textTransform: 'none',
              },
            }}
          >
            <ToggleButton value="comfortable">Comfort</ToggleButton>
            <ToggleButton value="standard">Default</ToggleButton>
            <ToggleButton value="compact">Compact</ToggleButton>
          </ToggleButtonGroup>
          {onSaveView && <Button size="small" onClick={onSaveView}>Save view</Button>}
          <Button size="small" onClick={onResetView}>Reset view</Button>
        </>
      )}
    </Stack>
  );
}
