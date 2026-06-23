'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Box,
  IconButton,
  Stack,
  Chip,
  Tooltip,
  Autocomplete,
  CircularProgress,
  FormHelperText
} from '@mui/material';
import {
  Close as CloseIcon,
  Save as SaveIcon,
  Visibility as PreviewIcon,
  Storage as TableIcon,
  ViewColumn as ColumnIcon,
  SettingsEthernet as OperatorIcon
} from '@mui/icons-material';
import { api } from '@/services/api';

interface SegmentationRuleDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (rule: any) => void;
  initialRule?: any;
}

export default function SegmentationRuleDialog({
  open,
  onClose,
  onSave,
  initialRule
}: SegmentationRuleDialogProps) {
  const [formData, setFormData] = useState<any>({
    query_group: 1,
    seq: 1,
    table_name: '',
    column_name: '',
    data_type: '',
    operator: '=',
    value1: '',
    value2: '',
    condition: 'AND'
  });

  const [tables, setTables] = useState<string[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [operators, setOperators] = useState<string[]>([]);
  const [columnValues, setColumnValues] = useState<string[]>([]);

  const [loading, setLoading] = useState({
    tables: false,
    columns: false,
    operators: false,
    dataType: false,
    values: false
  });

  useEffect(() => {
    if (open) {
      loadTables();
      if (initialRule) {
        setFormData(initialRule);
        if (initialRule.table_name) {
          loadColumns(initialRule.table_name);
          if (initialRule.column_name) {
            loadColumnValues(initialRule.table_name, initialRule.column_name);
            if (initialRule.data_type) {
              loadOperators(initialRule.data_type);
            }
          }
        }
      } else {
        setFormData({
          query_group: 1,
          seq: 1,
          table_name: '',
          column_name: '',
          data_type: '',
          operator: '=',
          value1: '',
          value2: '',
          condition: 'AND'
        });
      }
    }
  }, [open, initialRule]);

  // --- Data Fetching ---

  const loadTables = async () => {
    setLoading(prev => ({ ...prev, tables: true }));
    try {
      const res = await api.banking.segmentation.getBusinessSettingsTables();
      setTables(Array.isArray(res) ? res : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(prev => ({ ...prev, tables: false }));
    }
  };

  const loadColumns = async (table: string) => {
    if (!table) return;
    setLoading(prev => ({ ...prev, columns: true }));
    try {
      const res = await api.banking.segmentation.getBusinessSettingsColumns(table);
      setColumns(Array.isArray(res) ? res : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(prev => ({ ...prev, columns: false }));
    }
  };

  const loadDataType = async (table: string, column: string) => {
    if (!table || !column) return;
    setLoading(prev => ({ ...prev, dataType: true }));
    try {
      const res = await api.banking.segmentation.getBusinessSettingsDataType(table, column);
      if (res) {
        handleChange('data_type', res);
        loadOperators(res);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(prev => ({ ...prev, dataType: false }));
    }
  };

  const loadOperators = async (dataType: string) => {
    if (!dataType) return;
    setLoading(prev => ({ ...prev, operators: true }));
    try {
      const res = await api.banking.segmentation.getBusinessSettingsOperators(dataType);
      setOperators(Array.isArray(res) ? res : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(prev => ({ ...prev, operators: false }));
    }
  };

  const loadColumnValues = async (table: string, column: string) => {
    if (!table || !column) return;
    setLoading(prev => ({ ...prev, values: true }));
    try {
      const res = await api.banking.segmentation.getBusinessSettingsValues(table, column);
      const values = res?.data ?? res;
      setColumnValues(Array.isArray(values) ? values : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(prev => ({ ...prev, values: false }));
    }
  };

  // --- Handlers ---

  const handleChange = (field: string, value: any) => {
    setFormData((prev: any) => {
      const newData = { ...prev, [field]: value };

      // Dynamic side effects
      if (field === 'table_name') {
        newData.column_name = '';
        newData.data_type = '';
        newData.operator = '=';
        newData.value1 = '';
        newData.value2 = '';
        loadColumns(value);
      }

      if (field === 'column_name') {
        newData.data_type = '';
        newData.operator = '=';
        newData.value1 = '';
        newData.value2 = '';
        loadDataType(prev.table_name || newData.table_name, value);
        loadColumnValues(prev.table_name || newData.table_name, value);
      }

      if (field === 'operator') {
        newData.value1 = '';
        newData.value2 = '';
      }

      if (field === 'data_type') {
        loadOperators(value);
      }

      return newData;
    });
  };

  const handleSubmit = () => {
    onSave(formData);
    onClose();
  };

  // --- Live Preview Helper ---
  const renderExpression = () => {
    const { condition, column_name, operator, value1, value2 } = formData;
    if (!column_name) return 'Definition incomplete...';

    let expr = `${condition} (${column_name} ${operator} `;
    if (operator === 'BETWEEN') {
      expr += `'${value1 || '?'}' AND '${value2 || '?'}'`;
    } else if (['IN', 'NOT IN'].includes(operator)) {
      expr += `(${value1 || '...'})`;
    } else {
      expr += `'${value1 || '?'}'`;
    }
    expr += ')';
    return expr;
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{ sx: { borderRadius: 2 } }}
    >
      <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: 'primary.main', color: 'primary.contrastText' }}>
        <Typography variant="h6" fontWeight="bold">
          Rule Definition Builder
        </Typography>
        <IconButton onClick={onClose} sx={{ color: 'primary.contrastText' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 4 }}>
        <Grid container spacing={4}>
          {/* Header row: Grouping & Priority */}
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              fullWidth
              label="Query Group"
              type="number"
              value={formData.query_group}
              onChange={(e) => handleChange('query_group', parseInt(e.target.value) || 1)}
              helperText="Logical grouping of rules (AND inside group)"
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              fullWidth
              label="Sequence"
              type="number"
              value={formData.seq}
              onChange={(e) => handleChange('seq', parseInt(e.target.value) || 1)}
              helperText="Execution order priority"
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <FormControl fullWidth>
              <InputLabel>Logic Condition</InputLabel>
              <Select
                value={formData.condition}
                label="Logic Condition"
                onChange={(e) => handleChange('condition', e.target.value)}
              >
                <MenuItem value="AND">AND (Append to group)</MenuItem>
                <MenuItem value="OR">OR (Start new condition)</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Table & Column Selection */}
          <Grid size={{ xs: 12, md: 6 }}>
            <FormControl fullWidth>
              <InputLabel sx={{ display: 'flex', alignItems: 'center' }}>
                <TableIcon sx={{ mr: 1, fontSize: 18 }} /> Source Table *
              </InputLabel>
              <Select
                value={formData.table_name}
                label="Source Table *"
                onChange={(e) => handleChange('table_name', e.target.value)}
              >
                {loading.tables ? <MenuItem disabled><CircularProgress size={20} /></MenuItem> : null}
                {tables.map((t, idx) => <MenuItem key={`${t}-${idx}`} value={t}>{t}</MenuItem>)}
              </Select>
              <FormHelperText>Source: Database tables (from business settings schema)</FormHelperText>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormControl fullWidth disabled={!formData.table_name}>
              <InputLabel sx={{ display: 'flex', alignItems: 'center' }}>
                <ColumnIcon sx={{ mr: 1, fontSize: 18 }} /> Column Name *
              </InputLabel>
              <Select
                value={formData.column_name}
                label="Column Name *"
                onChange={(e) => handleChange('column_name', e.target.value)}
              >
                {loading.columns ? <MenuItem disabled><CircularProgress size={20} /></MenuItem> : null}
                {columns.map((c, idx) => <MenuItem key={`${c}-${idx}`} value={c}>{c}</MenuItem>)}
              </Select>
              <FormHelperText>Source: Columns of the selected table</FormHelperText>
            </FormControl>
          </Grid>

          {/* Operator & Data Type Display */}
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              fullWidth
              label="Detected Data Type"
              value={formData.data_type || ''}
              disabled
              placeholder="Auto-detected..."
              InputProps={{
                startAdornment: loading.dataType ? <CircularProgress size={16} sx={{ mr: 1 }} /> : null
              }}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 8 }}>
            <FormControl fullWidth disabled={!formData.data_type}>
              <InputLabel sx={{ display: 'flex', alignItems: 'center' }}>
                <OperatorIcon sx={{ mr: 1, fontSize: 18 }} /> Comparison Operator *
              </InputLabel>
              <Select
                value={formData.operator}
                label="Comparison Operator *"
                onChange={(e) => handleChange('operator', e.target.value)}
              >
                {loading.operators ? <MenuItem disabled><CircularProgress size={20} /></MenuItem> : null}
                {operators.map((o, idx) => <MenuItem key={`${o}-${idx}`} value={o}>{o}</MenuItem>)}
              </Select>
              <FormHelperText>Source: Operators for detected data type</FormHelperText>
            </FormControl>
          </Grid>

          {/* Values Row */}
          <Grid size={{ xs: 12, md: formData.operator === 'BETWEEN' ? 6 : 12 }}>
            {columnValues.length > 0 ? (
              <Autocomplete
                freeSolo
                options={columnValues}
                value={formData.value1 || ''}
                onInputChange={(e, val) => handleChange('value1', val)}
                renderInput={(params: any) => (
                  <TextField
                    {...params}
                    label={formData.operator === 'BETWEEN' ? "Start Value *" : "Value *"}
                    fullWidth
                    helperText="Select or type custom value"
                  />
                )}
              />
            ) : (
              <TextField
                fullWidth
                label={formData.operator === 'BETWEEN' ? "Start Value *" : "Value *"}
                value={formData.value1 || ''}
                onChange={(e) => handleChange('value1', e.target.value)}
                type={formData.data_type === 'Number' ? 'number' : 'text'}
              />
            )}
          </Grid>

          {formData.operator === 'BETWEEN' && (
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="End Value *"
                value={formData.value2 || ''}
                onChange={(e) => handleChange('value2', e.target.value)}
                type={formData.data_type === 'Number' ? 'number' : 'text'}
                required
              />
            </Grid>
          )}

          {/* Live Preview Section */}
          <Grid size={{ xs: 12 }}>
            <Box sx={{
              mt: 2,
              p: 3,
              bgcolor: '#eef2f6',
              borderRadius: 2,
              border: '1px dashed #1976d2',
              position: 'relative'
            }}>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                <Chip
                  icon={<PreviewIcon sx={{ fontSize: '14px !important' }} />}
                  label="LIVE EXPRESSION PREVIEW"
                  size="small"
                  color="primary"
                  variant="outlined"
                  sx={{ fontWeight: 'bold', fontSize: '10px' }}
                />
              </Stack>
              <Typography variant="h6" sx={{
                fontFamily: 'monospace',
                color: '#1565c0',
                wordBreak: 'break-all',
                letterSpacing: 0.5
              }}>
                {renderExpression()}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 3, bgcolor: '#f8f9fa' }}>
        <Button onClick={onClose} variant="outlined" color="inherit" sx={{ px: 4 }}>
          Discard
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          startIcon={<SaveIcon />}
          sx={{ px: 4 }}
        >
          Confirm Rule
        </Button>
      </DialogActions>
    </Dialog>
  );
}
