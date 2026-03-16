
// packages/frontend/src/app/banking/collective/segmentation/SegmentationClient.tsx
// ============================================================================
// IFRS9 FRONTEND - SEGMENTATION PARAMETER PAGE (OVERHAULED)
// ============================================================================

'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Container,
  Alert,
  Snackbar,
  Box,
  Card,
  CardContent,
  Typography,
  Tooltip,
  Button,
  Chip,
  Menu,
  MenuItem
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Download as ExportIcon,
  HelpOutline as HelpIcon
} from '@mui/icons-material';
import { api } from '../../../../services/api';
import { FullstackIndicator } from '@/components/common/feedback/FullstackIndicator';

// New High-Fidelity Components
import { SegmentationHeader } from '../../../../components/banking/collective/segmentation/SegmentationHeader';
import { SegmentationToolbar } from '../../../../components/banking/collective/segmentation/SegmentationToolbar';
import { SegmentationTable } from '../../../../components/banking/collective/segmentation/SegmentationTable';
import { SegmentationDetail } from '../../../../components/banking/collective/segmentation/SegmentationDetail';
import { SegmentationDetailContainer } from '../../../../components/banking/collective/segmentation/SegmentationDetailContainer';
import SegmentationFilterDrawer from './components/SegmentationFilterDrawer';

// Hooks & Existing Services
import { bankingAPI } from '@/services/api';
import {
  ApprovalNotification,
  ApprovalStatusBadge,
  buildApprovalNotification,
  createClosedApprovalNotification,
  type ApprovalNotificationState,
} from '@/components/approval';
import { usePermission } from '@/hooks/usePermission';
import { getErrorMessage } from '@/utils/error-message';

// ============================================================================
// TYPES
// ============================================================================

interface SegmentationHeaderData {
  id: number;
  group_segment: string;
  segment: string;
  sub_segment?: string;
  segment_type: string;
  seq: number;
  active_flag: boolean;
  status?: string;
  updated_date?: string;
  rules?: any[];
}

const BANKING_TOP_OFFSET = 74; // Banking app bar (42) + breadcrumbs row (32)
const DETAIL_CONTAINER_VARIANT: 'modal' | 'drawer' = 'modal';
const EMPTY_FILTERS = {
  segmentType: '',
  status: '',
  tableName: '',
  columnName: '',
  operator: ''
};

