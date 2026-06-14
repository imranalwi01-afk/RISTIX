// packages/frontend/src/app/banking/setup/application/components/constants.ts
// ============================================================================
// Constants, field maps, and utility functions for Application Settings
// ============================================================================

import type { EnterpriseColumnFilterValue, EnterpriseSort } from '@/types/enterprise-table';
import type { ApplicationSettingDataTable } from './types';

export const APPLICATION_EXPORT_COLUMNS = [
  { field: 'CommonCode', headerName: 'Common Code' },
  { field: 'Description', headerName: 'Description' },
  { field: 'Value', headerName: 'Value' },
  { field: 'CreatedBy', headerName: 'Created By' },
  { field: 'CreatedDate', headerName: 'Created Date' },
  { field: 'UpdatedBy', headerName: 'Updated By' },
  { field: 'UpdatedDate', headerName: 'Updated Date' },
] as const;

export const APPLICATION_FILTER_FIELD_MAP: Record<string, string> = {
  CommonCode: 'commonCode',
  Description: 'description',
  Value: 'value',
  CreatedBy: 'createdBy',
};

export const APPLICATION_SORT_FIELD_MAP: Record<string, string> = {
  CommonCode: 'commonCode',
  Description: 'description',
  Value: 'value',
  CreatedBy: 'createdBy',
  CreatedDate: 'createdDate',
  UpdatedDate: 'updatedDate',
};

export const CURRENCY_SYMBOL_PARAM_CODE = 'CURRDSPLY';
export const LOCAL_CURRENCY_SYMBOL_KEY = 'ifrs9:showCurrencySymbol';

export const normalizeListPayload = <T,>(value: unknown): T[] => {
  if (Array.isArray(value)) return value as T[];
  if (value && typeof value === 'object') {
    const nestedData = (value as { data?: unknown }).data;
    const nestedRows = (value as { rows?: unknown }).rows;
    if (Array.isArray(nestedData)) return nestedData as T[];
    if (Array.isArray(nestedRows)) return nestedRows as T[];
  }
  return [];
};

export const normalizeApplicationFilterValue = (value: EnterpriseColumnFilterValue) => {
  if (value === null || value === undefined) return '';
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  if (Array.isArray(value)) return value.join(' ');
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
};

export const getApplicationFieldValue = (row: ApplicationSettingDataTable, field: string): EnterpriseColumnFilterValue => {
  const record = row as unknown as Record<string, unknown>;
  return record[field] as EnterpriseColumnFilterValue;
};

export const compareApplicationValues = (left: unknown, right: unknown) => {
  if (left === right) return 0;
  if (left === null || left === undefined) return 1;
  if (right === null || right === undefined) return -1;

  const leftNumber = typeof left === 'number' ? left : Number(left);
  const rightNumber = typeof right === 'number' ? right : Number(right);
  if (!Number.isNaN(leftNumber) && !Number.isNaN(rightNumber)) {
    return leftNumber - rightNumber;
  }

  const leftDate = left instanceof Date ? left.getTime() : Date.parse(String(left));
  const rightDate = right instanceof Date ? right.getTime() : Date.parse(String(right));
  if (!Number.isNaN(leftDate) && !Number.isNaN(rightDate)) {
    return leftDate - rightDate;
  }

  return String(left).localeCompare(String(right), undefined, {
    numeric: true,
    sensitivity: 'base',
  });
};

export const applyApplicationTableQuery = (
  rows: ApplicationSettingDataTable[],
  columnFilters: Record<string, EnterpriseColumnFilterValue>,
  sort: EnterpriseSort[],
) => {
  const activeFilters = Object.entries(columnFilters).filter(([, value]) => normalizeApplicationFilterValue(value).trim().length > 0);
  const filteredRows = activeFilters.length === 0
    ? rows
    : rows.filter((row) =>
        activeFilters.every(([field, value]) =>
          normalizeApplicationFilterValue(getApplicationFieldValue(row, field)).toLowerCase().includes(normalizeApplicationFilterValue(value).toLowerCase())
        )
      );

  const activeSort = sort[0];
  if (!activeSort) return filteredRows;

  return [...filteredRows].sort((leftRow, rightRow) => {
    const leftValue = getApplicationFieldValue(leftRow, activeSort.field);
    const rightValue = getApplicationFieldValue(rightRow, activeSort.field);
    const result = compareApplicationValues(leftValue, rightValue);
    return activeSort.direction === 'asc' ? result : -result;
  });
};
