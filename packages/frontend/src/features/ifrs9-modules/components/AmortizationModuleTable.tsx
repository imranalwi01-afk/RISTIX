'use client';

import React, { useMemo } from 'react';
import type { GridColDef } from '@mui/x-data-grid';
import { SafeDataGrid } from '@/components/shared/SafeDataGrid';
import type { AmortizationModuleRowViewModel } from '../domain/ifrs9-modules.models';

interface AmortizationModuleTableProps {
  rows: AmortizationModuleRowViewModel[];
  totalCount: number;
  page: number;
  rowsPerPage: number;
  loading: boolean;
  selectedPkid: string | null;
  detailSupported: boolean;
  onSelectRow: (pkid: string) => void;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rowsPerPage: number) => void;
}

function normalizeCurrencyCode(currency: string | null | undefined) {
  const normalized = String(currency ?? 'IDR').trim().toUpperCase();
  return /^[A-Z]{3}$/.test(normalized) ? normalized : 'IDR';
}

function formatCurrency(amount: number | null | undefined, currency = 'IDR') {
  const safeCurrency = normalizeCurrencyCode(currency);
  const safeAmount = Number.isFinite(Number(amount)) ? Number(amount) : 0;

  try {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: safeCurrency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(safeAmount);
  } catch {
    return new Intl.NumberFormat('id-ID', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(safeAmount);
  }
}

export function AmortizationModuleTable({
  rows,
  totalCount,
  page,
  rowsPerPage,
  loading,
  selectedPkid,
  detailSupported,
  onSelectRow,
  onPageChange,
  onRowsPerPageChange,
}: AmortizationModuleTableProps) {
  const columns = useMemo<GridColDef<AmortizationModuleRowViewModel>[]>(() => [
    { field: 'prcDate', headerName: 'PRC Date', width: 130 },
    { field: 'accountNumber', headerName: 'Account Number', minWidth: 170, flex: 1 },
    { field: 'cifName', headerName: 'Customer', minWidth: 190, flex: 1.2, renderCell: (params) => params.value || '-' },
    { field: 'facilityNumber', headerName: 'Facility Number', minWidth: 160, flex: 1, renderCell: (params) => params.value || '-' },
    { field: 'currency', headerName: 'Currency', width: 110, renderCell: (params) => params.value || '-' },
    { field: 'amortizationType', headerName: 'Amortization Type', minWidth: 170, flex: 1, renderCell: (params) => params.value || '-' },
    {
      field: 'outstanding',
      headerName: 'Outstanding',
      width: 170,
      align: 'right',
      renderCell: (params) => formatCurrency(params.value, params.row.currency || 'IDR'),
    },
    {
      field: 'initialFeeAmt',
      headerName: 'Initial Fee',
      width: 160,
      align: 'right',
      renderCell: (params) => formatCurrency(params.value, params.row.currency || 'IDR'),
    },
    {
      field: 'initialCostAmt',
      headerName: 'Initial Cost',
      width: 160,
      align: 'right',
      renderCell: (params) => formatCurrency(params.value, params.row.currency || 'IDR'),
    },
    {
      field: 'unamortFeeAmt',
      headerName: 'Unamort Fee',
      width: 160,
      align: 'right',
      renderCell: (params) => formatCurrency(params.value, params.row.currency || 'IDR'),
    },
    {
      field: 'unamortCostAmt',
      headerName: 'Unamort Cost',
      width: 170,
      align: 'right',
      renderCell: (params) => formatCurrency(params.value, params.row.currency || 'IDR'),
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
      tableStateKey="ifrs9-amortization-module-table"
      fillAvailableHeight
      maxTableHeight="none"
    />
  );
}
