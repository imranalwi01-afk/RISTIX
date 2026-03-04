
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Stack,
  Alert,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
  CircularProgress,
  FormHelperText
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Code as LogicIcon,
  Save as SaveIcon,
  Close as CancelIcon,
  Visibility as PreviewIcon,
  DragIndicator as DragIcon
} from '@mui/icons-material';
import { api } from '../../../../services/api';

const normalizeListPayload = (payload: unknown): string[] => {
  const source =
    payload && typeof payload === 'object' && 'data' in payload
      ? (payload as { data: unknown }).data
      : payload;
  const rawList = Array.isArray(source)
    ? source
    : source && typeof source === 'object' && 'data' in source && Array.isArray((source as { data: unknown }).data)
      ? (source as { data: unknown[] }).data
      : [];
  return rawList
    .map((item: unknown) => String(item ?? '').trim())
    .filter((item: string) => item.length > 0);
};

const normalizeDataTypePayload = (payload: unknown): string => {
  const source =
    payload && typeof payload === 'object' && 'data' in payload
      ? (payload as { data: unknown }).data
      : payload;
  if (source && typeof source === 'object' && 'data' in source && typeof (source as { data: unknown }).data === 'string') {
    return ((source as { data: string }).data || '').trim();
  }
  if (typeof source === 'string') return source.trim();
  return '';
};

interface Rule {
  id?: string | number;
  query_group: number;
  seq: number;
  table_name: string;
  column_name: string;
  data_type: string;
  operator: string;
  value1: string;
  value2?: string;
  condition: 'AND' | 'OR';
}

interface SegmentationConditionsTabProps {
  rules: Rule[];
  onRulesChange: (rules: Rule[]) => void;
  readOnly?: boolean;
}

type DataKind = 'date' | 'number' | 'varchar' | 'boolean' | 'unknown';

const isSetOperator = (operator: string) => ['IN', 'NOT IN'].includes(operator);
const isBetweenOperator = (operator: string) => operator === 'BETWEEN';

const getDataKind = (dataType: string): DataKind => {
  const normalized = String(dataType || '').trim().toUpperCase();
  if (['DATE', 'DATETIME', 'TIMESTAMP'].includes(normalized)) return 'date';
  if (['NUMBER', 'NUMERIC', 'INTEGER', 'INT', 'DECIMAL', 'FLOAT', 'DOUBLE'].includes(normalized)) return 'number';
  if (['BOOLEAN', 'BOOL', 'BIT'].includes(normalized)) return 'boolean';
  if (['VARCHAR', 'CHAR', 'STRING', 'TEXT'].includes(normalized)) return 'varchar';
  return 'unknown';
};

const isValidNumberValue = (value: string) => value.trim() !== '' && !Number.isNaN(Number(value));

