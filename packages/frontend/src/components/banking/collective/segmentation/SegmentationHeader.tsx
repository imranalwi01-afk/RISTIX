
import React from 'react';
import {
  Box,
  Typography,
  Breadcrumbs,
  Link,
  Button,
  Stack,
  Chip,
  Tooltip,
  IconButton,
  Menu,
  MenuItem
} from '@mui/material';
import {
  Home as HomeIcon,
  Category as SegmentIcon,
  Refresh as RefreshIcon,
  FileDownload as ExportIcon,
  Help as HelpIcon,
  MoreVert as MoreIcon
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';

interface SegmentationHeaderProps {
  onRefresh: () => void;
  onExport: (format: 'xlsx' | 'csv' | 'pdf') => void;
  onHelp: () => void;
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
  const router = useRouter();
  const [exportAnchorEl, setExportAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleExportClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setExportAnchorEl(event.currentTarget);
  };

  const handleExportClose = () => {
    setExportAnchorEl(null);
  };

  return (
    <Box sx={{ mb: 2.5 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
        <Link 
            underline="hover" 
            color="inherit" 
            onClick={() => router.push('/banking/dashboard')} 
            sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer', fontSize: '0.875rem' }}
        >
          <HomeIcon sx={{ mr: 0.5, fontSize: 16 }} /> Dashboard
        </Link>
        <Link 
            underline="hover" 
            color="inherit" 
            href="#" 
            sx={{ fontSize: '0.875rem' }}
        >
            Collective
        </Link>
        <Typography 
            color="text.primary" 
            sx={{ display: 'flex', alignItems: 'center', fontSize: '0.875rem', fontWeight: 500 }}
        >
          <SegmentIcon sx={{ mr: 0.5, fontSize: 16 }} /> Segmentation
        </Typography>
      </Breadcrumbs>

      {/* Main Header Content */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: 2,
          flexWrap: 'wrap',
        }}
      >
        <Box>
          <Typography variant="h4" component="h1" fontWeight="800" sx={{ color: 'primary.main', mb: 0.5 }}>
            Segmentation Configuration
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Master-detail configuration for portfolio segmentation rules and criteria
          </Typography>
        </Box>

        <Stack direction="column" spacing={1} alignItems="flex-end">
          <Stack direction="row" spacing={1}>
            <Tooltip title="Refresh Data (R)">
              <Button 
                variant="outlined" 
                startIcon={<RefreshIcon />} 
                onClick={onRefresh}
                size="small"
                sx={{ borderRadius: 1.5, textTransform: 'none' }}
              >
                Refresh
              </Button>
            </Tooltip>
            
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

            <Button 
              variant="outlined" 
              startIcon={<HelpIcon />} 
              onClick={onHelp}
              size="small"
              sx={{ borderRadius: 1.5, textTransform: 'none' }}
            >
              Help
            </Button>
          </Stack>

          <Stack direction="row" spacing={2} alignItems="center">
            <Typography variant="caption" color="text.secondary">
                Last updated: <Box component="span" sx={{ fontWeight: 'bold' }}>{lastUpdated}</Box>
            </Typography>
            <Chip 
              label={`Database ${dbStatus === 'active' ? 'Active' : 'Disconnected'}`}
              size="small" 
              color={dbStatus === 'active' ? 'success' : 'error'} 
              variant="outlined"
              sx={{ 
                  height: 20, 
                  fontSize: '0.65rem', 
                  fontWeight: 'bold',
                  borderColor: dbStatus === 'active' ? 'success.light' : 'error.light',
                  bgcolor: dbStatus === 'active' ? 'success.50' : 'error.50'
              }} 
            />
          </Stack>
        </Stack>
      </Box>
    </Box>
  );
};
