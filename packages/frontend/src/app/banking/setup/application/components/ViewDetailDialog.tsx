// packages/frontend/src/app/banking/setup/application/components/ViewDetailDialog.tsx
// ============================================================================
// View Detail Dialog - shows header info and detail table for a setting
// ============================================================================

'use client';

import React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Typography from '@mui/material/Typography';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';

import { SafeDataGrid } from '@/components/shared/SafeDataGrid';
import { GridColDef } from '@mui/x-data-grid';

import api, { handleAPIError } from '@/services/api';
import {
  buildApprovalNotification,
  buildApprovalConflictNotification,
  type ApprovalNotificationState,
} from '@/components/approval';
import type { ApplicationSettingDataTable, ApplicationSettingDetailDataTable } from './types';

interface ViewDetailDialogProps {
  open: boolean;
  onClose: () => void;
  selectedRecord: ApplicationSettingDataTable | null;
  detailData: ApplicationSettingDetailDataTable[];
  detailLoading: boolean;
  canManageApplication: boolean;
  handleCreateDetail: () => void;
  loadDetailData: (paramCode: string) => Promise<void>;
  setDetailLoading: (loading: boolean) => void;
  setSelectedDetail: (detail: ApplicationSettingDetailDataTable | null) => void;
  setDetailFormData: (data: any) => void;
  setDetailModalOpen: (open: boolean) => void;
  setApprovalNotification: (notification: ApprovalNotificationState) => void;
  setSuccess: (msg: string | null) => void;
  setError: (msg: string | null) => void;
  showApprovalConflict: (error: unknown, fallbackMessage: string) => boolean;
}