const isValidDateValue = (value: string) =>
  /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`));

const isValidNumberList = (value: string) => {
  const tokens = value.split(',').map((token) => token.trim()).filter(Boolean);
  return tokens.length > 0 && tokens.every(isValidNumberValue);
};

export const SegmentationConditionsTab: React.FC<SegmentationConditionsTabProps> = ({
  rules,
  onRulesChange,
  readOnly = false
}) => {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Rule | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  // Metadata State
  const [tables, setTables] = useState<string[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [operators, setOperators] = useState<string[]>([]);
  const [conditions, setConditions] = useState<string[]>([]);
  const [columnValues, setColumnValues] = useState<string[]>([]);
  const [loading, setLoading] = useState({
    tables: false,
    columns: false,
    operators: false,
    values: false,
    dataType: false
  });
  const currentDataKind = getDataKind(editForm?.data_type || '');

  // Load Initial Metadata
  useEffect(() => {
    const loadInitialMetadata = async () => {
      setLoading(prev => ({ ...prev, tables: true }));
      try {
        const [tablesRes, conditionsRes] = await Promise.all([
          api.banking.businessSettings.getTables(),
          api.banking.businessSettings.getConditions()
        ]);

        setTables(normalizeListPayload(tablesRes));
        setConditions(normalizeListPayload(conditionsRes));
      } catch (err) {
        console.error('Error loading initial segmentation metadata:', err);
        setTables([]);
        setConditions([]);
      } finally {
        setLoading(prev => ({ ...prev, tables: false }));
      }
    };
    loadInitialMetadata();
  }, []);

  // Handlers for Metadata Loading
  const loadColumnsForTable = async (tableName: string) => {
    if (!tableName) return;
    setLoading(prev => ({ ...prev, columns: true }));
    try {
      const res = await api.banking.businessSettings.getColumns(tableName);
      setColumns(normalizeListPayload(res));
    } catch (err) {
      console.error('Error loading columns:', err);
      setColumns([]);
    } finally {
      setLoading(prev => ({ ...prev, columns: false }));
    }
  };

  const loadDataAndOperators = async (table: string, column: string) => {
    if (!table || !column) return;
    setLoading(prev => ({ ...prev, dataType: true, operators: true, values: true }));
    try {
      // Get Data Type
      const dataTypeRes = await api.banking.businessSettings.getDataType(column, table);
      const dataType = normalizeDataTypePayload(dataTypeRes) || 'String';

      // Get Operators based on data type
      const ops = await api.banking.businessSettings.getOperators(dataType);

      // Get Column Values
      const vals = await api.banking.businessSettings.getColumnValues(column, table);

      setEditForm(prev => prev ? { ...prev, data_type: dataType } : null);
      setOperators(normalizeListPayload(ops));
      setColumnValues(normalizeListPayload(vals));
    } catch (err) {
      console.error('Error loading rule metadata:', err);
      setOperators([]);
      setColumnValues([]);
    } finally {
      setLoading(prev => ({ ...prev, dataType: false, operators: false, values: false }));
    }
  };

  const handleFieldChange = (field: keyof Rule, value: unknown) => {
    if (!editForm) return;

    const updatedForm: Rule = { ...editForm, [field]: value as Rule[keyof Rule] };

    // Reset downstream fields when upstream changes
    if (field === 'table_name') {
      updatedForm.column_name = '';
      updatedForm.data_type = '';
      updatedForm.operator = '';
      updatedForm.value1 = '';
      updatedForm.value2 = '';
      setColumns([]);
      setOperators([]);
      setColumnValues([]);
      loadColumnsForTable(String(value));
    }

    if (field === 'column_name') {
      updatedForm.data_type = '';
      updatedForm.operator = '';
      updatedForm.value1 = '';
      updatedForm.value2 = '';
      loadDataAndOperators(updatedForm.table_name, String(value));
    }

    if (field === 'operator') {
      updatedForm.value1 = '';
      updatedForm.value2 = '';
    }

    if ((field === 'value1' || field === 'value2') && currentDataKind === 'number' && !isSetOperator(String(editForm.operator))) {
      const incoming = String(value ?? '');
      if (incoming !== '' && !/^-?\d*\.?\d*$/.test(incoming)) return;
      (updatedForm as any)[field] = incoming;
    }

    setEditForm(updatedForm);
  };

  const handleAddStart = () => {
    setEditingIndex(null);
    setEditForm({
      query_group: 1,
      seq: rules.length + 1,
      table_name: '',
      column_name: '',
      data_type: '',
      operator: '',
      value1: '',
      condition: (conditions[0] as 'AND' | 'OR') || 'AND'
    });
    setIsAdding(true);
  };

  const handleEditStart = (index: number) => {
    setEditingIndex(index);
    const ruleToEdit = rules[index];
    setEditForm({ ...ruleToEdit });
    setIsAdding(false);

    // Kick off metadata loads
    loadColumnsForTable(ruleToEdit.table_name);
    loadDataAndOperators(ruleToEdit.table_name, ruleToEdit.column_name);
  };

  const handleSave = () => {
    if (!editForm) return;

    // Validation (simple)
    if (!editForm.table_name || !editForm.column_name || !editForm.value1) {
      alert('Please fill in all required fields (Table, Column, Value)');
      return;
    }
    const dataKind = getDataKind(editForm.data_type);
    const operator = editForm.operator || '';

    if (dataKind === 'date') {
      if (!isValidDateValue(editForm.value1)) {
        alert('Value must be a valid date (YYYY-MM-DD).');
        return;
      }
      if (isBetweenOperator(operator) && !isValidDateValue(String(editForm.value2 || ''))) {
        alert('End Value must be a valid date (YYYY-MM-DD) for BETWEEN.');
        return;
      }
    }

    if (dataKind === 'number') {
      if (isSetOperator(operator)) {
        if (!isValidNumberList(editForm.value1)) {
          alert('Value must contain comma-separated numbers for this operator.');
          return;
        }
      } else if (!isValidNumberValue(editForm.value1)) {
        alert('Value must be numeric for NUMBER data type.');
        return;
      }

      if (isBetweenOperator(operator) && !isValidNumberValue(String(editForm.value2 || ''))) {
        alert('End Value must be numeric for BETWEEN.');
        return;
      }
    }

    if (dataKind === 'boolean') {
      const allowed = ['1', '0', 'TRUE', 'FALSE'];
      if (!allowed.includes(String(editForm.value1 || '').trim().toUpperCase())) {
        alert('Value must be True/False for BOOLEAN data type.');
        return;
      }
    }

    const updatedRules = [...rules];
    if (editingIndex !== null) {
      updatedRules[editingIndex] = editForm;
    } else {
      updatedRules.push(editForm);
    }

    onRulesChange(updatedRules);
    handleCancel();
  };

  const handleCancel = () => {
    setEditingIndex(null);
    setEditForm(null);
    setIsAdding(false);
  };

  const handleDelete = (index: number) => {
    if (window.confirm('Are you sure you want to remove this rule?')) {
      onRulesChange(rules.filter((_, i) => i !== index));
    }
  };

  const renderExpression = (rule: Rule) => {
    const { condition, column_name, operator, value1, value2 } = rule;
    if (!column_name) return '...';

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

  const generatedTableName = (
    rules.find((rule) => String(rule.table_name || '').trim().length > 0)?.table_name || 'FRS9_MASTER_ACCOUNT'
  ).toLowerCase();

  return (
    <Box>
      {/* Tab Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h6" color="primary.main" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center' }}>
            <LogicIcon sx={{ mr: 1 }} /> Segmentation Logic
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Construct complex segmentation rules using attribute-based conditions
          </Typography>
        </Box>
        {!readOnly && !isAdding && editingIndex === null && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddStart}
            size="small"
            sx={{ borderRadius: 1.5, textTransform: 'none', px: 3, boxShadow: '0 4px 10px rgba(25, 118, 210, 0.2)' }}
          >
            Add New Rule
          </Button>
        )}
      </Box>

      {/* Inline Editor */}
      {(isAdding || editingIndex !== null) && editForm && (
        <Paper variant="outlined" sx={{ p: 4, mb: 4, borderRadius: 2, bgcolor: '#f8fafc', border: '1px solid', borderColor: 'primary.light' }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
            <Typography variant="subtitle1" fontWeight="bold" color="primary.dark">
              {isAdding ? 'Defining New Rule' : `Editing Rule #${editingIndex! + 1}`}
            </Typography>
            <Stack direction="row" spacing={1}>
              <Button size="small" variant="outlined" color="inherit" onClick={handleCancel} startIcon={<CancelIcon />}>Discard</Button>
              <Button size="small" variant="contained" color="primary" onClick={handleSave} startIcon={<SaveIcon />}>Confirm Rule</Button>
            </Stack>
          </Stack>

          <Grid container spacing={3}>
            {/* Control Group */}
            <Grid size={{ xs: 12, md: 3 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Logic</InputLabel>
                <Select
                  value={editForm.condition}
                  label="Logic"
                  onChange={(e) => handleFieldChange('condition', e.target.value)}
                  sx={{ borderRadius: 1.5 }}
                >
                  {conditions.length > 0 ? (
                    conditions.map((condition) => (
                      <MenuItem key={condition} value={condition}>
                        {condition}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled value="">
                      No options - configure B0015 in Business Settings
                    </MenuItem>
                  )}
                </Select>
                <FormHelperText>Source: Business Setting B0015</FormHelperText>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField
                fullWidth
                size="small"
                label="Group"
                type="number"
                value={editForm.query_group}
                onChange={(e) => handleFieldChange('query_group', parseInt(e.target.value) || 1)}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField
                fullWidth
                size="small"
                label="Seq"
                type="number"
                value={editForm.seq}
                onChange={(e) => handleFieldChange('seq', parseInt(e.target.value) || 1)}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField
                fullWidth
                size="small"
                label="Data Type"
                value={editForm.data_type || ''}
                disabled
                helperText="Source: Business Setting B0013"
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 }, bgcolor: 'white' }}
                InputProps={{
                  startAdornment: loading.dataType ? <CircularProgress size={16} sx={{ mr: 1 }} /> : null
                }}
              />
            </Grid>

            {/* Field Selection Group */}
            <Grid size={{ xs: 12, md: 4 }}>
              <FormControl fullWidth size="small">
                <InputLabel id="table-select-label">Table</InputLabel>
                <Select
                  labelId="table-select-label"
                  value={editForm.table_name || ''}
                  label="Table"
                  onChange={(e) => handleFieldChange('table_name', e.target.value)}
                  sx={{ borderRadius: 1.5, bgcolor: 'white' }}
                >
                  {loading.tables ? <MenuItem disabled><CircularProgress size={16} /></MenuItem> : null}
                  {!loading.tables && tables.length === 0 ? (
                    <MenuItem disabled value="">
                      No options - configure B0012 in Business Settings
                    </MenuItem>
                  ) : null}
                  {tables.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                </Select>
                <FormHelperText>Source: Business Setting B0012</FormHelperText>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <FormControl fullWidth size="small" disabled={!editForm.table_name}>
                <InputLabel id="column-select-label">Column</InputLabel>
                <Select
                  labelId="column-select-label"
                  value={editForm.column_name || ''}
                  label="Column"
                  onChange={(e) => handleFieldChange('column_name', e.target.value)}
                  sx={{ borderRadius: 1.5, bgcolor: 'white' }}
                >
                  {loading.columns ? <MenuItem disabled><CircularProgress size={16} /></MenuItem> : null}
                  {!loading.columns && columns.length === 0 ? (
                    <MenuItem disabled value="">
                      No options - configure B0013 in Business Settings
                    </MenuItem>
                  ) : null}
                  {columns.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                </Select>
                <FormHelperText>Source: Business Setting B0013</FormHelperText>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <FormControl fullWidth size="small" disabled={!editForm.data_type}>
                <InputLabel id="operator-select-label">Operator</InputLabel>
                <Select
                  labelId="operator-select-label"
                  value={editForm.operator || ''}
                  label="Operator"
                  onChange={(e) => handleFieldChange('operator', e.target.value)}
                  sx={{ borderRadius: 1.5, bgcolor: 'white' }}
                >
                  {loading.operators ? <MenuItem disabled><CircularProgress size={16} /></MenuItem> : null}
                  {!loading.operators && operators.length === 0 ? (
                    <MenuItem disabled value="">
                      No options - configure B0014 in Business Settings
                    </MenuItem>
                  ) : null}
                  {operators.map(o => <MenuItem key={o} value={o}>{o}</MenuItem>)}
                </Select>
                <FormHelperText>Source: Business Setting B0014</FormHelperText>
              </FormControl>
            </Grid>

            {/* Value Controls */}
            <Grid size={{ xs: 12, md: isBetweenOperator(editForm.operator) ? 6 : 12 }}>
              {isSetOperator(editForm.operator) && currentDataKind === 'varchar' ? (
                <Autocomplete
                  multiple
                  freeSolo
                  size="small"
                  options={columnValues}
                  value={String(editForm.value1 || '')
                    .split(',')
                    .map((value) => value.trim())
                    .filter(Boolean)}
                  onChange={(_, newValues) =>
                    handleFieldChange(
                      'value1',
                      newValues
                        .map((value) => String(value).trim())
                        .filter(Boolean)
                        .join(',')
                    )
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Value"
                      placeholder="Select one or more values..."
                      helperText="Source: Business Setting B0016"
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 }, bgcolor: 'white' }}
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                          <>
                            {loading.values ? <CircularProgress color="inherit" size={20} /> : null}
                            {params.InputProps.endAdornment}
                          </>
                        ),
                      }}
                    />
                  )}
                />
              ) : currentDataKind === 'date' ? (
                <TextField
                  fullWidth
                  size="small"
                  type="date"
                  label={isBetweenOperator(editForm.operator) ? 'Start Date' : 'Date'}
                  value={editForm.value1 || ''}
                  onChange={(e) => handleFieldChange('value1', e.target.value)}
                  slotProps={{ inputLabel: { shrink: true } }}
                  helperText="Date Picker (YYYY-MM-DD)"
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 }, bgcolor: 'white' }}
                />
              ) : currentDataKind === 'number' ? (
                <TextField
                  fullWidth
                  size="small"
                  type={isSetOperator(editForm.operator) ? 'text' : 'number'}
                  label={isSetOperator(editForm.operator) ? 'Value List' : 'Value'}
                  value={editForm.value1 || ''}
                  onChange={(e) => handleFieldChange('value1', e.target.value)}
                  placeholder={isSetOperator(editForm.operator) ? 'e.g. 10,20,30' : undefined}
                  helperText={isSetOperator(editForm.operator) ? 'Use comma-separated numeric values' : 'Numeric input only'}
                  slotProps={{ htmlInput: isSetOperator(editForm.operator) ? { inputMode: 'text' } : { inputMode: 'decimal', step: 'any' } }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 }, bgcolor: 'white' }}
                />
              ) : currentDataKind === 'boolean' ? (
                <FormControl fullWidth size="small">
                  <InputLabel id="boolean-value-label">Value</InputLabel>
                  <Select
                    labelId="boolean-value-label"
                    label="Value"
                    value={String(editForm.value1 || '')}
                    onChange={(e) => handleFieldChange('value1', e.target.value)}
                    sx={{ borderRadius: 1.5, bgcolor: 'white' }}
                  >
                    <MenuItem value="1">True</MenuItem>
                    <MenuItem value="0">False</MenuItem>
                  </Select>
                </FormControl>
              ) : (
                <TextField
                  fullWidth
                  size="small"
                  label={isBetweenOperator(editForm.operator) ? "Start Value" : "Value"}
                  value={editForm.value1 || ''}
                  onChange={(e) => handleFieldChange('value1', e.target.value)}
                  helperText={editForm.operator ? 'Input value based on selected operator' : 'Select operator first'}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 }, bgcolor: 'white' }}
                />
              )}
            </Grid>

            {isBetweenOperator(editForm.operator) && (
              <Grid size={{ xs: 12, md: 6 }}>
                {currentDataKind === 'date' ? (
                  <TextField
                    fullWidth
                    size="small"
                    type="date"
                    label="End Date"
                    value={editForm.value2 || ''}
                    onChange={(e) => handleFieldChange('value2', e.target.value)}
                    slotProps={{ inputLabel: { shrink: true } }}
                    helperText="Date Picker (YYYY-MM-DD)"
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 }, bgcolor: 'white' }}
                  />
                ) : currentDataKind === 'number' ? (
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    label="End Value"
                    value={editForm.value2 || ''}
                    onChange={(e) => handleFieldChange('value2', e.target.value)}
                    helperText="Numeric input only"
                    slotProps={{ htmlInput: { inputMode: 'decimal', step: 'any' } }}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 }, bgcolor: 'white' }}
                  />
                ) : (
                  <TextField
                    fullWidth
                    size="small"
                    label="End Value"
                    value={editForm.value2 || ''}
                    onChange={(e) => handleFieldChange('value2', e.target.value)}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 }, bgcolor: 'white' }}
                  />
                )}
              </Grid>
            )}

            {/* Preview Section */}
            <Grid size={12}>
              <Box sx={{ p: 2, bgcolor: '#eef2f6', borderRadius: 2, border: '1px dashed #cbd5e1' }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <PreviewIcon color="primary" sx={{ fontSize: 16 }} />
                  <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 'bold' }}>LIVE SQL PREVIEW:</Typography>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace', color: '#334155' }}>
                    {renderExpression(editForm)}
                  </Typography>
                </Stack>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* Rules Result Table */}
      {rules.length === 0 && !isAdding ? (
        <Alert severity="info" sx={{ borderRadius: 2, border: '1px dashed', borderColor: 'info.light', bgcolor: '#f0f9ff' }}>
          No segmentation rules defined yet. Click Add New Rule to begin.
        </Alert>
      ) : (
        <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: '#f1f5f9' }}>
                <TableCell width={40}></TableCell>
                <TableCell sx={{ fontWeight: 'bold', fontSize: '0.75rem', textTransform: 'uppercase' }}>Seq</TableCell>
                <TableCell sx={{ fontWeight: 'bold', fontSize: '0.75rem', textTransform: 'uppercase' }}>Group</TableCell>
                <TableCell sx={{ fontWeight: 'bold', fontSize: '0.75rem', textTransform: 'uppercase' }}>Source Target</TableCell>
                <TableCell sx={{ fontWeight: 'bold', fontSize: '0.75rem', textTransform: 'uppercase' }}>Definition</TableCell>
                <TableCell sx={{ fontWeight: 'bold', fontSize: '0.75rem', textTransform: 'uppercase' }}>Logic</TableCell>
                {!readOnly && <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: '0.75rem', textTransform: 'uppercase' }}>Actions</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {rules.map((rule, idx) => (
                <TableRow
                  key={idx}
                  hover
                  sx={{
                    bgcolor: editingIndex === idx ? 'rgba(25, 118, 210, 0.04)' : 'transparent',
                    transition: 'background-color 0.2s'
                  }}
                >
                  <TableCell>
                    <DragIcon color="disabled" fontSize="small" />
                  </TableCell>
                  <TableCell>{rule.seq}</TableCell>
                  <TableCell>
                    <Chip label={`G${rule.query_group}`} size="small" sx={{ fontWeight: 'bold', height: 20, fontSize: '0.65rem' }} />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'primary.dark' }}>{rule.table_name}</Typography>
                    <Typography variant="caption" color="text.secondary">{rule.column_name}</Typography>
                  </TableCell>
                  <TableCell sx={{ verticalAlign: 'middle' }}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Chip label={rule.operator} size="small" variant="outlined" color="primary" sx={{ height: 18, fontSize: '0.6rem', fontWeight: 800 }} />
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {rule.operator === 'BETWEEN' ? `${rule.value1} AND ${rule.value2}` : rule.value1}
                      </Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={rule.condition}
                      size="small"
                      color={rule.condition === 'OR' ? 'info' : 'primary'}
                      sx={{ fontWeight: 800, height: 18, minWidth: 40, fontSize: '0.65rem' }}
                    />
                  </TableCell>
                  {!readOnly && (
                    <TableCell align="center">
                      <Stack direction="row" spacing={0.5} justifyContent="center">
                        <IconButton size="small" onClick={() => handleEditStart(idx)} disabled={editingIndex !== null || isAdding}>
                          <EditIcon fontSize="small" color={editingIndex === idx ? "primary" : "action"} />
                        </IconButton>
                        <IconButton size="small" onClick={() => handleDelete(idx)} disabled={editingIndex !== null || isAdding} color="error">
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* SQL View Summary */}
      {rules.length > 0 && (
        <Box sx={{ mt: 4, p: 3, bgcolor: '#1e293b', borderRadius: 2 }}>
          <Typography variant="caption" color="primary.light" sx={{ fontWeight: 'bold', mb: 1, display: 'block' }}>
            GENERATED SEGMENTATION QUERY
          </Typography>
          <Typography sx={{
            fontFamily: '"Fira Code", monospace',
            color: '#f8fafc',
            fontSize: '0.85rem',
            lineHeight: 1.6
          }}>
            SELECT * FROM {generatedTableName} WHERE <br />
            {rules.map((r, i) => (
              <span key={i} style={{ paddingLeft: '20px', display: 'block' }}>
                {i > 0 && <span style={{ color: '#fbbf24', fontWeight: 'bold' }}>{r.condition} </span>}
                ({r.column_name} {r.operator} <span style={{ color: '#38bdf8' }}>{r.operator === 'BETWEEN' ? `'${r.value1}' AND '${r.value2}'` : `'${r.value1}'`}</span>)
              </span>
            ))}
          </Typography>
        </Box>
      )}
    </Box>
  );
};
