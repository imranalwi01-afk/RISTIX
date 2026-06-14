// packages/frontend/src/app/banking/setup/application/components/ApplicationDetailPanel.tsx
// ============================================================================
// Detail Panel Component - expandable row detail for application settings
// ============================================================================

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';

import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

import { SafeDataGrid } from '@/components/shared/SafeDataGrid';
import { GridColDef } from '@mui/x-data-grid';

import api from '@/services/api';
import { normalizeListPayload } from './constants';
import type { ApplicationSettingDetailDataTable } from './types';

interface ApplicationDetailPanelProps {
  row: any;
  onEditDetail: (detail: ApplicationSettingDetailDataTable, row: any) => void;
  onDeleteDetail: (detail: ApplicationSettingDetailDataTable, paramCode: string, refreshCallback: () => void) => void;
  onAddDetail: (row: any) => void;
  refreshTrigger: number;
  canManage?: boolean;
}

export const ApplicationDetailPanel = ({ row, onEditDetail, onDeleteDetail, onAddDetail, refreshTrigger, canManage = false }: ApplicationDetailPanelProps) => {
  const [details, setDetails] = useState<ApplicationSettingDetailDataTable[]>([]);
  const [loading, setLoading] = useState(true);

  const loadDetails = async () => {
    try {
      setLoading(true);
      const result = await api.applicationParameter.details.getForHeader(row.CommonCode);
      const items = normalizeListPayload<any>(result?.data);
      if (result.success && items.length > 0) {
        setDetails(items.map((item: any) => ({
          ID: item.id || item.pkid,
          SeqNo: item.param_seq || item.SeqNo,
          Value1: item.value1 || item.Value1,
          Value2: item.value2 || item.Value2 || '',
          Value3: item.value3 || item.Value3 || '',
          Description: item.param_desc || item.paramdesc || item.Description,
          pkid: item.pkid || item.id,
          param_code: item.param_code || row.CommonCode,
          param_seq: item.param_seq,
          value1: item.value1,
          value2: item.value2,
          value3: item.value3,
          paramdesc: item.param_desc || item.paramdesc || item.Description
        })));
      } else {
        setDetails([]);
      }
    } catch (error) {
      console.error('Failed to load details:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDetails();
  }, [row.CommonCode, refreshTrigger]);

  const detailColumns = useMemo<GridColDef[]>(() => [
    { field: 'SeqNo', headerName: 'Sequence', width: 120 },
    { field: 'Value1', headerName: 'Value 1', minWidth: 160, flex: 1 },
    { field: 'Value2', headerName: 'Value 2', minWidth: 160, flex: 1 },
    { field: 'Value3', headerName: 'Value 3', minWidth: 160, flex: 1 },
    { field: 'Description', headerName: 'Description', minWidth: 240, flex: 1.5 },
    {
      field: 'actions',
      headerName: 'Actions',
      type: 'actions',
      width: 112,
      filterable: false,
      sortable: false,
      renderCell: (params) => (
        canManage ? (
          <Box sx={{ display: 'flex' }}>
            <Tooltip title="Edit Detail">
              <IconButton size="small" color="primary" onClick={() => onEditDetail(params.row, row)}>
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete Detail">
              <IconButton size="small" color="error" onClick={() => onDeleteDetail(params.row, row.CommonCode, loadDetails)}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        ) : null
      ),
    },
  ], [canManage, loadDetails, onDeleteDetail, onEditDetail, row]);

  if (loading) return <Box sx={{ p: 2, textAlign: 'center' }}><CircularProgress size={20} /></Box>;

  return (
    <Box sx={{ p: 2, bgcolor: 'grey.50', width: '100%', maxWidth: '100%', minWidth: 0 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1.5, mb: 1 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
          Parameter Details for {row.CommonCode}
        </Typography>
        {canManage && (
          <Button
            size="small"
            startIcon={<AddIcon />}
            variant="contained"
            onClick={() => onAddDetail(row)}
          >
            Add Detail
          </Button>
        )}
      </Box>

      {details.length === 0 ? (
        <Typography variant="body2" color="text.secondary">No details found.</Typography>
      ) : (
        <SafeDataGrid
          rows={details}
          columns={detailColumns}
          getRowId={(detail) => detail.ID || detail.pkid || `${row.CommonCode}-${detail.SeqNo}`}
          hideFooterPagination
          disableRowSelectionOnClick
          density="compact"
          tableStateKey={`application-setting-details:${row.CommonCode}`}
        />
      )}
    </Box>
  );
};
