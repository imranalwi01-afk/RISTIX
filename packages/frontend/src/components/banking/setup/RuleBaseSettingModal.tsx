// packages/frontend/src/components/banking/setup/RuleBaseSettingModal.tsx
// ============================================================================
// RULE BASE SETTING MODAL - PHASE 3 MODULE 3.2 DETAIL COMPONENT
// ============================================================================
// Complex master-detail modal with cascading dropdowns and dynamic forms
// Features: Rule header form, detail conditions grid, operator-based inputs
// Legacy compliance: ASP.NET MVC ParamScenarioRules CreateDetail functionality
// ============================================================================

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Paper,
  Chip,
  Alert,
  CircularProgress,
  Stack,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormHelperText,
  Autocomplete,
  Checkbox,
  RadioGroup,
  Radio,
  Grid
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Rule as RuleIcon,
  List as ListIcon
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { ruleBaseSettingAPI } from '@/services/api.rulebasesetting';

// ============================================================================
// INTERFACES
// ============================================================================

interface RuleBaseSettingHeader {
  id?: number;
  rule_name: string;
  rule_type: string;
  updated_table: string;
  updated_column: string;
  value: string;
  seq?: number;
  active_flag: boolean;
  created_by?: string;
  created_date?: string;
  updated_by?: string;
  updated_date?: string;
}

interface RuleBaseSettingDetail {
  id?: number;
  rule_id?: number;
  query_group: number;
  seq: number;
  table_name: string;
  column_name: string;
  data_type: string;
  operator: string;
  value1?: string;
  value2?: string;
  condition: string;
  detail_type?: number;
  stage_from?: number;
  stage_to?: number;
  created_by?: string;
  created_date?: string;
  updated_by?: string;
  updated_date?: string;
}

interface RuleBaseSettingModalProps {
  open: boolean;
  mode: 'create' | 'edit' | 'view';
  header: RuleBaseSettingHeader | null;
  onClose: () => void;
  onSave: () => void;
}

interface DropdownOption {
  value: string;
  label: string;
}

interface BusinessSettingsOption {
  value: string;
  label: string;
}

interface OperatorOption {
  value: string;
  label: string;
  supportsMultiple?: boolean;
  requiresValue2?: boolean;
  requiresNoValues?: boolean;
}

// ============================================================================
// RULE BASE SETTING MODAL COMPONENT
// ============================================================================

