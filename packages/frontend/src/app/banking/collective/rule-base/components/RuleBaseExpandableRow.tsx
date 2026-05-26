'use client';

import React, { memo, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Typography,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import type { GridColDef } from '@mui/x-data-grid';
import { bankingAPI } from '@/services/api';
import { SafeDataGrid, SafeGridActionsCellItem } from '@/components/shared/SafeDataGrid';
import type { RuleBaseDetail, RuleBaseHeader } from '../types';

export type RuleBaseColumnKey =
  | 'id'
  | 'rule_name'
  | 'rule_type'
  | 'updated_table'
  | 'updated_column'
  | 'value'
  | 'seq'
  | 'status'
  | 'details';

interface RuleBaseExpandableRowProps {
  header: RuleBaseHeader;
  canManage: boolean;
  visibleColumns?: Record<RuleBaseColumnKey, boolean>;
  visibleColumnCount?: number;
  onViewDetails?: (header: RuleBaseHeader) => void;
  onEditHeader?: (header: RuleBaseHeader) => void;
  onDeleteHeader?: (header: RuleBaseHeader) => void;
  onCreateDetail: (headerId: number) => void;
  onEditDetail: (detail: RuleBaseDetail) => void;
  onDeleteDetail: (detail: RuleBaseDetail) => void;
  loading: boolean;
  refreshTrigger?: number;
  pendingRequests?: any[];
}

function RuleBaseExpandableRowComponent({
  header,
  canManage,
  onCreateDetail,
  onEditDetail,
  onDeleteDetail,
  loading,
  refreshTrigger,
}: RuleBaseExpandableRowProps) {
  const [details, setDetails] = useState<RuleBaseDetail[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const loadDetails = async () => {
    setLoadingDetails(true);
    try {
      const response = await bankingAPI.ruleBaseSetting.getDetails(header.id);
      if (response.success) {
        setDetails(response.data);
      } else {
        throw new Error(response.error || 'Failed to load rule details');
      }
    } catch (error) {
      console.error('Error loading rule details:', error);
      setDetails([]);
    } finally {
      setLoadingDetails(false);
    }
  };

  useEffect(() => {
    void loadDetails();
  }, [header.id, refreshTrigger]);

  const detailColumns = useMemo<GridColDef<RuleBaseDetail>[]>(() => [
    {
      field: 'query_group',
      headerName: 'Group',
      width: 100,
      renderCell: (params) => <Chip label={params.value} size="small" color="info" />,
    },
    {
      field: 'seq',
      headerName: 'Seq',
      width: 84,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'table_name',
      headerName: 'Table',
      minWidth: 180,
      flex: 1,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'column_name',
      headerName: 'Column',
      minWidth: 170,
      flex: 1,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'data_type',
      headerName: 'Data Type',
      width: 130,
      renderCell: (params) => <Chip label={params.value} size="small" variant="outlined" />,
    },
    {
      field: 'operator',
      headerName: 'Operator',
      width: 120,
      renderCell: (params) => (
        <Typography variant="body2" fontWeight="bold">
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'value1',
      headerName: 'Value 1',
      minWidth: 150,
      flex: 0.8,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
          {params.value || '-'}
        </Typography>
      ),
    },
    {
      field: 'value2',
      headerName: 'Value 2',
      minWidth: 150,
      flex: 0.8,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
          {params.value || '-'}
        </Typography>
      ),
    },
    {
      field: 'condition',
      headerName: 'Condition',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          color={params.value === 'AND' ? 'primary' : 'secondary'}
        />
      ),
    },
    {
      field: 'detail_type',
      headerName: 'Type',
      width: 120,
      renderCell: (params) => params.value || '-',
    },
    {
      field: 'actions',
      headerName: 'Actions',
      type: 'actions',
      width: 112,
      filterable: false,
      sortable: false,
      getActions: (params) => canManage ? [
        <SafeGridActionsCellItem
          key="edit"
          label="Edit Detail"
          icon={<EditIcon color="primary" />}
          onClick={() => onEditDetail(params.row)}
          disabled={loading}
          data-testid="edit-detail-btn"
        />,
        <SafeGridActionsCellItem
          key="delete"
          label="Delete Detail"
          icon={<DeleteIcon color="error" />}
          onClick={() => onDeleteDetail(params.row)}
          disabled={loading}
          data-testid="delete-detail-btn"
        />,
      ] : [],
    },
  ], [canManage, loading, onDeleteDetail, onEditDetail]);

  return (
    <Box sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 1.5 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, mb: 2 }}>
        <Box>
          <Typography variant="h6" fontWeight="bold">
            Rule Details
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {header.rule_name}
          </Typography>
        </Box>
        {canManage && (
          <Button
            size="small"
            startIcon={<AddIcon />}
            onClick={() => onCreateDetail(header.id)}
            disabled={loading}
            variant="outlined"
            data-testid="add-detail-btn"
          >
            Add Detail
          </Button>
        )}
      </Box>

      {loadingDetails ? (
        <Box display="flex" justifyContent="center" alignItems="center" py={3} gap={1.5}>
          <CircularProgress size={24} />
          <Typography variant="body2" color="text.secondary">
            Loading rule details...
          </Typography>
        </Box>
      ) : details.length === 0 ? (
        <Alert severity="info">No rule details found for this header.</Alert>
      ) : (
        <SafeDataGrid
          rows={details}
          columns={detailColumns}
          getRowId={(detail) => detail.id || `${header.id}-${detail.seq}-${detail.column_name}`}
          loading={loadingDetails}
          hideFooterPagination
          disableRowSelectionOnClick
          density="compact"
          tableStateKey={`collective-rule-base-details:${header.id}`}
        />
      )}
    </Box>
  );
}

export const RuleBaseExpandableRow = memo(RuleBaseExpandableRowComponent);
