// reportColumnHelpers.ts – Column generation utilities for BaseIfrs9Report
import React from 'react';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import { SafeDataGrid } from '@/components/shared/SafeDataGrid';
import { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';

/**
 * Generate dynamic columns from raw report data rows.
 * Inspects the first rows to infer column types, formatters, and widths.
 */
export const generateDynamicColumns = (data: Record<string, unknown>[]): GridColDef[] => {
  if (!data || data.length === 0) return [];

  const baseColumns: GridColDef[] = [];

  const formatHeaderName = (key: string) => {
    if (/^seq_\d+$/i.test(key)) {
      return `RECOVERY SEQ ${key.split('_')[1]}`;
    }
    const explicitLabels: Record<string, string> = {
      movement_order: 'MOVEMENT ORDER',
      movement: 'MOVEMENT',
      stage_1_collective: 'STAGE 1 COLLECTIVE',
      stage_2_collective: 'STAGE 2 COLLECTIVE',
      stage_3_collective: 'STAGE 3 COLLECTIVE',
      stage_1_individual: 'STAGE 1 INDIVIDUAL',
      stage_2_individual: 'STAGE 2 INDIVIDUAL',
      stage_3_individual: 'STAGE 3 INDIVIDUAL',
      total: 'TOTAL',
    };
    return explicitLabels[key] || key.replace(/_/g, ' ').toUpperCase();
  };

  const keySet = new Set<string>();
  for (const row of data) {
    Object.keys(row || {}).forEach((k) => keySet.add(k));
  }

  const firstRowKeys = Object.keys(data[0] || {});
  const extraKeys = Array.from(keySet).filter((k) => !firstRowKeys.includes(k)).sort();
  const orderedKeys = firstRowKeys.concat(extraKeys);

  const getSampleValue = (key: string) => {
    for (const row of data) {
      const v = (row as any)?.[key];
      if (v === null || v === undefined || v === '') continue;
      return v;
    }
    return undefined;
  };

  orderedKeys.forEach(key => {
    const value = getSampleValue(key);
    const column: GridColDef = {
      field: key,
      headerName: formatHeaderName(key),
      width: 150,
      sortable: true,
      filterable: true
    };

    if (typeof value === 'number' || (typeof value === 'string' && Number.isFinite(Number(value)))) {
      column.type = 'number';
      column.valueFormatter = (value: number | null | undefined) => {
        if (value === null || value === undefined) return '';
        return new Intl.NumberFormat('id-ID', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        }).format(value);
      };
      column.align = 'right';
      column.headerAlign = 'right';
    } else if (key.includes('date') || key.includes('_dt')) {
      column.type = 'date';
      column.valueFormatter = (value: string | number | Date | null | undefined) => {
        if (!value) return '';
        return new Date(value).toLocaleDateString('id-ID');
      };
      column.width = 120;
    } else if (typeof value === 'boolean') {
      column.type = 'boolean';
      column.renderCell = (params) => (
        <Chip
          size="small"
          label={params.value ? 'Yes' : 'No'}
          color={params.value ? 'success' : 'default'}
        />
      );
      column.width = 100;
    } else if (key === 'stage' || key.endsWith('_stage')) {
      column.renderCell = (params) => (
        <Chip
          size="small"
          label={`Stage ${params.value}`}
          color={params.value === 1 ? 'success' : params.value === 2 ? 'warning' : 'error'}
        />
      );
      column.width = 100;
    }

    if (key.includes('amount') || key.includes('balance') || key.includes('ecl')) {
      column.valueFormatter = (value: number | null | undefined) => {
        if (value === null || value === undefined) return '';
        return new Intl.NumberFormat('id-ID', {
          style: 'currency',
          currency: 'IDR',
          minimumFractionDigits: 0
        }).format(value);
      };
      column.width = 180;
    }

    if (key === 'movement') {
      column.width = 280;
    }

    if (/^seq_\d+$/i.test(key)) {
      column.width = 140;
    }

    if (!column.renderCell) {
      column.renderCell = (params: GridRenderCellParams) => (
        <Box sx={{ fontWeight: 500 }}>{params.formattedValue ?? params.value ?? ''}</Box>
      );
    }

    baseColumns.push(column);
  });

  return baseColumns;
};

/**
 * Render an expandable detail panel for Lifetime LGD rows.
 */
export const renderLifetimeLgdDetailPanel = (params: { row: any }): React.ReactNode => {
  const row = params.row || {};
  const detailRows = Array.isArray(row._detail_rows) ? row._detail_rows : [];
  const sequenceFieldSet = new Set<string>();

  detailRows.forEach((detailRow: Record<string, unknown>) => {
    Object.keys(detailRow || {}).forEach((key) => {
      if (/^seq_\d+$/.test(key)) {
        sequenceFieldSet.add(key);
      }
    });
  });

  const sequenceFields = Array.from(sequenceFieldSet).sort(
    (left: string, right: string) => Number(left.replace('seq_', '')) - Number(right.replace('seq_', ''))
  );

  const detailColumns: GridColDef[] = [
    { field: 'account_number', headerName: 'ACCOUNT_NUMBER', minWidth: 220, flex: 1 },
    { field: 'cif_name', headerName: 'CIF_NAME', minWidth: 260, flex: 1.1 },
    {
      field: 'first_npl_date',
      headerName: 'FIRST_NPL_DATE',
      minWidth: 180,
      valueFormatter: (value: string | null | undefined) => {
        if (!value) return '';
        const parsed = new Date(String(value));
        return Number.isNaN(parsed.getTime()) ? String(value) : parsed.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
      },
    },
    {
      field: 'os_at_default',
      headerName: 'OS_AT_DEFAULT',
      minWidth: 180,
      type: 'number',
    },
    ...sequenceFields.map((field: string): GridColDef => ({
      field,
      headerName: field.replace('seq_', ''),
      minWidth: 180,
      type: 'number' as const,
    })),
  ];

  return (
    <Box sx={{ p: 1, minWidth: 0 }}>
      <Box component="h3" sx={{ fontWeight: 800, mb: 2, fontSize: '1rem' }}>
        Lifetime LGD Detail
      </Box>
      {detailRows.length > 0 ? (
        <SafeDataGrid
          rows={detailRows}
          columns={detailColumns}
          getRowId={(detailRow) => detailRow.id || detailRow.account_id || detailRow.account_number || Math.random()}
          pagination
          paginationMode="client"
          initialState={{
            pagination: {
              paginationModel: {
                page: 0,
                pageSize: 10,
              },
            },
          }}
          pageSizeOptions={[10, 25, 50, 75, 100]}
          responsiveMode="scroll"
          showEnterpriseControls
          sx={{ width: '100%', maxWidth: '100%', minWidth: 0 }}
        />
      ) : (
        <Alert severity="info" sx={{ borderRadius: 2 }}>
          No account-level Lifetime LGD detail is available for this summary row.
        </Alert>
      )}
    </Box>
  );
};
