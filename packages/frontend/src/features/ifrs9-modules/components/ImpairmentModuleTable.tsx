'use client';

import React, { useMemo } from 'react';
import { Chip } from '@mui/material';
import type { GridColDef } from '@mui/x-data-grid';
import { SafeDataGrid } from '@/components/shared/SafeDataGrid';
import type { ImpairmentModuleRowViewModel } from '../domain/ifrs9-modules.models';

const ACCOUNT_STATUS_LABELS: Record<string, string> = {
  A: 'Active',
  N: 'Normal',
  I: 'Inactive',
  D: 'Default',
  C: 'Closed',
};

interface ImpairmentModuleTableProps {
  rows: ImpairmentModuleRowViewModel[];
  totalCount: number;
  page: number;
  rowsPerPage: number;
  loading: boolean;
  selectedPkid: string | null;
  detailSupported: boolean;
  hidePagination?: boolean;
  onSelectRow: (pkid: string) => void;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rowsPerPage: number) => void;
}

function formatCurrency(amount: number, currency: string | null | undefined = 'IDR') {
  const normalizedCurrency = currency ?? 'IDR';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: normalizedCurrency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number.isFinite(amount) ? amount : 0);
}

function normalizeStage(stage: number | string | null | undefined) {
  const numericStage = Number(stage);
  return Number.isFinite(numericStage) ? numericStage : 0;
}

export function ImpairmentModuleTable({
  rows,
  totalCount,
  page,
  rowsPerPage,
  loading,
  selectedPkid,
  detailSupported,
  hidePagination,
  onSelectRow,
  onPageChange,
  onRowsPerPageChange,
}: ImpairmentModuleTableProps) {
  const columns = useMemo<GridColDef<ImpairmentModuleRowViewModel>[]>(() => [
    { field: 'prcDate', headerName: 'PRC Date', width: 130 },
    { field: 'accountNumber', headerName: 'Account Number', minWidth: 170, flex: 1 },
    { field: 'facilityNumber', headerName: 'Facility Number', minWidth: 160, flex: 1, renderCell: (params) => params.value || '-' },
    { field: 'cifNumber', headerName: 'CIF Number', minWidth: 140, flex: 0.8, renderCell: (params) => params.value || '-' },
    { field: 'cifName', headerName: 'CIF Name', minWidth: 190, flex: 1.2, renderCell: (params) => params.value || '-' },
    { field: 'accountStatus', headerName: 'Account Status', width: 180, renderCell: (params) => {
        const value = params.value;
        if (!value) return '-';
        const label = ACCOUNT_STATUS_LABELS[String(value)];
        return label
          ? `${value} - ${label}`
          : String(value);
      } },
    { field: 'prdGroup', headerName: 'Product Group', minWidth: 160, flex: 1, renderCell: (params) => params.value || '-' },
    { field: 'segment', headerName: 'Segment', width: 140, renderCell: (params) => params.value || '-' },
    {
      field: 'stage',
      headerName: 'Stage',
      width: 120,
      renderCell: (params) => {
        const stage = normalizeStage(params.value);
        return (
          <Chip
            label={stage > 0 ? `Stage ${stage}` : 'N/A'}
            color={stage === 3 ? 'error' : stage === 2 ? 'warning' : 'success'}
            size="small"
          />
        );
      },
    },
    { field: 'bucketId', headerName: 'Bucket', width: 100, renderCell: (params) => params.value ?? '-' },
    { field: 'effInterestRate', headerName: 'EIR', width: 110, align: 'right', renderCell: (params) => {
        const value = params.value;
        if (value == null) return '-';
        return `${(Number(value) * 100).toFixed(2)}%`;
      }, valueFormatter: (value) => {
        if (value == null) return '-';
        return `${(Number(value) * 100).toFixed(2)}%`;
      } },
    {
      field: 'outstanding',
      headerName: 'Outstanding',
      width: 170,
      align: 'right',
      renderCell: (params) => formatCurrency(params.value, params.row.currency),
    },
    {
      field: 'eclFinalAmt',
      headerName: 'ECL Final',
      width: 170,
      align: 'right',
      renderCell: (params) => formatCurrency(params.value, params.row.currency),
    },
    {
      field: 'eclCoverage',
      headerName: 'ECL Coverage',
      width: 160,
      align: 'right',
      renderCell: (params) => `${(Number(params.value || 0) * 100).toFixed(4)}%`,
      valueFormatter: (value) => `${(Number(value || 0) * 100).toFixed(4)}%`,
    },
  ], []);

  return (
    <SafeDataGrid
      rows={rows}
      columns={columns}
      loading={loading}
      getRowId={(row) => row.pkid ?? `legacy-${row.accountId}-${row.accountNumber ?? row.facilityNumber ?? 'row'}`}
      rowCount={totalCount}
      paginationMode="offset"
      paginationModel={{ page, pageSize: rowsPerPage }}
      hideFooterPagination={hidePagination}
      onPaginationModelChange={(model) => {
        if (model.page !== page) onPageChange(model.page);
        if (model.pageSize !== rowsPerPage) onRowsPerPageChange(model.pageSize);
      }}
      pageSizeOptions={[10, 25, 50]}
      disableRowSelectionOnClick
      onRowClick={({ row }) => {
        if (detailSupported && row.pkid) onSelectRow(row.pkid);
      }}
      getRowSx={({ row }) => ({
        cursor: detailSupported && row.pkid ? 'pointer' : 'default',
        bgcolor: row.pkid && selectedPkid === row.pkid ? 'action.selected' : undefined,
      })}
      tableStateKey="ifrs9-impairment-module-table"
      fillAvailableHeight
      maxTableHeight="none"
    />
  );
}
