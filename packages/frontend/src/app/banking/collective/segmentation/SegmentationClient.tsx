
// packages/frontend/src/app/banking/collective/segmentation/SegmentationClient.tsx
// ============================================================================
// IFRS9 FRONTEND - SEGMENTATION PARAMETER PAGE
// ============================================================================

'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Breadcrumbs,
  Link,
  Alert,
  Container,
  InputAdornment,
  Chip,
  Menu,
  MenuItem,
  Stack,
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  Refresh as RefreshIcon,
  Home as HomeIcon,
  Category as SegmentIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  FileDownload as ExportIcon,
  Help as HelpIcon
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { api } from '../../../../services/api';
import { FullstackIndicator } from '@/components/common/feedback/FullstackIndicator';

// Components
import SegmentationDrawer from './components/SegmentationDrawer';
import SegmentationTable from './components/SegmentationTable';
import SegmentationFilterDrawer from './components/SegmentationFilterDrawer';

// ============================================================================
// TYPES
// ============================================================================

interface SegmentationHeader {
  id: number;
  group_segment: string;
  segment: string;
  sub_segment?: string;
  segment_type: string;
  seq: number;
  active_flag: boolean;
  status?: string; 
  updated_date?: string;
}

const MOCK_HISTORY = [
  { id: '1', status: 'Approved', timestamp: '2026-02-09T08:00:00Z', user: 'Manager User', role: 'Approver', comment: 'Approved for production.' },
  { id: '2', status: 'Submitted', timestamp: '2026-02-08T14:30:00Z', user: 'Analyst User', role: 'Maker', comment: 'Ready for review.' },
  { id: '3', status: 'Draft', timestamp: '2026-02-08T10:00:00Z', user: 'Analyst User', role: 'Maker', comment: 'Initial creation.' },
] as const;

