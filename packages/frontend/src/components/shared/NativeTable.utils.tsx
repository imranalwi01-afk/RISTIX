'use client';

import React, { useEffect, useState } from 'react';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import type { EnterpriseColumnFilterValue, EnterpriseDensity, EnterpriseFilterDefinition } from '@/types/enterprise-table';
import type { NativeTableColumn } from './NativeTable.types';
import { COLUMN_FILTER_COMMIT_DEBOUNCE_MS, NATIVE_TABLE_STATE_VERSION } from './NativeTable.types';

// ---------------------------------------------------------------------------
// DebouncedFilterTextField
// ---------------------------------------------------------------------------

interface DebouncedFilterTextFieldProps {
  value: string;
  placeholder: string;
  ariaLabel: string;
  minWidth?: number;
  onCommit: (value: string) => void;
}

export const DebouncedFilterTextField = React.memo(function DebouncedFilterTextField({
  value,
  placeholder,
  ariaLabel,
  minWidth,
  onCommit,
}: DebouncedFilterTextFieldProps) {
  const [draftValue, setDraftValue] = useState(value);

  useEffect(() => {
    setDraftValue(value);
  }, [value]);

  useEffect(() => {
    if (draftValue === value) return;

    const timer = window.setTimeout(() => {
      onCommit(draftValue);
    }, COLUMN_FILTER_COMMIT_DEBOUNCE_MS);

    return () => window.clearTimeout(timer);
  }, [draftValue, onCommit, value]);

  return (
    <TextField
      variant="standard"
      placeholder={placeholder}
      value={draftValue}
      onChange={(event) => setDraftValue(event.target.value)}
      onClick={(event) => event.stopPropagation()}
      size="small"
      fullWidth
      inputProps={{ 'aria-label': ariaLabel }}
      sx={{
        minWidth,
        '& .MuiInputBase-input': {
          fontSize: '0.8rem',
          py: 0.75,
        },
      }}
    />
  );
});

// ---------------------------------------------------------------------------
// Filter / Visibility helpers
// ---------------------------------------------------------------------------

export function isFilterValueBlank(value: EnterpriseColumnFilterValue) {
  if (value === undefined || value === null) return true;
  if (typeof value === 'string') return value.trim().length === 0;
  return false;
}

export function normalizeFilterMap(filters: Record<string, EnterpriseColumnFilterValue>) {
  const nextFilters: Record<string, EnterpriseColumnFilterValue> = {};

  Object.entries(filters).forEach(([key, value]) => {
    if (!isFilterValueBlank(value)) {
      nextFilters[key] = value;
    }
  });

  return nextFilters;
}

export function areFilterMapsEqual(
  left: Record<string, EnterpriseColumnFilterValue>,
  right: Record<string, EnterpriseColumnFilterValue>,
) {
  const leftEntries = Object.entries(normalizeFilterMap(left));
  const rightEntries = Object.entries(normalizeFilterMap(right));

  if (leftEntries.length !== rightEntries.length) return false;

  return leftEntries.every(([key, value]) => {
    const rightValue = right[key];
    return JSON.stringify(value) === JSON.stringify(rightValue);
  });
}

export function areVisibilityMapsEqual(left: Record<string, boolean>, right: Record<string, boolean>) {
  const leftKeys = Object.keys(left).sort();
  const rightKeys = Object.keys(right).sort();

  if (leftKeys.length !== rightKeys.length) return false;

  return leftKeys.every((key, index) => key === rightKeys[index] && left[key] === right[key]);
}

export function normalizeVisibilityModel(
  model: Record<string, boolean>,
  columns: NativeTableColumn[],
) {
  const allowedFields = new Set(columns.map((column) => String(column.field)));
  const nextModel: Record<string, boolean> = {};

  Object.entries(model).forEach(([field, visible]) => {
    if (allowedFields.has(field) && visible === false) {
      nextModel[field] = false;
    }
  });

  const visibleCount = columns.filter((column) => nextModel[String(column.field)] !== false).length;
  if (columns.length > 0 && visibleCount === 0) {
    delete nextModel[String(columns[0].field)];
  }

  return nextModel;
}

// ---------------------------------------------------------------------------
// LocalStorage persistence
// ---------------------------------------------------------------------------

