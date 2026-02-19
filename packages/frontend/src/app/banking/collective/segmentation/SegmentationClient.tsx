
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
import { ApprovalNotification } from '@/components/approval';

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
      if (e.key.toLowerCase() === 'r') {
        e.preventDefault();
        loadHeaders();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [detailOpen, loadHeaders]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleAdd = () => {
    setDetailMode('add');
    setSelectedHeader(null);
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

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <Container maxWidth="xl" sx={{ position: 'relative', pb: 5 }}>
      <FullstackIndicator />

      {/* Header Section */}
      <SegmentationHeader 
        onRefresh={loadHeaders}
        onExport={handleExport}
        onHelp={() => window.open('#', '_blank')}
        lastUpdated={new Date().toLocaleTimeString()}
        dbStatus="active"
      />

      {/* Toolbar Section */}
      <SegmentationToolbar 
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onSearchSubmit={loadHeaders}
        onFilterClick={() => {}} // TODO: Connect Filter Drawer
        onAddClick={handleAdd}
        activeFiltersCount={Object.values(filters).filter(Boolean).length}
        onClearFilters={() => setFilters({ segmentType: '', status: '', tableName: '', columnName: '', operator: '' })}
        searchInputRef={searchInputRef}
      />

      {/* Error Feedback */}
      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Data Table */}
      <SegmentationTable 
        data={headers}
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

      {/* Detail Drawer */}
      <Drawer
        anchor="right"
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        PaperProps={{ sx: { width: { xs: '100%', md: '85%' }, maxWidth: 1200 } }}
      >
        <SegmentationDetail 
            key={selectedHeader?.id || (detailMode === 'add' ? 'new' : 'none')}
            mode={detailMode}
            initialData={selectedHeader}
            onSubmit={handleSave}
            onClose={() => setDetailOpen(false)}
        />
      </Drawer>

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