export default function SegmentationClient() {
  const router = useRouter();
  
  // Refs for Keyboard Shortcuts
  const searchInputRef = useRef<HTMLInputElement>(null);

  // ============================================================================
  // STATE
  // ============================================================================
  
  // Data
  const [headers, setHeaders] = useState<SegmentationHeader[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [filters, setFilters] = useState({
    segmentType: '',
    status: '',
    tableName: '',
    columnName: '',
    operator: ''
  });

  // Drawer
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<'add' | 'edit' | 'view'>('view');
  const [selectedHeader, setSelectedHeader] = useState<SegmentationHeader | null>(null);
  
  const [details, setDetails] = useState<any[]>([]);
  const [formData, setFormData] = useState<any>({}); 

  // UI
  const [error, setError] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean, message: string, type: 'success' | 'error' }>({ open: false, message: '', type: 'success' });
  const [exportAnchorEl, setExportAnchorEl] = useState<null | HTMLElement>(null);

  // ============================================================================
  // EFFECTS
  // ============================================================================

  const loadHeaders = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        search: searchTerm || undefined,
        limit: rowsPerPage,
        offset: page * rowsPerPage,
        ...filters
      };
      const response = await api.banking.segmentation.getHeaders(params);
      if (response && response.data) {
        const transformedData = response.data.map((item: any) => ({
            ...item,
            status: item.active_flag ? 'Active' : 'Inactive' 
        }));
        setHeaders(transformedData);
        setTotalCount(response.total || transformedData.length);
      } else {
        setHeaders([]);
        setTotalCount(0);
      }
    } catch (err: any) {
      console.error('Error loading headers:', err);
      setError('Failed to load segmentation data. Please try refresh.');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, page, rowsPerPage, filters]);

  useEffect(() => {
    loadHeaders();
  }, [loadHeaders]);

  // Keyboard Shortcuts
  useEffect(() => {
     const handleKeyDown = (e: KeyboardEvent) => {
         // Ignore if input is focused (except ESC)
         const isInput = (e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).tagName === 'TEXTAREA';
         
         if (e.key === 'Escape') {
             if (drawerOpen) setDrawerOpen(false);
             if (filterDrawerOpen) setFilterDrawerOpen(false);
         }

         if (isInput) return;

         if (e.key === '/') {
             e.preventDefault();
             searchInputRef.current?.focus();
         }
         if (e.key.toLowerCase() === 'f') {
             e.preventDefault();
             setFilterDrawerOpen(true);
         }
         if (e.key.toLowerCase() === 'a') {
              e.preventDefault();
              handleOpenDrawer('add');
         }
         if (e.key.toLowerCase() === 'r') {
             e.preventDefault();
             loadHeaders();
         }
     };

     document.addEventListener('keydown', handleKeyDown);
     return () => document.removeEventListener('keydown', handleKeyDown);
  }, [drawerOpen, filterDrawerOpen, loadHeaders]);


  // ============================================================================
  // HANDLERS
  // ============================================================================

  const loadDetails = async (headerId: number) => {
    try {
      const response = await api.banking.segmentation.getDetails(headerId);
      setDetails(Array.isArray(response) ? response : []);
    } catch (err) {
      setDetails([]);
    }
  };

  const handleOpenDrawer = async (mode: 'add' | 'edit' | 'view', header?: SegmentationHeader) => {
    setDrawerMode(mode);
    setDrawerOpen(true);
    
    if (header) {
      setSelectedHeader(header);
      setFormData({ ...header }); 
      await loadDetails(header.id); 
    } else {
      setSelectedHeader(null);
      setDetails([]);
      setFormData({
        group_segment: '',
        segment: '',
        segment_type: 'PD',
        seq: totalCount + 1,
        active_flag: true
      });
    }
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
    setSelectedHeader(null);
  };


  const handleSaveHeader = async (isDraft: boolean) => {
    try {
      // If Draft, status = 'Draft', else 'Pending' or 'Submitted'
      const payload = { ...formData, rules: details, status: isDraft ? 'Draft' : 'Pending Approval' };

      if (drawerMode === 'edit') {
        if (!selectedHeader?.id) return;
        await api.banking.segmentation.updateHeader(selectedHeader.id, payload);
        alert(isDraft ? 'Saved as Draft' : 'Submitted for Approval');
      } else {
        await api.banking.segmentation.createHeader(payload);
        alert(isDraft ? 'Created Draft' : 'Created and Submitted');
      }
      setDrawerOpen(false);
      loadHeaders();
    } catch (err: any) {
       console.error(err);
       alert('Error saving data: ' + err.message);
    }
  };

  const handleDelete = async (header: SegmentationHeader) => {
     if (!confirm(`Are you sure you want to delete "${header.group_segment}"?`)) return;
     try {
       await api.banking.segmentation.deleteHeader(header.id);
       loadHeaders();
     } catch (err) { alert('Delete failed'); }
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <Container maxWidth="xl" sx={{ position: 'relative', pb: 5 }}>
      <FullstackIndicator />
      
      {/* Breadcrumbs */}
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
        <Link underline="hover" color="inherit" onClick={() => router.push('/banking/dashboard')} sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
          <HomeIcon sx={{ mr: 0.5, fontSize: 16 }} /> Dashboard
        </Link>
        <Link underline="hover" color="inherit" href="#">Collective</Link>
        <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
          <SegmentIcon sx={{ mr: 0.5, fontSize: 16 }} /> Segmentation
        </Typography>
      </Breadcrumbs>

      {/* Header Card */}
      <Card sx={{ mb: 3, borderRadius: 2 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
            <Box>
              <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
                Segmentation Configuration
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Master-detail configuration for portfolio segmentation rules and criteria
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
               <Tooltip title="Shortcut: R"><Button startIcon={<RefreshIcon />} onClick={() => loadHeaders()}>Refresh</Button></Tooltip>
               <Button startIcon={<ExportIcon />} onClick={(e) => setExportAnchorEl(e.currentTarget)}>Export</Button>
               <Menu anchorEl={exportAnchorEl} open={Boolean(exportAnchorEl)} onClose={() => setExportAnchorEl(null)}>
                  <MenuItem onClick={() => setExportAnchorEl(null)}>Export to Excel</MenuItem>
                  <MenuItem onClick={() => setExportAnchorEl(null)}>Export to CSV</MenuItem>
                  <MenuItem onClick={() => setExportAnchorEl(null)}>Export to PDF</MenuItem>
               </Menu>
               <Button variant="outlined" startIcon={<HelpIcon />}>Help</Button>
            </Box>
          </Box>
          <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
             <Typography variant="caption" color="text.secondary" sx={{ mr: 2 }}>
                Last updated: {new Date().toLocaleTimeString()}
             </Typography>
             <Chip label="Database Active" size="small" color="success" variant="outlined" />
          </Box>
        </CardContent>
      </Card>

      {/* Toolbar */}
      <Card sx={{ mb: 3, borderRadius: 2 }}>
        <CardContent sx={{ py: 2 }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <TextField
              inputRef={searchInputRef}
              placeholder="Search by group, segment, type... (/)"
              size="small"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              sx={{ flexGrow: 1 }}
              InputProps={{
                startAdornment: <InputAdornment position="start"><SearchIcon color="action" /></InputAdornment>
              }}
            />
            
            <Tooltip title="Shortcut: F">
                <Button variant="outlined" startIcon={<FilterIcon />} onClick={() => setFilterDrawerOpen(true)}>
                  Filters
                </Button>
            </Tooltip>
            
            <Tooltip title="Shortcut: A">
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDrawer('add')} sx={{ px: 4 }}>
                  Add Segmentation
                </Button>
            </Tooltip>
          </Stack>

          {(filters.segmentType || filters.status || filters.tableName) && (
            <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
               {filters.segmentType && <Chip label={`Type: ${filters.segmentType}`} onDelete={() => setFilters(prev => ({...prev, segmentType: ''}))} />}
               <Typography variant="caption" sx={{ alignSelf: 'center', cursor: 'pointer', textDecoration: 'underline' }} onClick={() => setFilters({segmentType: '', status: '', tableName: '', columnName: '', operator: ''})}>
                 Clear All
               </Typography>
            </Stack>
          )}
        </CardContent>
      </Card>

      {/* Error Alert */}
      {error && <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>{error}</Alert>}

      {/* Main Table */}
      <SegmentationTable 
        data={headers}
        loading={loading}
        page={page}
        rowsPerPage={rowsPerPage}
        totalCount={totalCount}
        selectedIds={selectedIds}
        onSelect={(id) => {
             const idx = selectedIds.indexOf(id);
             setSelectedIds(idx === -1 ? [...selectedIds, id] : selectedIds.filter(x => x !== id));
        }}
        onSelectAll={(checked) => setSelectedIds(checked ? headers.map(h => h.id) : [])}
        onView={(item) => handleOpenDrawer('view', item)}
        onEdit={(item) => handleOpenDrawer('edit', item)}
        onDelete={handleDelete}
        onDuplicate={() => {}} 
        onPageChange={setPage}
        onRowsPerPageChange={setRowsPerPage}
      />

      {/* Drawers */}
      <SegmentationDrawer
        open={drawerOpen}
        onClose={handleCloseDrawer}
        mode={drawerMode}
        initialData={selectedHeader}
        formData={formData}
        setFormData={setFormData}
        rules={details}
        onRulesChange={setDetails}
        onSaveHeader={handleSaveHeader}
        history={MOCK_HISTORY} 
      />

      <SegmentationFilterDrawer
        open={filterDrawerOpen}
        onClose={() => setFilterDrawerOpen(false)}
        onApply={(f: any) => { setFilters(f); setPage(0); }}
        onClear={() => setFilters({segmentType: '', status: '', tableName: '', columnName: '', operator: ''})}
        currentFilters={filters}
      />

    </Container>
  );
}
