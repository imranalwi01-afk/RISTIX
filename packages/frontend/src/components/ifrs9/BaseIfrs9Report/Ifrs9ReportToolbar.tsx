// Ifrs9ReportToolbar.tsx – Search bar, filter toggle, refresh, export buttons
'use client';
import React from 'react';
import Box from '@mui/material/Box'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import InputAdornment from '@mui/material/InputAdornment'
import { alpha } from '@mui/material/styles'
import DownloadIcon from '@mui/icons-material/Download'
import RefreshIcon from '@mui/icons-material/Refresh'
import FilterIcon from '@mui/icons-material/FilterList'
import ChartIcon from '@mui/icons-material/BarChart'
import SearchIcon from '@mui/icons-material/Search'
import type { ThemeStyles } from './types'

interface Ifrs9ReportToolbarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  showFilters: boolean;
  onToggleFilters: () => void;
  hideFilters: boolean;
  supportsCharts: boolean;
  loading: boolean;
  exportLoading: boolean;
  hasData: boolean;
  onRefresh: () => void;
  onExport: () => void;
  headerAtTop: boolean;
  themeStyles: ThemeStyles;
}

const Ifrs9ReportToolbar: React.FC<Ifrs9ReportToolbarProps> = ({
  searchTerm,
  onSearchChange,
  showFilters,
  onToggleFilters,
  hideFilters,
  supportsCharts,
  loading,
  exportLoading,
  hasData,
  onRefresh,
  onExport,
  headerAtTop,
  themeStyles,
}) => (
  <Box sx={{
    mb: 4,
    display: 'flex',
    gap: 2,
    alignItems: 'center',
    flexWrap: 'wrap',
    position: headerAtTop ? 'relative' : 'sticky',
    top: headerAtTop ? undefined : 74,
    zIndex: headerAtTop ? 1 : 10,
    py: 2,
    bgcolor: 'rgba(250, 250, 250, 0.85)',
    backdropFilter: 'blur(12px)',
    borderBottom: headerAtTop ? 'none' : '1px solid rgba(0,0,0,0.06)',
    mx: -2,
    px: 2,
  }}>
    <TextField
      placeholder="Search data..."
      size="small"
      value={searchTerm}
      onChange={(e) => onSearchChange(e.target.value)}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon color="action" />
          </InputAdornment>
        ),
      }}
      sx={{
        width: 250,
        '& .MuiOutlinedInput-root': {
          borderRadius: 2,
          bgcolor: 'background.paper'
        }
      }}
    />

    {!hideFilters && (
      <Button
        variant={showFilters ? "contained" : "outlined"}
        startIcon={<FilterIcon />}
        onClick={onToggleFilters}
        sx={{
          borderRadius: 2,
          textTransform: 'none',
          fontWeight: 600,
          ...(showFilters && {
            background: themeStyles.gradient,
            boxShadow: `0 4px 12px ${alpha(themeStyles.primary, 0.3)}`
          })
        }}
      >
        {showFilters ? 'Hide Filters' : 'Analysis Parameters'}
      </Button>
    )}

    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
      <Tooltip title="Refresh Data">
        <IconButton
          onClick={onRefresh}
          disabled={loading}
          sx={{
            bgcolor: alpha(themeStyles.primary, 0.05),
            '&:hover': { bgcolor: alpha(themeStyles.primary, 0.1) }
          }}
        >
          <RefreshIcon sx={{ color: themeStyles.primary }} />
        </IconButton>
      </Tooltip>

      {supportsCharts && (
        <Tooltip title="Toggle Charts">
          <IconButton
            sx={{
              bgcolor: alpha(themeStyles.primary, 0.05),
              '&:hover': { bgcolor: alpha(themeStyles.primary, 0.1) }
            }}
          >
            <ChartIcon sx={{ color: themeStyles.primary }} />
          </IconButton>
        </Tooltip>
      )}
    </Box>

    <Box sx={{ flexGrow: 1 }} />

    <Button
      variant="contained"
      startIcon={<DownloadIcon />}
      onClick={onExport}
      disabled={exportLoading || !hasData}
      sx={{
        borderRadius: 2,
        px: 3,
        textTransform: 'none',
        fontWeight: 700,
        background: themeStyles.gradient,
        boxShadow: `0 4px 14px ${alpha(themeStyles.primary, 0.4)}`,
        '&:hover': {
          boxShadow: `0 6px 20px ${alpha(themeStyles.primary, 0.5)}`,
          transform: 'translateY(-1px)'
        },
        transition: 'all 0.2s ease'
      }}
    >
      {exportLoading ? 'Processing...' : 'Export'}
    </Button>
  </Box>
);

export default React.memo(Ifrs9ReportToolbar);
