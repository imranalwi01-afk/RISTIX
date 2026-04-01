'use client';

import React, { useMemo } from 'react';
import {
  Box,
  Chip,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';

interface AuditDiffViewerProps {
  oldValues?: unknown;
  newValues?: unknown;
}

interface DiffRow {
  path: string;
  changeType: 'added' | 'removed' | 'changed';
  before: string;
  after: string;
}

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value);

const formatValue = (value: unknown): string => {
  if (value === undefined) return 'undefined';
  if (value === null) return 'null';
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  return JSON.stringify(value);
};

const flattenValue = (value: unknown, prefix = ''): Record<string, unknown> => {
  if (Array.isArray(value)) {
    if (value.length === 0) return { [prefix || '(root)']: [] };
    return value.reduce<Record<string, unknown>>((acc, entry, index) => {
      const path = prefix ? `${prefix}[${index}]` : `[${index}]`;
      return { ...acc, ...flattenValue(entry, path) };
    }, {});
  }

  if (isPlainObject(value)) {
    const entries = Object.entries(value);
    if (entries.length === 0) return { [prefix || '(root)']: {} };

    return entries.reduce<Record<string, unknown>>((acc, [key, entryValue]) => {
      const path = prefix ? `${prefix}.${key}` : key;
      return { ...acc, ...flattenValue(entryValue, path) };
    }, {});
  }

  return { [prefix || '(root)']: value };
};

const buildDiffRows = (oldValues: unknown, newValues: unknown): DiffRow[] => {
  const oldFlat = flattenValue(oldValues);
  const newFlat = flattenValue(newValues);
  const paths = Array.from(new Set([...Object.keys(oldFlat), ...Object.keys(newFlat)])).sort();

  return paths.reduce<DiffRow[]>((rows, path) => {
    const beforeValue = oldFlat[path];
    const afterValue = newFlat[path];

    if (beforeValue === undefined && afterValue !== undefined) {
      rows.push({
        path,
        changeType: 'added' as const,
        before: '—',
        after: formatValue(afterValue),
      });
      return rows;
    }

    if (beforeValue !== undefined && afterValue === undefined) {
      rows.push({
        path,
        changeType: 'removed' as const,
        before: formatValue(beforeValue),
        after: '—',
      });
      return rows;
    }

    if (JSON.stringify(beforeValue) !== JSON.stringify(afterValue)) {
      rows.push({
        path,
        changeType: 'changed' as const,
        before: formatValue(beforeValue),
        after: formatValue(afterValue),
      });
    }

    return rows;
  }, []);
};

const getChangeColor = (changeType: DiffRow['changeType']): 'success' | 'error' | 'warning' => {
  switch (changeType) {
    case 'added':
      return 'success';
    case 'removed':
      return 'error';
    default:
      return 'warning';
  }
};

export default function AuditDiffViewer({ oldValues, newValues }: AuditDiffViewerProps) {
  const diffRows = useMemo(() => buildDiffRows(oldValues, newValues), [oldValues, newValues]);

  if (diffRows.length === 0) {
    return (
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>Field Changes</Typography>
        <Typography variant="body2" color="text.secondary">
          No field-level differences were recorded for this audit entry.
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
        <Typography variant="subtitle2">Field Changes</Typography>
        <Chip size="small" variant="outlined" label={`${diffRows.length} changed field(s)`} />
      </Stack>

      <TableContainer sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ width: '22%' }}>Field</TableCell>
              <TableCell sx={{ width: '14%' }}>Change</TableCell>
              <TableCell sx={{ width: '32%' }}>Before</TableCell>
              <TableCell sx={{ width: '32%' }}>After</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {diffRows.map((row) => (
              <TableRow key={`${row.path}-${row.changeType}`}>
                <TableCell sx={{ verticalAlign: 'top' }}>
                  <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
                    {row.path}
                  </Typography>
                </TableCell>
                <TableCell sx={{ verticalAlign: 'top' }}>
                  <Chip size="small" label={row.changeType} color={getChangeColor(row.changeType)} variant="outlined" />
                </TableCell>
                <TableCell sx={{ verticalAlign: 'top' }}>
                  <Box
                    component="pre"
                    sx={{
                      m: 0,
                      p: 1,
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                      bgcolor: 'grey.50',
                      borderRadius: 1,
                      fontSize: '0.75rem',
                    }}
                  >
                    {row.before}
                  </Box>
                </TableCell>
                <TableCell sx={{ verticalAlign: 'top' }}>
                  <Box
                    component="pre"
                    sx={{
                      m: 0,
                      p: 1,
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                      bgcolor: 'success.50',
                      borderRadius: 1,
                      fontSize: '0.75rem',
                    }}
                  >
                    {row.after}
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}