export default function RuleBaseSettingModal({
  open,
  mode,
  header,
  onClose,
  onSave
}: RuleBaseSettingModalProps) {
  const { enqueueSnackbar } = useSnackbar();

  // Form state
  const [headerForm, setHeaderForm] = useState<RuleBaseSettingHeader>({
    rule_name: '',
    rule_type: '',
    updated_table: '',
    updated_column: '',
    value: '',
    seq: 1,
    active_flag: true
  });

  const [details, setDetails] = useState<RuleBaseSettingDetail[]>([]);
  const [editingDetail, setEditingDetail] = useState<RuleBaseSettingDetail | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  // Loading states
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);

  // Dropdown data
  const [ruleTypes, setRuleTypes] = useState<DropdownOption[]>([]);
  const [operators, setOperators] = useState<OperatorOption[]>([]);
  const [conditions, setConditions] = useState<DropdownOption[]>([]);
  const [stages, setStages] = useState<Array<{ value: number; label: string }>>([]);
  const [businessTables, setBusinessTables] = useState<BusinessSettingsOption[]>([]);
  const [businessColumns, setBusinessColumns] = useState<BusinessSettingsOption[]>([]);
  const [businessValues, setBusinessValues] = useState<BusinessSettingsOption[]>([]);

  // Detail form state
  const [detailForm, setDetailForm] = useState<RuleBaseSettingDetail>({
    query_group: 1,
    seq: 1,
    table_name: '',
    column_name: '',
    data_type: 'VARCHAR',
    operator: '=',
    value1: '',
    value2: '',
    condition: 'AND',
    detail_type: 1,
    stage_from: undefined,
    stage_to: undefined
  });

  // ============================================================================
  // INITIALIZATION
  // ============================================================================

  useEffect(() => {
    if (open) {
      loadDropdownData();

      if (header) {
        setHeaderForm(header);
        if (header.id) {
          loadDetails(header.id);
        }
      } else {
        // Reset form for create mode
        setHeaderForm({
          rule_name: '',
          rule_type: '',
          updated_table: '',
          updated_column: '',
          value: '',
          seq: 1,
          active_flag: true
        });
        setDetails([]);
      }
    }
  }, [open, header]);

  const loadDropdownData = async () => {
    try {
      setLoading(true);

      const [ruleTypesRes, operatorsRes, conditionsRes, stagesRes, tablesRes] = await Promise.all([
        ruleBaseSettingAPI.getRuleTypes(),
        ruleBaseSettingAPI.getOperators('VARCHAR'), // Default to VARCHAR initially
        ruleBaseSettingAPI.getConditions(),
        ruleBaseSettingAPI.getStages(),
        ruleBaseSettingAPI.getBusinessSettingsTables()
      ]);

      if (ruleTypesRes.success) setRuleTypes(ruleTypesRes.data || []);
      if (operatorsRes.success) setOperators(operatorsRes.data || []);
      if (conditionsRes.success) setConditions(conditionsRes.data || []);
      if (stagesRes.success) setStages(stagesRes.data || []);
      if (tablesRes.success) setBusinessTables(tablesRes.data || []);

    } catch (err) {
      console.error('Error loading dropdown data:', err);
      enqueueSnackbar('Failed to load form data', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const loadDetails = async (ruleId: number) => {
    try {
      setDetailsLoading(true);
      const response = await ruleBaseSettingAPI.getDetails(ruleId);

      if (response.success) {
        setDetails(response.data || []);
      } else {
        throw new Error(response.error || 'Failed to load rule details');
      }
    } catch (err) {
      console.error('Error loading rule details:', err);
      enqueueSnackbar('Failed to load rule details', { variant: 'error' });
    } finally {
      setDetailsLoading(false);
    }
  };

  // ============================================================================
  // CASCADING DROPDOWN HANDLERS
  // ============================================================================

  const handleTableChange = async (tableName: string) => {
    if (!tableName) {
      setBusinessColumns([]);
      return;
    }

    try {
      const response = await ruleBaseSettingAPI.getBusinessSettingsColumns(tableName);
      if (response.success) {
        setBusinessColumns(response.data || []);
      }
    } catch (err) {
      console.error('Error loading columns:', err);
    }
  };

  const handleColumnChange = async (tableName: string, columnName: string) => {
    if (!tableName || !columnName) {
      setBusinessValues([]);
      return;
    }

    try {
      const response = await ruleBaseSettingAPI.getBusinessSettingsValues(tableName, columnName);
      if (response.success) {
        setBusinessValues(response.data || []);
      }
    } catch (err) {
      console.error('Error loading values:', err);
    }
  };

  const handleDataTypeChange = async (dataType: string) => {
    try {
      const response = await ruleBaseSettingAPI.getOperators(dataType);
      if (response.success) {
        setOperators(response.data || []);
        // Reset operator when data type changes
        setDetailForm(prev => ({ ...prev, operator: '=', value1: '', value2: '' }));
      }
    } catch (err) {
      console.error('Error loading operators:', err);
    }
  };

  // ============================================================================
  // FORM HANDLERS
  // ============================================================================

  const handleHeaderFormChange = (field: keyof RuleBaseSettingHeader, value: any) => {
    setHeaderForm(prev => ({ ...prev, [field]: value }));
  };

  const handleDetailFormChange = (field: keyof RuleBaseSettingDetail, value: any) => {
    setDetailForm(prev => ({ ...prev, [field]: value }));

    // Handle cascading updates
    if (field === 'table_name') {
      handleTableChange(value);
      setDetailForm(prev => ({ ...prev, column_name: '', data_type: 'VARCHAR' }));
    } else if (field === 'column_name') {
      handleColumnChange(detailForm.table_name, value);
    } else if (field === 'data_type') {
      handleDataTypeChange(value);
    } else if (field === 'operator') {
      // Clear values when operator changes
      setDetailForm(prev => ({ ...prev, value1: '', value2: '' }));
    }
  };

  const handleSaveHeader = async () => {
    try {
      setSaving(true);

      if (mode === 'create') {
        const response = await ruleBaseSettingAPI.createHeader(headerForm);

        if (response.success) {
          enqueueSnackbar('Rule base setting created successfully', { variant: 'success' });
          onSave();
        } else {
          throw new Error(response.error || 'Failed to create rule base setting');
        }
      } else if (mode === 'edit' && header?.id) {
        const response = await ruleBaseSettingAPI.updateHeader(header.id, headerForm);

        if (response.success) {
          enqueueSnackbar('Rule base setting updated successfully', { variant: 'success' });
          onSave();
        } else {
          throw new Error(response.error || 'Failed to update rule base setting');
        }
      }
    } catch (err) {
      console.error('Error saving rule base setting:', err);
      enqueueSnackbar('Failed to save rule base setting', { variant: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveDetail = async () => {
    if (!header?.id) {
      enqueueSnackbar('Please save the rule header first', { variant: 'warning' });
      return;
    }

    try {
      if (editingDetail?.id) {
        // Update existing detail
        const response = await ruleBaseSettingAPI.updateDetail(editingDetail.id, detailForm);
        if (response.success) {
          enqueueSnackbar('Rule detail updated successfully', { variant: 'success' });
          loadDetails(header.id);
          setDetailModalOpen(false);
          setEditingDetail(null);
        } else {
          throw new Error(response.error || 'Failed to update rule detail');
        }
      } else {
        // Create new detail
        const response = await ruleBaseSettingAPI.createDetail(header.id, detailForm);
        if (response.success) {
          enqueueSnackbar('Rule detail created successfully', { variant: 'success' });
          loadDetails(header.id);
          setDetailModalOpen(false);
        } else {
          throw new Error(response.error || 'Failed to create rule detail');
        }
      }
    } catch (err) {
      console.error('Error saving rule detail:', err);
      enqueueSnackbar('Failed to save rule detail', { variant: 'error' });
    }
  };

  const handleDeleteDetail = async (detailId: number) => {
    if (!confirm('Are you sure you want to delete this rule condition?')) {
      return;
    }

    try {
      const response = await ruleBaseSettingAPI.deleteDetail(detailId);
      if (response.success) {
        enqueueSnackbar('Rule detail deleted successfully', { variant: 'success' });
        if (header?.id) {
          loadDetails(header.id);
        }
      } else {
        throw new Error(response.error || 'Failed to delete rule detail');
      }
    } catch (err) {
      console.error('Error deleting rule detail:', err);
      enqueueSnackbar('Failed to delete rule detail', { variant: 'error' });
    }
  };

  const handleAddDetail = () => {
    setEditingDetail(null);
    setDetailForm({
      query_group: 1,
      seq: details.length + 1,
      table_name: '',
      column_name: '',
      data_type: 'VARCHAR',
      operator: '=',
      value1: '',
      value2: '',
      condition: 'AND',
      detail_type: 1,
      stage_from: undefined,
      stage_to: undefined
    });
    setDetailModalOpen(true);
  };

  const handleEditDetail = (detail: RuleBaseSettingDetail) => {
    setEditingDetail(detail);
    setDetailForm(detail);
    setDetailModalOpen(true);
  };

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  const getOperatorInfo = (operator: string): OperatorOption | undefined => {
    return operators.find(op => op.value === operator);
  };

  const shouldShowValue1 = (operator: string): boolean => {
    const opInfo = getOperatorInfo(operator);
    return !opInfo?.requiresNoValues;
  };

  const shouldShowValue2 = (operator: string): boolean => {
    const opInfo = getOperatorInfo(operator);
    return opInfo?.requiresValue2 || false;
  };

  const shouldShowMultipleValues = (operator: string): boolean => {
    const opInfo = getOperatorInfo(operator);
    return opInfo?.supportsMultiple || false;
  };

  const getDataTypeInputType = (dataType: string): string => {
    switch (dataType.toUpperCase()) {
      case 'NUMBER':
      case 'INT':
      case 'DECIMAL':
      case 'FLOAT':
        return 'number';
      case 'DATE':
      case 'DATETIME':
        return 'date';
      case 'BOOLEAN':
      case 'BIT':
        return 'boolean';
      default:
        return 'text';
    }
  };

  // ============================================================================
  // VALUE INPUT COMPONENT
  // ============================================================================

  const renderValueInput = (
    valueLabel: string,
    valueField: 'value1' | 'value2',
    required: boolean = false
  ) => {
    const inputType = getDataTypeInputType(detailForm.data_type);
    const isMultiple = shouldShowMultipleValues(detailForm.operator);

    if (inputType === 'boolean') {
      return (
        <FormControl component="fieldset" fullWidth>
          <Typography variant="body2" gutterBottom>{valueLabel}</Typography>
          <RadioGroup
            row
            value={detailForm[valueField] || ''}
            onChange={(e) => handleDetailFormChange(valueField, e.target.value)}
          >
            <FormControlLabel value="1" control={<Radio />} label="True" />
            <FormControlLabel value="0" control={<Radio />} label="False" />
          </RadioGroup>
        </FormControl>
      );
    }

    if (inputType === 'date') {
      return (
        <TextField
          label={valueLabel}
          type="date"
          value={detailForm[valueField] || ''}
          onChange={(e) => handleDetailFormChange(valueField, e.target.value)}
          fullWidth
          required={required}
          InputLabelProps={{ shrink: true }}
        />
      );
    }

    if (isMultiple) {
      return (
        <Autocomplete
          multiple
          freeSolo
          options={businessValues.map(bv => bv.value)}
          value={detailForm[valueField]?.split(',') || []}
          onChange={(event, newValue) => {
            handleDetailFormChange(valueField, newValue.join(','));
          }}
          renderInput={(params) => (
            <TextField
              {...params as any}
              label={`${valueLabel} (Multiple)`}
              placeholder="Type and press Enter to add values"
              required={required}
            />
          )}
          renderTags={(value, getTagProps) =>
            value.map((option, index) => {
              const { key, ...tagProps } = getTagProps({ index });
              return (
                <Chip
                  key={key}
                  variant="outlined"
                  label={option}
                  {...tagProps}
                />
              );
            })
          }
        />
      );
    }

    return (
      <TextField
        label={valueLabel}
        type={inputType}
        value={detailForm[valueField] || ''}
        onChange={(e) => handleDetailFormChange(valueField, e.target.value)}
        fullWidth
        required={required}
        placeholder={inputType === 'number' ? 'Enter numeric value' : 'Enter value'}
      />
    );
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <>
      {/* Main Modal */}
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: { minHeight: '80vh' }
        }}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <RuleIcon />
            <Typography variant="h6">
              {mode === 'create' ? 'Create Rule Base Setting' :
                mode === 'edit' ? 'Edit Rule Base Setting' :
                  'View Rule Base Setting'}
            </Typography>
          </Box>
        </DialogTitle>

        <DialogContent dividers>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Stack spacing={3}>
              {/* Header Form */}
              <Accordion defaultExpanded>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6">Rule Configuration</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        label="Rule Name"
                        value={headerForm.rule_name}
                        onChange={(e) => handleHeaderFormChange('rule_name', e.target.value)}
                        fullWidth
                        required
                        disabled={mode === 'view'}
                        placeholder="Enter descriptive rule name"
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <FormControl fullWidth required>
                        <InputLabel>Rule Type</InputLabel>
                        <Select
                          value={headerForm.rule_type}
                          label="Rule Type"
                          onChange={(e) => handleHeaderFormChange('rule_type', e.target.value)}
                          disabled={mode === 'view'}
                        >
                          {ruleTypes.map((type) => (
                            <MenuItem key={type.value} value={type.value}>
                              {type.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        label="Updated Table"
                        value={headerForm.updated_table}
                        onChange={(e) => handleHeaderFormChange('updated_table', e.target.value)}
                        fullWidth
                        required
                        disabled={mode === 'view'}
                        placeholder="Target table name"
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        label="Updated Column"
                        value={headerForm.updated_column}
                        onChange={(e) => handleHeaderFormChange('updated_column', e.target.value)}
                        fullWidth
                        required
                        disabled={mode === 'view'}
                        placeholder="Target column name"
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        label="Value"
                        value={headerForm.value}
                        onChange={(e) => handleHeaderFormChange('value', e.target.value)}
                        fullWidth
                        required
                        disabled={mode === 'view'}
                        placeholder="Value to be set"
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 3 }}>
                      <TextField
                        label="Sequence"
                        type="number"
                        value={headerForm.seq || 1}
                        onChange={(e) => handleHeaderFormChange('seq', parseInt(e.target.value))}
                        fullWidth
                        disabled={mode === 'view'}
                        inputProps={{ min: 1 }}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 3 }}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={headerForm.active_flag}
                            onChange={(e) => handleHeaderFormChange('active_flag', e.target.checked)}
                            disabled={mode === 'view'}
                          />
                        }
                        label="Active"
                      />
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>

              {/* Rule Details */}
              {header?.id && (
                <Accordion defaultExpanded>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <ListIcon />
                      <Typography variant="h6">Rule Conditions ({details.length})</Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Stack spacing={2}>
                      {mode !== 'view' && (
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                          <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={handleAddDetail}
                            size="small"
                          >
                            Add Condition
                          </Button>
                        </Box>
                      )}

                      {detailsLoading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                          <CircularProgress size={24} />
                        </Box>
                      ) : details.length === 0 ? (
                        <Alert severity="info">
                          No conditions configured. Click "Add Condition" to create rule conditions.
                        </Alert>
                      ) : (
                        <TableContainer component={Paper} variant="outlined">
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell>Group</TableCell>
                                <TableCell>Seq</TableCell>
                                <TableCell>Table</TableCell>
                                <TableCell>Column</TableCell>
                                <TableCell>Operator</TableCell>
                                <TableCell>Value(s)</TableCell>
                                <TableCell>Condition</TableCell>
                                <TableCell>Stage</TableCell>
                                {mode !== 'view' && <TableCell align="center">Actions</TableCell>}
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {details.map((detail, index) => (
                                <TableRow key={detail.id || index}>
                                  <TableCell>{detail.query_group}</TableCell>
                                  <TableCell>{detail.seq}</TableCell>
                                  <TableCell>{detail.table_name}</TableCell>
                                  <TableCell>{detail.column_name}</TableCell>
                                  <TableCell>
                                    <Chip label={detail.operator} size="small" />
                                  </TableCell>
                                  <TableCell>
                                    <Typography variant="body2" sx={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                      {detail.value1}
                                      {detail.value2 && ` - ${detail.value2}`}
                                    </Typography>
                                  </TableCell>
                                  <TableCell>
                                    <Chip label={detail.condition} size="small" color="primary" />
                                  </TableCell>
                                  <TableCell>
                                    {detail.stage_from && detail.stage_to ?
                                      `${detail.stage_from} → ${detail.stage_to}` :
                                      detail.stage_from ? `From ${detail.stage_from}` :
                                        detail.stage_to ? `To ${detail.stage_to}` : '-'
                                    }
                                  </TableCell>
                                  {mode !== 'view' && (
                                    <TableCell align="center">
                                      <Stack direction="row" spacing={1} justifyContent="center">
                                        <IconButton
                                          size="small"
                                          onClick={() => handleEditDetail(detail)}
                                          color="primary"
                                        >
                                          <EditIcon />
                                        </IconButton>
                                        <IconButton
                                          size="small"
                                          onClick={() => detail.id && handleDeleteDetail(detail.id)}
                                          color="error"
                                        >
                                          <DeleteIcon />
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
                    </Stack>
                  </AccordionDetails>
                </Accordion>
              )}
            </Stack>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose} startIcon={<CancelIcon />}>
            {mode === 'view' ? 'Close' : 'Cancel'}
          </Button>
          {mode !== 'view' && (
            <Button
              onClick={handleSaveHeader}
              variant="contained"
              startIcon={<SaveIcon />}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Rule'}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Detail Modal */}
      <Dialog
        open={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingDetail ? 'Edit Rule Condition' : 'Add Rule Condition'}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid size={{ xs: 6 }}>
              <TextField
                label="Query Group"
                type="number"
                value={detailForm.query_group}
                onChange={(e) => handleDetailFormChange('query_group', parseInt(e.target.value))}
                fullWidth
                required
                inputProps={{ min: 1 }}
                helperText="Logical grouping for complex conditions"
              />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <TextField
                label="Sequence"
                type="number"
                value={detailForm.seq}
                onChange={(e) => handleDetailFormChange('seq', parseInt(e.target.value))}
                fullWidth
                required
                inputProps={{ min: 1 }}
                helperText="Execution order within group"
              />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <FormControl fullWidth required>
                <InputLabel>Table Name</InputLabel>
                <Select
                  value={detailForm.table_name}
                  label="Table Name"
                  onChange={(e) => handleDetailFormChange('table_name', e.target.value)}
                >
                  {businessTables.map((table) => (
                    <MenuItem key={table.value} value={table.value}>
                      {table.label}
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText>Source: Business Settings B0012</FormHelperText>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 6 }}>
              <FormControl fullWidth required>
                <InputLabel>Column Name</InputLabel>
                <Select
                  value={detailForm.column_name}
                  label="Column Name"
                  onChange={(e) => handleDetailFormChange('column_name', e.target.value)}
                  disabled={!detailForm.table_name}
                >
                  {businessColumns.map((column) => (
                    <MenuItem key={column.value} value={column.value}>
                      {column.label}
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText>Source: Business Settings B0013</FormHelperText>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 6 }}>
              <FormControl fullWidth required>
                <InputLabel>Data Type</InputLabel>
                <Select
                  value={detailForm.data_type}
                  label="Data Type"
                  onChange={(e) => handleDetailFormChange('data_type', e.target.value)}
                >
                  <MenuItem value="VARCHAR">Text (VARCHAR)</MenuItem>
                  <MenuItem value="NUMBER">Number (NUMBER)</MenuItem>
                  <MenuItem value="DATE">Date (DATE)</MenuItem>
                  <MenuItem value="BOOLEAN">Boolean (BOOLEAN)</MenuItem>
                </Select>
                <FormHelperText>Auto-detected from column metadata</FormHelperText>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 6 }}>
              <FormControl fullWidth required>
                <InputLabel>Operator</InputLabel>
                <Select
                  value={detailForm.operator}
                  label="Operator"
                  onChange={(e) => handleDetailFormChange('operator', e.target.value)}
                >
                  {operators.map((operator) => (
                    <MenuItem key={operator.value} value={operator.value}>
                      {operator.label}
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText>Comparison operator for condition</FormHelperText>
              </FormControl>
            </Grid>

            {/* Dynamic Value Inputs */}
            {shouldShowValue1(detailForm.operator) && (
              <Grid size={{ xs: shouldShowValue2(detailForm.operator) ? 6 : 12 }}>
                {renderValueInput('Value 1', 'value1', true)}
              </Grid>
            )}

            {shouldShowValue2(detailForm.operator) && (
              <Grid size={{ xs: 6 }}>
                {renderValueInput('Value 2', 'value2', true)}
              </Grid>
            )}

            <Grid size={{ xs: 6 }}>
              <FormControl fullWidth required>
                <InputLabel>Condition</InputLabel>
                <Select
                  value={detailForm.condition}
                  label="Condition"
                  onChange={(e) => handleDetailFormChange('condition', e.target.value)}
                >
                  {conditions.map((condition) => (
                    <MenuItem key={condition.value} value={condition.value}>
                      {condition.label}
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText>Logical operator to next condition</FormHelperText>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 6 }}>
              <TextField
                label="Detail Type"
                type="number"
                value={detailForm.detail_type || ''}
                onChange={(e) => handleDetailFormChange('detail_type', parseInt(e.target.value))}
                fullWidth
                inputProps={{ min: 1 }}
                helperText="Optional categorization"
              />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Stage From</InputLabel>
                <Select
                  value={detailForm.stage_from || ''}
                  label="Stage From"
                  onChange={(e) => handleDetailFormChange('stage_from', (e.target.value as any) !== '' ? Number(e.target.value) : undefined)}
                >
                  <MenuItem value="">None</MenuItem>
                  {stages.map((stage) => (
                    <MenuItem key={stage.value} value={stage.value}>
                      {stage.label}
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText>Source IFRS 9 stage</FormHelperText>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Stage To</InputLabel>
                <Select
                  value={detailForm.stage_to || ''}
                  label="Stage To"
                  onChange={(e) => handleDetailFormChange('stage_to', (e.target.value as any) !== '' ? Number(e.target.value) : undefined)}
                >
                  <MenuItem value="">None</MenuItem>
                  {stages.map((stage) => (
                    <MenuItem key={stage.value} value={stage.value}>
                      {stage.label}
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText>Target IFRS 9 stage</FormHelperText>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailModalOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveDetail} variant="contained">
            Save Condition
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}