export function readStoredTableState(storageKey: string) {
  if (typeof window === 'undefined') return null;

  try {
    const rawValue = window.localStorage.getItem(storageKey);
    if (!rawValue) return null;

    const parsed = JSON.parse(rawValue) as {
      version?: number;
      columnVisibilityModel?: Record<string, boolean>;
      density?: EnterpriseDensity;
    };

    if (parsed.version !== NATIVE_TABLE_STATE_VERSION) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writeStoredTableState(
  storageKey: string,
  state: {
    columnVisibilityModel: Record<string, boolean>;
    density: EnterpriseDensity;
  },
) {
  if (typeof window === 'undefined') return;

  try {
    window.localStorage.setItem(storageKey, JSON.stringify({
      version: NATIVE_TABLE_STATE_VERSION,
      ...state,
    }));
  } catch {
    // Storage can be blocked in private browsing or strict browser settings.
  }
}

// ---------------------------------------------------------------------------
// Pure cell / sort helpers (extracted from NativeTable orchestrator)
// ---------------------------------------------------------------------------

export function getCellValue(row: any, column: NativeTableColumn) {
  if (column.valueGetter) {
    return column.valueGetter({ row });
  }
  return row[column.field];
}

export function stringifyForFilter(value: any): string {
  if (value === null || value === undefined) return '';
  if (value instanceof Date) return value.toISOString();
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (React.isValidElement(value)) return '';
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

export function compareValues(left: any, right: any): number {
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
}

export function isColumnFilterable(column: NativeTableColumn, enableColumnFilters: boolean) {
  return enableColumnFilters && column.type !== 'actions' && column.filterable !== false;
}

export function isColumnSortable(column: NativeTableColumn, disableColumnSorting: boolean) {
  return !disableColumnSorting && column.type !== 'actions' && column.sortable !== false;
}

// ---------------------------------------------------------------------------
// ColumnFilterControl – renders the appropriate filter input for a column
// ---------------------------------------------------------------------------

export interface ColumnFilterControlProps {
  column: NativeTableColumn;
  filterDefinitions: Record<string, EnterpriseFilterDefinition>;
  draftColumnFilters: Record<string, EnterpriseColumnFilterValue>;
  effectiveColumnFilters: Record<string, EnterpriseColumnFilterValue>;
  columnFilterPlaceholder: string;
  onFilterChange: (field: string, value: EnterpriseColumnFilterValue) => void;
  onFilterCommit: (field: string, value: EnterpriseColumnFilterValue) => void;
}

export function ColumnFilterControl({
  column,
  filterDefinitions,
  draftColumnFilters,
  effectiveColumnFilters,
  columnFilterPlaceholder,
  onFilterChange,
  onFilterCommit,
}: ColumnFilterControlProps) {
  const field = String(column.field);
  const definition = filterDefinitions[field];

  if (definition?.type === 'date') {
    return (
      <Stack direction="row" spacing={1}>
        <TextField
          variant="standard"
          type="date"
          label="From"
          value={String(draftColumnFilters[`${field}.from`] || '')}
          onChange={(event) => onFilterChange(`${field}.from`, event.target.value)}
          size="small"
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          variant="standard"
          type="date"
          label="To"
          value={String(draftColumnFilters[`${field}.to`] || '')}
          onChange={(event) => onFilterChange(`${field}.to`, event.target.value)}
          size="small"
          InputLabelProps={{ shrink: true }}
        />
      </Stack>
    );
  }

  if (definition?.type === 'number') {
    return (
      <Stack direction="row" spacing={1}>
        <TextField
          variant="standard"
          type="number"
          placeholder="Min"
          value={String(draftColumnFilters[`${field}.min`] || '')}
          onChange={(event) => onFilterChange(`${field}.min`, event.target.value)}
          size="small"
        />
        <TextField
          variant="standard"
          type="number"
          placeholder="Max"
          value={String(draftColumnFilters[`${field}.max`] || '')}
          onChange={(event) => onFilterChange(`${field}.max`, event.target.value)}
          size="small"
        />
      </Stack>
    );
  }

  if (definition?.type === 'enum') {
    const enumOptions = Array.isArray(definition.options) ? definition.options : [];
    return (
      <TextField
        select
        variant="standard"
        value={String(draftColumnFilters[field] || '')}
        onChange={(event) => onFilterChange(field, event.target.value)}
        size="small"
        fullWidth
      >
        <MenuItem value="">All</MenuItem>
        {enumOptions.map((option) => (
          <MenuItem key={String(option.value)} value={String(option.value)}>
            {option.label}
          </MenuItem>
        ))}
      </TextField>
    );
  }

  if (definition?.type === 'boolean') {
    return (
      <TextField
        select
        variant="standard"
        value={draftColumnFilters[field] === true ? 'true' : draftColumnFilters[field] === false ? 'false' : ''}
        onChange={(event) => onFilterChange(field, event.target.value === 'true' ? true : event.target.value === 'false' ? false : '')}
        size="small"
        fullWidth
      >
        <MenuItem value="">All</MenuItem>
        <MenuItem value="true">Yes</MenuItem>
        <MenuItem value="false">No</MenuItem>
      </TextField>
    );
  }

  return (
    <DebouncedFilterTextField
      placeholder={columnFilterPlaceholder}
      value={String(effectiveColumnFilters[field] || '')}
      onCommit={(value) => onFilterCommit(field, value)}
      ariaLabel={`Search ${column.headerName}`}
      minWidth={column.minWidth || Math.min(column.width || 140, 220)}
    />
  );
}
