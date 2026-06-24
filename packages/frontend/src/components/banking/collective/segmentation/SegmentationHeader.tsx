'use client';


import React from 'react';
import {
  Box,
  Typography,
  Button,
  Stack,
  Chip,
  Menu,
  MenuItem
} from '@mui/material';
import {
  FileDownload as ExportIcon,
  Help as HelpIcon,
} from '@mui/icons-material';
import PageHeader from '@/components/banking/shared/PageHeader';

interface SegmentationHeaderProps {
  onRefresh: () => void;
  onExport: (format: 'xlsx' | 'csv' | 'pdf') => void;
  onHelp?: () => void;
  lastUpdated: string;
  dbStatus: 'active' | 'inactive';
  canExport?: boolean;
}

export const SegmentationHeader: React.FC<SegmentationHeaderProps> = ({
  onRefresh,
  onExport,
  onHelp,
  lastUpdated,
  dbStatus,
  canExport = true
}) => {
  const [exportAnchorEl, setExportAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleExportClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setExportAnchorEl(event.currentTarget);
  };

  const handleExportClose = () => {
    setExportAnchorEl(null);
  };

  return (
    <>
      <PageHeader
        title="Segmentation Configuration"
        subtitle="Master-detail configuration for portfolio segmentation rules and criteria"
        chip={`DB ${dbStatus === 'active' ? 'Active' : 'Disconnected'}`}
        chipColor={dbStatus === 'active' ? 'success' : 'error'}
        onRefresh={onRefresh}
        extraActions={
          <>
            {canExport && (
              <>
                <Button
                  variant="outlined"
                  startIcon={<ExportIcon />}
                  onClick={handleExportClick}
                  size="small"
                  sx={{ borderRadius: 1.5, textTransform: 'none' }}
                >
                  Export
                </Button>
                <Menu
                  anchorEl={exportAnchorEl}
                  open={Boolean(exportAnchorEl)}
                  onClose={handleExportClose}
                  PaperProps={{ sx: { borderRadius: 2, mt: 1, minWidth: 160, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' } }}
                >
                  <MenuItem onClick={() => { onExport('xlsx'); handleExportClose(); }}>Excel (.xlsx)</MenuItem>
                  <MenuItem onClick={() => { onExport('csv'); handleExportClose(); }}>CSV (.csv)</MenuItem>
                  <MenuItem onClick={() => { onExport('pdf'); handleExportClose(); }}>PDF (.pdf)</MenuItem>
                </Menu>
              </>
            )}
            {onHelp && (
              <Button
                variant="outlined"
                startIcon={<HelpIcon />}
                onClick={onHelp}
                size="small"
                sx={{ borderRadius: 1.5, textTransform: 'none' }}
              >
                Help
              </Button>
            )}
          </>
        }
      />
      <Stack direction="row" spacing={2} alignItems="center" sx={{ px: 2, mb: 2 }}>
        <Typography variant="caption" color="text.secondary">
          Last updated: <Box component="span" sx={{ fontWeight: 'bold' }}>{lastUpdated}</Box>
        </Typography>
      </Stack>
    </>
  );
};