export function ViewDetailDialog({
  open,
  onClose,
  selectedRecord,
  detailData,
  detailLoading,
  canManageApplication,
  handleCreateDetail,
  loadDetailData,
  setDetailLoading,
  setSelectedDetail,
  setDetailFormData,
  setDetailModalOpen,
  setApprovalNotification,
  setSuccess,
  setError,
  showApprovalConflict,
}: ViewDetailDialogProps) {
  const viewDetailColumns = React.useMemo<GridColDef[]>(() => [
    {
      field: 'sequence',
      headerName: 'Sequence',
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}>
          {params.row.param_seq ?? params.row.SeqNo}
        </Typography>
      ),
    },
    {
      field: 'value1',
      headerName: 'Value 1',
      minWidth: 160,
      flex: 1,
      sortable: false,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
          {params.row.value1 ?? params.row.Value1}
        </Typography>
      ),
    },
    {
      field: 'value2',
      headerName: 'Value 2',
      minWidth: 160,
      flex: 1,
      sortable: false,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
          {params.row.value2 ?? params.row.Value2 ?? '-'}
        </Typography>
      ),
    },
    {
      field: 'value3',
      headerName: 'Value 3',
      minWidth: 160,
      flex: 1,
      sortable: false,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
          {params.row.value3 ?? params.row.Value3 ?? '-'}
        </Typography>
      ),
    },
    {
      field: 'description',
      headerName: 'Description',
      minWidth: 260,
      flex: 1.4,
      sortable: false,
      renderCell: (params) => {
        const description = params.row.paramdesc ?? params.row.Description ?? '';
        return (
          <Typography variant="body2" title={description}>
            {description.length > 50 ? `${description.substring(0, 50)}...` : description}
          </Typography>
        );
      },
    },
    {
      field: 'actions',
      headerName: 'Actions',
      type: 'actions',
      width: 112,
      filterable: false,
      sortable: false,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          {canManageApplication && (
            <>
              <Tooltip title="Edit Detail">
                <IconButton
                  size="small"
                  color="primary"
                  onClick={() => {
                    const detail = params.row;
                    setSelectedDetail(detail);
                    setDetailFormData({
                      ParamCode: detail.param_code ?? '',
                      SeqNo: detail.param_seq ?? 0,
                      Value1: detail.value1 ?? '',
                      Value2: detail.value2 ?? '',
                      Value3: detail.value3 ?? '',
                      Description: detail.paramdesc ?? ''
                    });
                    setDetailModalOpen(true);
                  }}
                  data-testid="btn-edit-detail"
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Delete Detail">
                <IconButton
                  size="small"
                  color="error"
                  data-testid="btn-delete-detail"
                  onClick={async () => {
                    const detail = params.row;
                    if (!confirm(`Are you sure you want to delete detail sequence ${detail.param_seq ?? detail.SeqNo}?`)) {
                      return;
                    }
                    try {
                      setDetailLoading(true);
                      const result = await api.applicationParameter.details.delete(detail.ID.toString());
                      await loadDetailData(selectedRecord?.CommonCode || '');
                      if (result?.approvalRequired) {
                        setApprovalNotification(buildApprovalNotification(result, 'Detail deletion submitted for approval'));
                      } else {
                        setSuccess('Parameter detail deleted successfully');
                      }
                    } catch (error) {
                      console.error('❌ Failed to delete detail:', error);
                      if (!showApprovalConflict(error, 'Detail deletion submitted for approval')) {
                        setError(`Failed to delete detail: ${handleAPIError(error).message}`);
                      }
                    } finally {
                      setDetailLoading(false);
                    }
                  }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </>
          )}
        </Box>
      ),
    },
  ], [canManageApplication, loadDetailData, selectedRecord?.CommonCode, setApprovalNotification, setDetailFormData, setDetailLoading, setDetailModalOpen, setError, setSelectedDetail, setSuccess, showApprovalConflict]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        Application Setting Details - {selectedRecord?.CommonCode}
      </DialogTitle>
      <DialogContent sx={{ mt: 2 }}>
        {selectedRecord && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Header Information
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ minWidth: 200 }}>
                <Typography variant="body2" color="text.secondary">Common Code:</Typography>
                <Typography variant="body1" sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}>
                  {selectedRecord.CommonCode}
                </Typography>
              </Box>
              <Box sx={{ minWidth: 200 }}>
                <Typography variant="body2" color="text.secondary">Parameter Name:</Typography>
                <Typography variant="body1">
                  {selectedRecord.Description}
                </Typography>
              </Box>
              <Box sx={{ minWidth: 300 }}>
                <Typography variant="body2" color="text.secondary">Usage Description:</Typography>
                <Typography variant="body1">
                  {selectedRecord.Value}
                </Typography>
              </Box>
              <Box sx={{ minWidth: 200 }}>
                <Typography variant="body2" color="text.secondary">Created By:</Typography>
                <Typography variant="body1">
                  {selectedRecord.CreatedBy}
                </Typography>
              </Box>
              <Box sx={{ minWidth: 200 }}>
                <Typography variant="body2" color="text.secondary">Created Date:</Typography>
                <Typography variant="body1">
                  {new Date(selectedRecord.CreatedDate).toLocaleString()}
                </Typography>
              </Box>
            </Box>
          </Box>
        )}

        <Box sx={{ my: 2, borderTop: 1, borderBottom: 1, borderColor: 'divider', py: 1 }} />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            Parameter Details
          </Typography>
          {canManageApplication && (
            <Button
              variant="contained"
              size="small"
              startIcon={<AddIcon />}
              onClick={handleCreateDetail}
              disabled={detailLoading}
              data-testid="btn-add-detail"
            >
              Add Detail
            </Button>
          )}
        </Box>

        {detailLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
            <CircularProgress size={24} />
          </Box>
        )}

        {!detailLoading && detailData.length === 0 && (
          <Alert severity="info" sx={{ mb: 2 }}>
            No details configured for this parameter.
            {canManageApplication && (
              <Button
                size="small"
                startIcon={<AddIcon />}
                sx={{ ml: 1 }}
                onClick={handleCreateDetail}
              >
                Add First Detail
              </Button>
            )}
          </Alert>
        )}

        {!detailLoading && detailData.length > 0 && (
          <SafeDataGrid
            rows={detailData}
            columns={viewDetailColumns}
            getRowId={(detail) => detail.ID || detail.pkid || `${detail.param_code}-${detail.param_seq}`}
            hideFooterPagination
            disableRowSelectionOnClick
            density="compact"
            tableStateKey={`application-setting-view-details:${selectedRecord?.CommonCode || 'unknown'}`}
          />
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
