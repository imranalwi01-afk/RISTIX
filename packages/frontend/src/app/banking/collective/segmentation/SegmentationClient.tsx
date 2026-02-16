
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
import { useApprovalStatus } from '@/hooks/useApprovalStatus';
import { bankingAPI } from '@/services/api';
import { ApprovalNotification, ApprovalStatusBadge } from '@/components/approval';
import { usePermission } from '@/hooks/usePermission';

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

const MOCK_HISTORY: any[] = [
  { id: '1', status: 'Approved', timestamp: '2026-02-09T08:00:00Z', user: 'Manager User', role: 'Approver', comment: 'Approved for production.' },
  { id: '2', status: 'Submitted', timestamp: '2026-02-08T14:30:00Z', user: 'Analyst User', role: 'Maker', comment: 'Ready for review.' },
  { id: '3', status: 'Draft', timestamp: '2026-02-08T10:00:00Z', user: 'Analyst User', role: 'Maker', comment: 'Initial creation.' },
];

export default function SegmentationClient() {
  const { hasAnyPermission } = usePermission();
  const canViewSegmentation = hasAnyPermission(['banking.collective.segmentation.view', 'banking.collective.segmentation.manage', 'banking.collective.manage', 'banking.collective', 'admin.super_admin']);
  const canManageSegmentation = hasAnyPermission(['banking.collective.segmentation.manage', 'banking.collective.segmentation.create', 'banking.collective.segmentation.update', 'banking.collective.segmentation.delete', 'banking.collective.manage', 'admin.super_admin']);
  const canExportSegmentation = hasAnyPermission(['banking.collective.segmentation.export', 'banking.collective.segmentation.manage', 'banking.collective.manage', 'admin.super_admin']);

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
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [approvalNotification, setApprovalNotification] = useState<{ open: boolean, message: string }>({ open: false, message: '' });

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

  const loadPendingApprovals = useCallback(async () => {
    try {
      const response = await bankingAPI.approval.getPendingApprovals();
      const requests = Array.isArray(response) ? response : response.data || [];
      setPendingRequests(requests.filter((r: any) => r.entityType === 'segmentation'));
    } catch (err) {
      console.error('Error loading pending approvals:', err);
    }
  }, []);

  useEffect(() => {
    loadHeaders();
    loadPendingApprovals();
  }, [loadHeaders, loadPendingApprovals]);

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
        if (canManageSegmentation) handleOpenDrawer('add');
      }
      if (e.key.toLowerCase() === 'r') {
        e.preventDefault();
        loadHeaders();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [drawerOpen, filterDrawerOpen, loadHeaders, canManageSegmentation]);


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

  const handleSearch = () => {
    setPage(0);
    loadHeaders();
  };

  const handleOpenDrawer = async (mode: 'add' | 'edit' | 'view', header?: SegmentationHeader) => {
    if (mode !== 'view' && !canManageSegmentation) return;
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
    if (!canManageSegmentation) return;
    try {
      const payload = { ...formData, rules: details };

      let response: any;
      if (drawerMode === 'edit') {
        if (!selectedHeader?.id) return;
        response = await api.banking.segmentation.updateHeader(selectedHeader.id, payload);
      } else {
        response = await api.banking.segmentation.createHeader(payload);
      }

      const isApprovalResponse = response.approvalRequired || response.status === 202;

      if (isApprovalResponse) {
        setApprovalNotification({
          open: true,
          message: response.message || 'Request submitted for approval'
        });
      } else {
        setSnackbar({
          open: true,
          message: drawerMode === 'edit' ? 'Segmentation updated' : 'Segmentation created',
          type: 'success'
        });
      }

      setDrawerOpen(false);
      loadHeaders();
      loadPendingApprovals();
    } catch (err: any) {
      console.error(err);
      setSnackbar({ open: true, message: 'Error saving data: ' + err.message, type: 'error' });
    }
  };

  const handleDelete = async (header: SegmentationHeader) => {
    if (!canManageSegmentation) return;
    if (!confirm(`Are you sure you want to delete "${header.group_segment}"?`)) return;
    try {
      const response = await api.banking.segmentation.deleteHeader(header.id);
      const isApprovalResponse = response.approvalRequired || response.status === 202;

      if (isApprovalResponse) {
        setApprovalNotification({
          open: true,
          message: response.message || 'Deletion request submitted for approval'
        });
      } else {
        setSnackbar({ open: true, message: 'Segmentation deleted', type: 'success' });
      }
      loadHeaders();
      loadPendingApprovals();
    } catch (err) { setSnackbar({ open: true, message: 'Delete failed', type: 'error' }); }
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <Container maxWidth="xl" sx={{ position: 'relative', pb: 5 }}>
      <FullstackIndicator />
      {!canViewSegmentation && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          You do not have permission to view segmentation configuration.
        </Alert>
      )}

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
              {canExportSegmentation && (
                <>
                  <Button startIcon={<ExportIcon />} onClick={(e) => setExportAnchorEl(e.currentTarget)}>Export</Button>
                  <Menu anchorEl={exportAnchorEl} open={Boolean(exportAnchorEl)} onClose={() => setExportAnchorEl(null)}>
                    <MenuItem onClick={() => setExportAnchorEl(null)}>Export to Excel</MenuItem>
                    <MenuItem onClick={() => setExportAnchorEl(null)}>Export to CSV</MenuItem>
                    <MenuItem onClick={() => setExportAnchorEl(null)}>Export to PDF</MenuItem>
                  </Menu>
                </>
              )}
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
              {canManageSegmentation ? (
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDrawer('add')} sx={{ px: 4 }}>
                  Add Segmentation
                </Button>
              ) : (
                <span />
              )}
            </Tooltip>
          </Stack>

          {(filters.segmentType || filters.status || filters.tableName) && (
            <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
              {filters.segmentType && <Chip label={`Type: ${filters.segmentType}`} onDelete={() => setFilters(prev => ({ ...prev, segmentType: '' }))} />}
              <Typography variant="caption" sx={{ alignSelf: 'center', cursor: 'pointer', textDecoration: 'underline' }} onClick={() => setFilters({ segmentType: '', status: '', tableName: '', columnName: '', operator: '' })}>
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
        canManage={canManageSegmentation}
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
        onDuplicate={() => { }}
        onPageChange={setPage}
        onRowsPerPageChange={setRowsPerPage}
        pendingRequests={pendingRequests}
      />

      {/* Drawers */}
      <SegmentationDrawer
        open={drawerOpen}
        onClose={handleCloseDrawer}
        mode={drawerMode}
        canManage={canManageSegmentation}
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
        onClear={() => setFilters({ segmentType: '', status: '', tableName: '', columnName: '', operator: '' })}
        currentFilters={filters}
      />

      <ApprovalNotification
        open={approvalNotification.open}
        message={approvalNotification.message}
        onClose={() => setApprovalNotification({ ...approvalNotification, open: false })}
      />

    </Container>
  );
}
