
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
  Drawer
} from '@mui/material';
import { api } from '../../../../services/api';
import { FullstackIndicator } from '@/components/common/feedback/FullstackIndicator';

// New High-Fidelity Components
import { SegmentationHeader } from '../../../../components/banking/collective/segmentation/SegmentationHeader';
import { SegmentationToolbar } from '../../../../components/banking/collective/segmentation/SegmentationToolbar';
import { SegmentationTable } from '../../../../components/banking/collective/segmentation/SegmentationTable';
import { SegmentationDetail } from '../../../../components/banking/collective/segmentation/SegmentationDetail';

// Hooks & Existing Services
import { bankingAPI } from '@/services/api';
import { ApprovalNotification, ApprovalStatusBadge } from '@/components/approval';
import { usePermission } from '@/hooks/usePermission';

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
  const [filters, setFilters] = useState({
    segmentType: '',
    status: '',
    tableName: '',
    columnName: '',
    operator: ''
  });

  // Detail View
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailMode, setDetailMode] = useState<'add' | 'edit' | 'view'>('view');
  const [selectedHeader, setSelectedHeader] = useState<SegmentationHeaderData | null>(null);

  // UI Feedback
  const [error, setError] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean, message: string, type: 'success' | 'info' | 'warning' | 'error' }>({ 
    open: false, message: '', type: 'success' 
  });
  const [approvalNotification, setApprovalNotification] = useState<{ open: boolean, message: string }>({ 
    open: false, message: '' 
  });
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);

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
    } catch (err: any) {
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
    setDetailOpen(true);
  };


  const handleSaveHeader = async (isDraft: boolean) => {
    if (!canManageSegmentation) return;
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
        // Auto-approve for development/demo user
        if (process.env.NODE_ENV === 'development') {
          console.log('🔓 Auto-approving delete request for development');
          try {
            await api.banking.approval.approveRequest(response.requestId, {
              comment: 'Auto-approved for development testing'
            });
            setSnackbar({ 
              open: true, 
              message: 'Segmentation deleted successfully (auto-approved)', 
              type: 'success' 
            });
          } catch (approveError) {
            console.error('Auto-approve failed:', approveError);
            setApprovalNotification({
              open: true,
              message: response.message || 'Deletion request submitted for approval'
            });
          }
        } else {
          setApprovalNotification({
            open: true,
            message: response.message || 'Deletion request submitted for approval'
          });
        }
      } else {
        setSnackbar({ open: true, message: 'Segmentation deleted successfully', type: 'success' });
      }
      
      loadHeaders();
      loadPendingApprovals();
    } catch (err: any) {
      setSnackbar({ 
        open: true, 
        message: err.response?.data?.message || 'Delete failed', 
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
        setApprovalNotification({
          open: true,
          message: response.message || 'Request submitted for approval'
        });
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
    } catch (err: any) {
      setSnackbar({ 
        open: true, 
        message: err.response?.data?.message || 'Save failed', 
        type: 'error' 
      });
    } finally {
      setLoading(false);
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
        onClose={() => setApprovalNotification({ ...approvalNotification, open: false })}
      />
    </Container>
  );
}
