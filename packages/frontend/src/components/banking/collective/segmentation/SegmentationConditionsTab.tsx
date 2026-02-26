
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
  Tooltip,
  Stack,
  Alert,
  Divider,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
  CircularProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Storage as TableIcon,
  ViewColumn as ColumnIcon,
  SettingsEthernet as OperatorIcon,
  Code as LogicIcon,
  Save as SaveIcon,
  Close as CancelIcon,
  Visibility as PreviewIcon,
  DragIndicator as DragIcon
} from '@mui/icons-material';
import { api } from '../../../../services/api';

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
  const [columnValues, setColumnValues] = useState<string[]>([]);
  const [loading, setLoading] = useState({
    tables: false,
    columns: false,
    operators: false,
    values: false,
    dataType: false
  });

  // Load Initial Metadata
  useEffect(() => {
    const loadTables = async () => {
      setLoading(prev => ({ ...prev, tables: true }));
      try {
        const res = await api.banking.segmentation.getBusinessSettingsTables();
        setTables(Array.isArray(res) ? res : []);
      } catch (err) {
        console.error('Error loading tables:', err);
      } finally {
        setLoading(prev => ({ ...prev, tables: false }));
      }
    };
    loadTables();
  }, []);

  // Handlers for Metadata Loading
  const loadColumnsForTable = async (tableName: string) => {
    if (!tableName) return;
    setLoading(prev => ({ ...prev, columns: true }));
    try {
      const res = await api.banking.segmentation.getBusinessSettingsColumns(tableName);
      setColumns(Array.isArray(res) ? res : []);
    } catch (err) {
      console.error('Error loading columns:', err);
    } finally {
      setLoading(prev => ({ ...prev, columns: false }));
    }
  };

  const loadDataAndOperators = async (table: string, column: string) => {
    if (!table || !column) return;
    setLoading(prev => ({ ...prev, dataType: true, operators: true, values: true }));
    try {
      // Get Data Type
      const dataType = await api.banking.segmentation.getBusinessSettingsDataType(table, column);

      // Get Operators based on data type
      const ops = await api.banking.segmentation.getBusinessSettingsOperators(dataType || 'String');

      // Get Column Values
      const vals = await api.banking.segmentation.getBusinessSettingsValues(table, column);

      setEditForm(prev => prev ? { ...prev, data_type: dataType || 'String' } : null);
      setOperators(Array.isArray(ops) ? ops : []);
      setColumnValues(Array.isArray(vals) ? vals : []);
    } catch (err) {
      console.error('Error loading rule metadata:', err);
    } finally {
      setLoading(prev => ({ ...prev, dataType: false, operators: false, values: false }));
    }
  };

  const handleFieldChange = (field: keyof Rule, value: any) => {
    if (!editForm) return;

    const updatedForm = { ...editForm, [field]: value };

    // Reset downstream fields when upstream changes
    if (field === 'table_name') {
      updatedForm.column_name = '';
      updatedForm.data_type = '';
      updatedForm.operator = '=';
      updatedForm.value1 = '';
      updatedForm.value2 = '';
      setColumns([]);
      setOperators([]);
      setColumnValues([]);
      loadColumnsForTable(value);
    }

    if (field === 'column_name') {
      updatedForm.data_type = '';
      updatedForm.operator = '=';
      updatedForm.value1 = '';
      updatedForm.value2 = '';
      loadDataAndOperators(updatedForm.table_name, value);
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
      operator: '=',
      value1: '',
      condition: 'AND'
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
                  <MenuItem value="AND">AND (Append)</MenuItem>
                  <MenuItem value="OR">OR (Separate)</MenuItem>
                </Select>
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
                  {tables.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                </Select>
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
                  {columns.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <FormControl fullWidth size="small" disabled={!editForm.data_type}>
                <InputLabel id="operator-select-label">Operator</InputLabel>
                <Select
                  labelId="operator-select-label"
                  value={editForm.operator || '='}
                  label="Operator"
                  onChange={(e) => handleFieldChange('operator', e.target.value)}
                  sx={{ borderRadius: 1.5, bgcolor: 'white' }}
                >
                  {loading.operators ? <MenuItem disabled><CircularProgress size={16} /></MenuItem> : null}
                  {operators.map(o => <MenuItem key={o} value={o}>{o}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>

            {/* Value Controls */}
            <Grid size={{ xs: 12, md: editForm.operator === 'BETWEEN' ? 6 : 12 }}>
              {columnValues.length > 0 ? (
                <Autocomplete
                  freeSolo
                  size="small"
                  options={columnValues}
                  value={editForm.value1 || ''}
                  onInputChange={(_, newVal) => handleFieldChange('value1', newVal)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label={editForm.operator === 'BETWEEN' ? "Start Value" : "Value"}
                      placeholder="Select or type..."
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
              ) : (
                <TextField
                  fullWidth
                  size="small"
                  label={editForm.operator === 'BETWEEN' ? "Start Value" : "Value"}
                  value={editForm.value1 || ''}
                  onChange={(e) => handleFieldChange('value1', e.target.value)}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 }, bgcolor: 'white' }}
                />
              )}
            </Grid>

            {editForm.operator === 'BETWEEN' && (
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="End Value"
                  value={editForm.value2 || ''}
                  onChange={(e) => handleFieldChange('value2', e.target.value)}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 }, bgcolor: 'white' }}
                />
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
          No segmentation rules defined yet. Click "Add New Rule" to begin.
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
            SELECT * FROM accounts WHERE <br />
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
