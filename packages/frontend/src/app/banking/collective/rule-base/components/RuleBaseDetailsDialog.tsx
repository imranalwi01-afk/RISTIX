'use client';

import React, { memo, useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Typography,
} from '@mui/material';
import { bankingAPI } from '@/services/api';
import type { RuleBaseDetail, RuleBaseHeader } from '../types';

interface RuleBaseDetailsDialogProps {
  open: boolean;
  header: RuleBaseHeader | null;
  onClose: () => void;
  initialTab?: number;
}

const enterpriseTableSx = {
  tableLayout: 'fixed',
  '& .MuiTableCell-head': {
    bgcolor: '#f8fafc',
    color: 'text.secondary',
    fontSize: '0.72rem',
    fontWeight: 800,
    letterSpacing: 0,
    textTransform: 'uppercase',
    borderBottom: '1px solid',
    borderColor: 'divider',
    py: 1,
  },
  '& .MuiTableCell-body': {
    py: 0.85,
    borderColor: 'divider',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  '& .MuiTableRow-root:hover': {
    bgcolor: 'rgba(14, 165, 233, 0.04)',
  },
} as const;

const quoteValue = (value?: string | number | null) => {
  const text = String(value ?? '').trim();
  if (!text) return "''";
  if (/^-?\d+(\.\d+)?$/.test(text)) return text;
  return `'${text.replace(/'/g, "''")}'`;
};

const renderConditionExpression = (detail: RuleBaseDetail) => {
  const column = detail.column_name || 'column_name';
  const operator = String(detail.operator || '').trim().toUpperCase();
  if (operator === 'BETWEEN') {
    return `${column} BETWEEN ${quoteValue(detail.value1)} AND ${quoteValue(detail.value2)}`;
  }
  if (['IN', 'NOT IN'].includes(operator)) {
    const values = String(detail.value1 || '')
      .split(',')
      .map((value) => quoteValue(value.trim()))
      .join(', ');
    return `${column} ${operator} (${values || "''"})`;
  }
  if (['IS NULL', 'IS NOT NULL'].includes(operator)) {
    return `${column} ${operator}`;
  }
  return `${column} ${operator || '='} ${quoteValue(detail.value1)}`;
};

const buildRuleBaseQueryPreview = (header: RuleBaseHeader, details: RuleBaseDetail[]) => {
  const targetTable = header.updated_table || 'TARGET_TABLE';
  const targetColumn = header.updated_column || 'TARGET_COLUMN';
  const nextValue = quoteValue(header.value);
  const sortedDetails = [...details].sort((left, right) => {
    if (left.query_group !== right.query_group) return left.query_group - right.query_group;
    return left.seq - right.seq;
  });

  if (sortedDetails.length === 0) {
    return `UPDATE ${targetTable}\nSET ${targetColumn} = ${nextValue}\nWHERE <no rule details configured>;`;
  }

  const whereLines = sortedDetails.map((detail, index) => {
    const logic = index === 0 ? 'WHERE' : (detail.condition || 'AND');
    return `${logic} (${renderConditionExpression(detail)})`;
  });

  return [
    `UPDATE ${targetTable}`,
    `SET ${targetColumn} = ${nextValue}`,
    ...whereLines,
    ';',
  ].join('\n');
};

function RuleBaseDetailsDialogComponent({ open, header, onClose, initialTab = 0 }: RuleBaseDetailsDialogProps) {
  const [details, setDetails] = useState<RuleBaseDetail[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    let mounted = true;
    const loadDetails = async () => {
      if (!open || !header?.id) return;
      setLoading(true);
      setError(null);
      try {
        const response = await bankingAPI.ruleBaseSetting.getDetails(header.id);
        if (!mounted) return;
        if (response.success) {
          setDetails(response.data || []);
        } else {
          throw new Error(response.error || 'Failed to load rule details');
        }
      } catch (err) {
        if (!mounted) return;
        setDetails([]);
        setError(err instanceof Error ? err.message : 'Failed to load rule details');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    if (open) setTabValue(initialTab);
    loadDetails();
    return () => {
      mounted = false;
    };
  }, [header?.id, open]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>Rule Base Details</DialogTitle>
      <DialogContent>
        {header ? (
          <Box sx={{ pt: 1 }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1.4fr 1fr 1fr 1fr' }, gap: 2, mb: 2 }}>
              <Box>
                <Typography variant="caption" color="text.secondary">Rule Name</Typography>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{header.rule_name}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Type</Typography>
                <Box><Chip size="small" label={header.rule_type} color="primary" variant="outlined" /></Box>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Target</Typography>
                <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>{header.updated_table}.{header.updated_column}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Value</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>{header.value}</Typography>
              </Box>
            </Box>
            <Divider sx={{ mb: 2 }} />

            {error ? <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert> : null}

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress size={24} />
              </Box>
            ) : (
              <>
                <Tabs value={tabValue} onChange={(_, value) => setTabValue(value)} sx={{ mb: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                  <Tab label="Rules" />
                  <Tab label="Query Preview" />
                </Tabs>
                {tabValue === 0 && (
                  details.length === 0 ? (
                    <Alert severity="info">No rule details found for this header.</Alert>
                  ) : (
                    <TableContainer sx={{ maxHeight: 460, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                      <Table stickyHeader size="small" sx={enterpriseTableSx}>
                        <TableHead>
                          <TableRow>
                            <TableCell sx={{ width: 86 }}>Group</TableCell>
                            <TableCell sx={{ width: 72 }}>Seq</TableCell>
                            <TableCell sx={{ width: 180 }}>Table</TableCell>
                            <TableCell sx={{ width: 170 }}>Column</TableCell>
                            <TableCell sx={{ width: 110 }}>Data Type</TableCell>
                            <TableCell sx={{ width: 100 }}>Operator</TableCell>
                            <TableCell sx={{ width: 150 }}>Value 1</TableCell>
                            <TableCell sx={{ width: 150 }}>Value 2</TableCell>
                            <TableCell sx={{ width: 100 }}>Logic</TableCell>
                            <TableCell sx={{ width: 110 }}>Type</TableCell>
                            <TableCell sx={{ width: 130 }}>Stage</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {details.map((detail, index) => (
                            <TableRow key={detail.id ? `detail-${detail.id}` : `detail-${index}`} hover>
                              <TableCell><Chip label={detail.query_group} size="small" /></TableCell>
                              <TableCell>{detail.seq}</TableCell>
                              <TableCell sx={{ fontFamily: 'monospace' }}>{detail.table_name}</TableCell>
                              <TableCell sx={{ fontFamily: 'monospace' }}>{detail.column_name}</TableCell>
                              <TableCell><Chip label={detail.data_type} size="small" variant="outlined" /></TableCell>
                              <TableCell sx={{ fontWeight: 700 }}>{detail.operator}</TableCell>
                              <TableCell sx={{ fontFamily: 'monospace' }}>{detail.value1 || '-'}</TableCell>
                              <TableCell sx={{ fontFamily: 'monospace' }}>{detail.value2 || '-'}</TableCell>
                              <TableCell><Chip label={detail.condition} size="small" color={detail.condition === 'OR' ? 'secondary' : 'primary'} /></TableCell>
                              <TableCell>{detail.detail_type || '-'}</TableCell>
                              <TableCell>{[detail.stage_from, detail.stage_to].filter(Boolean).join(' -> ') || '-'}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )
                )}
                {tabValue === 1 && (
                  <Box sx={{ p: 3, bgcolor: '#1e293b', borderRadius: 1.5, minHeight: 220 }}>
                    <Typography variant="caption" color="primary.light" sx={{ fontWeight: 700, mb: 1.5, display: 'block' }}>
                      GENERATED RULE BASE QUERY
                    </Typography>
                    <Typography
                      component="pre"
                      sx={{
                        m: 0,
                        color: '#f8fafc',
                        fontFamily: '"Fira Code", monospace',
                        fontSize: '0.85rem',
                        lineHeight: 1.7,
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                      }}
                    >
                      {buildRuleBaseQueryPreview(header, details)}
                    </Typography>
                  </Box>
                )}
              </>
            )}
          </Box>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

export const RuleBaseDetailsDialog = memo(RuleBaseDetailsDialogComponent);