export default function SegmentationClient() {
  const searchInputRef = useRef<HTMLInputElement>(null);

  // ============================================================================
  // STATE
  // ============================================================================

  // Data
  const [headers, setHeaders] = useState<SegmentationHeaderData[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [filters, setFilters] = useState(EMPTY_FILTERS);

  // Detail View
  const [exportAnchorEl, setExportAnchorEl] = useState<null | HTMLElement>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailMode, setDetailMode] = useState<'add' | 'edit' | 'view'>('view');
  const [selectedHeader, setSelectedHeader] = useState<SegmentationHeaderData | null>(null);

  // Permissions
  const { hasPermission, hasAnyPermission } = usePermission();
  const canManageSegmentation = hasPermission('banking.parameter.segmentation.manage');
  const canViewSegmentation = hasPermission('banking.parameter.segmentation.view');
  const canExportSegmentation = hasPermission('banking.parameter.segmentation.export');
  const canOpenApprovalInbox = hasAnyPermission(['approval.requests.approve', 'approval.all', 'admin.super_admin']);

  // UI Feedback
  const [error, setError] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean, message: string, type: 'success' | 'info' | 'warning' | 'error' }>({
    open: false, message: '', type: 'success'
  });
  const [approvalNotification, setApprovalNotification] = useState<ApprovalNotificationState>(
    createClosedApprovalNotification()
  );
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const activeFiltersCount = Object.values(filters).filter((v) => String(v || '').trim().length > 0).length;

  // ============================================================================
  // DATA LOADING
  // ============================================================================

  const loadHeaders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        search: searchTerm || undefined,
        limit: rowsPerPage,
        page: page, // FIXED: Backend expects 'page' (0-indexed), not offset
        ...filters
      };
      const response = await api.banking.segmentation.getHeaders(params);

      if (response && response.success) {
        setHeaders(response.data || []);
        setTotalCount(response.total || response.pagination?.total || (response.data?.length || 0));
      } else {
        setHeaders([]);
        setTotalCount(0);
      }
    } catch (err) {
      console.error('Error loading segmentation headers:', err);
      setError('Failed to load segmentation data. Please try again.');
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

  // ============================================================================
  // KEYBOARD SHORTCUTS
  // ============================================================================

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isInput = (e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).tagName === 'TEXTAREA';

      if (e.key === 'Escape') {
        if (detailOpen) setDetailOpen(false);
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
        if (canManageSegmentation) handleAddSegmentation();
      }
      if (e.key.toLowerCase() === 'r') {
        e.preventDefault();
        loadHeaders();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [filterDrawerOpen, loadHeaders, canManageSegmentation, totalCount]);


  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleSearch = () => {
    setPage(0);
    loadHeaders();
  };

  const handleApplyFilters = (nextFilters: typeof EMPTY_FILTERS) => {
    setFilters(nextFilters);
    setPage(0);
  };

  const handleClearFilters = () => {
    setFilters(EMPTY_FILTERS);
    setPage(0);
  };

  const handleAddSegmentation = () => {
    if (!canManageSegmentation) return;
    setDetailMode('add');
    setSelectedHeader({
      id: 0,
      group_segment: '',
      segment: '',
      sub_segment: '',
      segment_type: 'PD',
      seq: totalCount + 1,
      active_flag: true,
      status: 'Draft',
      rules: []
    });
    setDetailOpen(true);
  };

  const handleView = async (header: SegmentationHeaderData) => {
    setLoading(true);
    try {
      const details = await api.banking.segmentation.getDetails(header.id);
      setDetailMode('view');
      setSelectedHeader({ ...header, rules: details.data || details || [] });
      setDetailOpen(true);
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to load rules', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (header: SegmentationHeaderData) => {
    setLoading(true);
    try {
      const details = await api.banking.segmentation.getDetails(header.id);
      setDetailMode('edit');
      setSelectedHeader({ ...header, rules: details.data || details || [] });
      setDetailOpen(true);
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to load rules', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (header: SegmentationHeaderData) => {
    if (!window.confirm(`Are you sure you want to delete segment "${header.group_segment}"?`)) return;

    setLoading(true);
    try {
      const response = await api.banking.segmentation.deleteHeader(header.id);

      if (response.approvalRequired) {
        setApprovalNotification(buildApprovalNotification(response, 'Deletion request submitted for approval'));
      } else {
        setSnackbar({ open: true, message: 'Segmentation deleted successfully', type: 'success' });
      }

      loadHeaders();
      loadPendingApprovals();
    } catch (err) {
      setSnackbar({
        open: true,
        message: getErrorMessage(err, 'Delete failed'),
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDuplicate = async (header: SegmentationHeaderData) => {
    setLoading(true);
    try {
      const details = await api.banking.segmentation.getDetails(header.id);
      setDetailMode('add');
      setSelectedHeader({
        ...header,
        id: 0,
        status: 'Draft',
        rules: (details.data || details || []).map((r: any) => ({ ...r, id: undefined }))
      });
      setDetailOpen(true);
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to duplicate', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleExport = (format: string) => {
    setSnackbar({ open: true, message: `Exporting data as ${format.toUpperCase()}...`, type: 'info' });
    // Actual export logic would go here
  };

  const handleSave = async (data: any, isDraft: boolean) => {
    setLoading(true);
    try {
      const payload = {
        ...data,
        active_flag: isDraft ? false : data.active_flag
      };

      let response;
      if (detailMode === 'add') {
        response = await api.banking.segmentation.createHeader(payload);
      } else {
        response = await api.banking.segmentation.updateHeader(data.id, payload);
      }

      if (response.approvalRequired) {
        setApprovalNotification(buildApprovalNotification(response, 'Request submitted for approval'));
      } else {
        setSnackbar({
          open: true,
          message: `Segmentation ${detailMode === 'add' ? 'created' : 'updated'} successfully`,
          type: 'success'
        });
      }

      setDetailOpen(false);
      loadHeaders();
      loadPendingApprovals();
    } catch (err) {
      setSnackbar({
        open: true,
        message: getErrorMessage(err, 'Save failed'),
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
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

      {/* Header Section */}
      <SegmentationHeader
        onRefresh={loadHeaders}
        onExport={handleExport}
        onHelp={() => window.open('#', '_blank')}
        lastUpdated={new Date().toLocaleTimeString()}
        dbStatus="active"
      />

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

      {/* Error Feedback */}
      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <SegmentationToolbar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onSearchSubmit={handleSearch}
        onFilterClick={() => setFilterDrawerOpen(true)}
        onAddClick={handleAddSegmentation}
        activeFiltersCount={activeFiltersCount}
        onClearFilters={handleClearFilters}
        searchInputRef={searchInputRef}
        canManage={canManageSegmentation}
      />

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
          setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
        }}
        onSelectAll={(checked) => setSelectedIds(checked ? headers.map(h => h.id) : [])}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onDuplicate={handleDuplicate}
        onPageChange={setPage}
        onRowsPerPageChange={setRowsPerPage}
        pendingRequests={pendingRequests}
      />

      {detailOpen && selectedHeader && (
        <SegmentationDetailContainer
          open={detailOpen}
          onClose={() => setDetailOpen(false)}
          variant={DETAIL_CONTAINER_VARIANT}
          topOffset={BANKING_TOP_OFFSET}
        >
          <SegmentationDetail
            mode={detailMode}
            initialData={selectedHeader}
            onSubmit={(data, isDraft) => handleSave(data, isDraft)}
            onClose={() => setDetailOpen(false)}
          />
        </SegmentationDetailContainer>
      )}

      <SegmentationFilterDrawer
        open={filterDrawerOpen}
        onClose={() => setFilterDrawerOpen(false)}
        onApply={handleApplyFilters}
        onClear={handleClearFilters}
        currentFilters={filters}
      />

      {/* Notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.type} onClose={() => setSnackbar({ ...snackbar, open: false })} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>

      <ApprovalNotification
        open={approvalNotification.open}
        message={approvalNotification.message}
        requestId={approvalNotification.requestId}
        actionLabel={canOpenApprovalInbox ? 'Open Approval' : undefined}
        actionHref={canOpenApprovalInbox ? (approvalNotification.requestId ? `/banking/maintenance/approval?requestId=${encodeURIComponent(approvalNotification.requestId)}` : '/banking/maintenance/approval') : undefined}
        onClose={() => setApprovalNotification(createClosedApprovalNotification())}
      />
    </Container>
  );
}
