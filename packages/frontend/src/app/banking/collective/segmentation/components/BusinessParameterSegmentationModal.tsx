// packages/frontend/src/app/banking/collective/segmentation/components/BusinessParameterSegmentationModal.tsx
// ============================================================================
// 🎯 BUSINESS PARAMETER SEGMENTATION MODAL - EXACT USER SPECIFICATIONS
// ============================================================================
// Implements EXACT cascading dropdown logic from user requirements:
// - Table dropdown: Get From Business Setting (table frs9_param_commond) 'B0012'
// - Column dropdown: Get from Business Setting(frs9_param_commond) ->distinct(VALUE1) where VALUE3 = selected TABLE_NAME
// - Data Type: Get From Business Setting(table frs9_param_commond) B0013->distinct(VALUE2) Where Value 1 = selected Column Name and VALUE3 = selected TABLE_NAME
// - Operator dropdown: Get From Business Setting (table frs9_param_commond) B0014->Distinct Value1 where Value2 = Selected Data Type
// - Condition dropdown: Get From Business Setting(table frs9_param_commond) B15-> Distinct Value1
// - Multi-select values: (Get From Business Setting(table frs9_param_commond) B0016->Distinct Value1 where Value2 = selected Column Name and VALUE3 = selected TABLE_NAME)
// Follows EXACT legacy ASP.NET MVC patterns from _sources/ifrs9/Views/ParamSegment/
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
  CircularProgress,
  Alert,
  TextField,
  MenuItem,
  FormControlLabel,
  Radio,
  RadioGroup,
  FormControl,
  FormLabel,
  Checkbox,
  FormGroup,
  Grid,
  Snackbar,
  Card,
  CardContent,
  Stack,
  Divider,
  InputAdornment,
  Tooltip,
  IconButton
} from '@mui/material';
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Info as InfoIcon,
  Help as HelpIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  Clear as ClearIcon,
  CalendarToday as CalendarIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format, parse } from 'date-fns';
import { api, handleAPIError } from '../../../../../services/api';

// ============================================================================
// TYPES & INTERFACES - EXACT LEGACY MAPPING
// ============================================================================

interface SegmentationDetailForm {
  query_group: number | '';
  seq: number | '';
  table_name: string;
  column_name: string;
  data_type: string;
  operator: string;
  value1: string;
  value2: string;
  condition: string;
}

interface BusinessSettingOption {
  id: number;
  value: string;
  label: string;
  description?: string;
  data_type?: string;
  table_name?: string;
  column_name?: string;
  category?: string;
  sequence?: number;
}

interface BusinessParameterSegmentationModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  segmentId: number;
  editData?: any;
  mode: 'add' | 'edit' | 'view';
}

// ============================================================================
// MAIN COMPONENT - EXACT LEGACY LOGIC IMPLEMENTATION
// ============================================================================

const BusinessParameterSegmentationModal: React.FC<BusinessParameterSegmentationModalProps> = ({
  open,
  onClose,
  onSave,
  segmentId,
  editData,
  mode
}) => {
  // ==========================================
  // STATE MANAGEMENT - EXACT LEGACY PATTERN
  // ==========================================

  const [formData, setFormData] = useState<SegmentationDetailForm>({
    query_group: '',
    seq: '',
    table_name: '',
    column_name: '',
    data_type: '',
    operator: '',
    value1: '',
    value2: '',
    condition: ''
  });

  // Business Settings Data - Exact B0012-B0016 mapping
  const [tables, setTables] = useState<BusinessSettingOption[]>([]);
  const [columns, setColumns] = useState<BusinessSettingOption[]>([]);
  const [operators, setOperators] = useState<BusinessSettingOption[]>([]);
  const [conditions, setConditions] = useState<BusinessSettingOption[]>([]);
  const [columnValues, setColumnValues] = useState<BusinessSettingOption[]>([]);

  // Loading states for each dropdown
  const [loading, setLoading] = useState({
    tables: false,
    columns: false,
    dataType: false,
    operators: false,
    conditions: false,
    columnValues: false,
    saving: false
  });

  // Error states
  const [error, setError] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', type: 'success' as 'success' | 'error' });

  // Multi-select values for IN/NOT IN operators
  const [selectedMultiValues, setSelectedMultiValues] = useState<string[]>([]);

  // Date picker states
  const [datePickerValue1, setDatePickerValue1] = useState<Date | null>(null);
  const [datePickerValue2, setDatePickerValue2] = useState<Date | null>(null);

  // ==========================================
  // BUSINESS SETTINGS API CALLS - EXACT USER SPECIFICATIONS
  // ==========================================

  // B0012: Get table names
  const loadTables = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, tables: true }));
      console.log('🗃️ Loading tables from B0012');

      const response = await api.banking.businessSettings.getTables();

      if (response.success && response.data) {
        // Backend returns string array, convert to BusinessSettingOption format
        const tableOptions = response.data.map((tableName: string, index: number) => ({
          id: index,
          value: tableName,
          label: tableName
        }));
        setTables(tableOptions);
        console.log(`✅ Loaded ${response.data.length} tables from B0012`);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('❌ Error loading tables:', error);
      setError('Failed to load table options');
      setSnackbar({
        open: true,
        message: 'Failed to load table options from B0012',
        type: 'error'
      });
    } finally {
      setLoading(prev => ({ ...prev, tables: false }));
    }
  }, []);

  // B0013: Get columns by selected table
  const loadColumns = useCallback(async (selectedTable: string) => {
    if (!selectedTable) {
      setColumns([]);
      return;
    }

    try {
      setLoading(prev => ({ ...prev, columns: true }));
      console.log(`🗂️ Loading columns from B0013 for table: ${selectedTable}`);

      const response = await api.banking.businessSettings.getColumns(selectedTable);

      if (response.success && response.data) {
        // Backend returns string array, convert to BusinessSettingOption format
        const columnOptions = response.data.map((colName: string, index: number) => ({
          id: index,
          value: colName,
          label: colName
        }));
        setColumns(columnOptions);
        console.log(`✅ Loaded ${response.data.length} columns from B0013 for table ${selectedTable}`);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('❌ Error loading columns:', error);
      setColumns([]);
      setSnackbar({
        open: true,
        message: `Failed to load column options for table ${selectedTable}`,
        type: 'error'
      });
    } finally {
      setLoading(prev => ({ ...prev, columns: false }));
    }
  }, []);

  // B0013: Get data type for selected column and table
  const loadDataType = useCallback(async (selectedColumn: string, selectedTable: string) => {
    if (!selectedColumn || !selectedTable) {
      setFormData(prev => ({ ...prev, data_type: '' }));
      return;
    }

    try {
      setLoading(prev => ({ ...prev, dataType: true }));
      console.log(`🔢 Loading data type from B0013 for column: ${selectedColumn}, table: ${selectedTable}`);

      const response = await api.banking.businessSettings.getDataType(selectedColumn, selectedTable);

      if (response.success && response.data) {
        const dataType = response.data.data_type;
        setFormData(prev => ({ ...prev, data_type: dataType }));
        console.log(`✅ Auto-populated data type: ${dataType} for column ${selectedColumn}, table ${selectedTable}`);

        // Auto-load operators for this data type
        loadOperators(dataType);
      } else {
        setFormData(prev => ({ ...prev, data_type: '' }));
        console.log('ℹ️ No data type found for this column-table combination');
      }
    } catch (error) {
      console.error('❌ Error loading data type:', error);
      setFormData(prev => ({ ...prev, data_type: '' }));
    } finally {
      setLoading(prev => ({ ...prev, dataType: false }));
    }
  }, []);

  // B0014: Get operators by selected data type
  const loadOperators = useCallback(async (selectedDataType: string) => {
    if (!selectedDataType) {
      setOperators([]);
      return;
    }

    try {
      setLoading(prev => ({ ...prev, operators: true }));
      console.log(`⚙️ Loading operators from B0014 for data type: ${selectedDataType}`);

      const response = await api.banking.businessSettings.getOperators(selectedDataType);

      if (response.success && response.data) {
        // Backend returns string array, convert to BusinessSettingOption format
        const operatorOptions = response.data.map((opName: string, index: number) => ({
          id: index,
          value: opName,
          label: opName
        }));
        setOperators(operatorOptions);
        console.log(`✅ Loaded ${response.data.length} operators from B0014 for data type ${selectedDataType}`);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('❌ Error loading operators:', error);
      setOperators([]);
      setSnackbar({
        open: true,
        message: `Failed to load operator options for data type ${selectedDataType}`,
        type: 'error'
      });
    } finally {
      setLoading(prev => ({ ...prev, operators: false }));
    }
  }, []);

  // B0015: Get conditions (AND/OR)
  const loadConditions = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, conditions: true }));
      console.log('🔗 Loading conditions from B0015');

      const response = await api.banking.businessSettings.getConditions();

      if (response.success && response.data) {
        setConditions(response.data);
        console.log(`✅ Loaded ${response.data.length} conditions from B0015`);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('❌ Error loading conditions:', error);
      setError('Failed to load condition options');
      setSnackbar({
        open: true,
        message: 'Failed to load condition options from B0015',
        type: 'error'
      });
    } finally {
      setLoading(prev => ({ ...prev, conditions: false }));
    }
  }, []);

  // B0016: Get column values for multi-select (IN/NOT IN operators)
  const loadColumnValues = useCallback(async (selectedColumn: string, selectedTable: string) => {
    if (!selectedColumn || !selectedTable) {
      setColumnValues([]);
      return;
    }

    try {
      setLoading(prev => ({ ...prev, columnValues: true }));
      console.log(`📋 Loading column values from B0016 for column: ${selectedColumn}, table: ${selectedTable}`);

      const response = await api.banking.businessSettings.getColumnValues(selectedColumn, selectedTable);

      if (response.success && response.data) {
        setColumnValues(response.data);
        console.log(`✅ Loaded ${response.data.length} column values from B0016 for column ${selectedColumn}, table ${selectedTable}`);
      } else {
        setColumnValues([]);
        console.log('ℹ️ No column values found for this column-table combination');
      }
    } catch (error) {
      console.error('❌ Error loading column values:', error);
      setColumnValues([]);
    } finally {
      setLoading(prev => ({ ...prev, columnValues: false }));
    }
  }, []);

  // ==========================================
  // INITIALIZATION - LOAD INITIAL DATA
  // ==========================================

  useEffect(() => {
    if (open) {
      // Load initial dropdown data
      loadTables();
      loadConditions();

      // Initialize form data for edit mode
      if (editData && mode === 'edit') {
        setFormData({
          query_group: editData.query_group || '',
          seq: editData.seq || '',
          table_name: editData.table_name || '',
          column_name: editData.column_name || '',
          data_type: editData.data_type || '',
          operator: editData.operator || '',
          value1: editData.value1 || '',
          value2: editData.value2 || '',
          condition: editData.condition || ''
        });

        // Load dependent data for edit mode
        if (editData.table_name) {
          loadColumns(editData.table_name);
        }
        if (editData.data_type) {
          loadOperators(editData.data_type);
        }
        if (editData.column_name && editData.table_name) {
          loadColumnValues(editData.column_name, editData.table_name);
        }

        // Parse dates for edit mode
        if (editData.value1 && editData.data_type === 'DATE') {
          try {
            const date1 = parse(editData.value1, 'dd-MMM-yyyy', new Date());
            setDatePickerValue1(date1);
          } catch (e) {
            console.warn('Could not parse date value1:', editData.value1);
          }
        }

        if (editData.value2 && editData.data_type === 'DATE') {
          try {
            const date2 = parse(editData.value2, 'dd-MMM-yyyy', new Date());
            setDatePickerValue2(date2);
          } catch (e) {
            console.warn('Could not parse date value2:', editData.value2);
          }
        }

        // Parse multi-select values for edit mode
        if (editData.value1 && (editData.operator === 'IN' || editData.operator === 'NOT IN')) {
          try {
            const values = editData.value1.split(',').map((v: string) => v.trim());
            setSelectedMultiValues(values);
          } catch (e) {
            console.warn('Could not parse multi-select values:', editData.value1);
          }
        }
      }
    }
  }, [open, editData, mode, loadTables, loadConditions, loadColumns, loadOperators, loadColumnValues]);

  // ==========================================
  // EVENT HANDLERS - EXACT LEGACY LOGIC PATTERNS
  // ==========================================

  // Handle table selection change
  const handleTableChange = useCallback((newTable: string) => {
    console.log(`🗃️ Table changed to: ${newTable}`);

    setFormData(prev => ({
      ...prev,
      table_name: newTable,
      column_name: '', // Reset column when table changes
      data_type: '', // Reset data type
      operator: '', // Reset operator
      value1: '', // Reset values
      value2: ''
    }));

    // Clear dependent states
    setColumns([]);
    setOperators([]);
    setColumnValues([]);
    setSelectedMultiValues([]);
    setDatePickerValue1(null);
    setDatePickerValue2(null);

    // Load columns for new table
    if (newTable) {
      loadColumns(newTable);
    }
  }, [loadColumns]);

  // Handle column selection change
  const handleColumnChange = useCallback((newColumn: string) => {
    console.log(`🗂️ Column changed to: ${newColumn}`);

    setFormData(prev => ({
      ...prev,
      column_name: newColumn,
      data_type: '', // Reset data type
      operator: '', // Reset operator
      value1: '', // Reset values
      value2: ''
    }));

    // Clear dependent states
    setOperators([]);
    setColumnValues([]);
    setSelectedMultiValues([]);
    setDatePickerValue1(null);
    setDatePickerValue2(null);

    // Auto-detect data type and load operators
    if (newColumn && formData.table_name) {
      loadDataType(newColumn, formData.table_name);
      loadColumnValues(newColumn, formData.table_name); // Pre-load for potential IN/NOT IN use
    }
  }, [formData.table_name, loadDataType, loadColumnValues]);

  // Handle operator selection change - EXACT LEGACY setOperatorChange() function
  const handleOperatorChange = useCallback((newOperator: string) => {
    console.log(`⚙️ Operator changed to: ${newOperator}`);

    setFormData(prev => ({
      ...prev,
      operator: newOperator,
      value1: '', // Reset values when operator changes
      value2: ''
    }));

    // Clear value states
    setSelectedMultiValues([]);
    setDatePickerValue1(null);
    setDatePickerValue2(null);
  }, []);

  // ==========================================
  // VALUE INPUT HANDLING - EXACT LEGACY setValueInputType() LOGIC
  // ==========================================

  // Determine which input type to show based on data type and operator
  const getInputType = useCallback(() => {
    const { data_type, operator } = formData;

    if (data_type === 'BOOLEAN') {
      return 'boolean';
    } else if (data_type === 'DATE') {
      if (operator === 'BETWEEN') {
        return 'date-range';
      } else {
        return 'date-single';
      }
    } else if (operator === 'IN' || operator === 'NOT IN') {
      return 'multi-select';
    } else if (operator === 'BETWEEN') {
      return 'range';
    } else {
      return 'single';
    }
  }, [formData]);

  // Handle boolean value changes (1=True, 0=False - EXACT LEGACY PATTERN)
  const handleBooleanChange = useCallback((value: string) => {
    setFormData(prev => ({ ...prev, value1: value }));
  }, []);

  // Handle date value changes with DD-MMM-YYYY format (EXACT LEGACY PATTERN)
  const handleDateValue1Change = useCallback((date: Date | null) => {
    setDatePickerValue1(date);
    if (date) {
      const formattedDate = format(date, 'dd-MMM-yyyy');
      setFormData(prev => ({ ...prev, value1: formattedDate }));
    } else {
      setFormData(prev => ({ ...prev, value1: '' }));
    }
  }, []);

  const handleDateValue2Change = useCallback((date: Date | null) => {
    setDatePickerValue2(date);
    if (date) {
      const formattedDate = format(date, 'dd-MMM-yyyy');
      setFormData(prev => ({ ...prev, value2: formattedDate }));
    } else {
      setFormData(prev => ({ ...prev, value2: '' }));
    }
  }, []);

  // Handle multi-select value changes (EXACT LEGACY PATTERN)
  const handleMultiSelectChange = useCallback((value: string, checked: boolean) => {
    let newSelectedValues: string[];

    if (checked) {
      newSelectedValues = [...selectedMultiValues, value];
    } else {
      newSelectedValues = selectedMultiValues.filter(v => v !== value);
    }

    setSelectedMultiValues(newSelectedValues);

    // Update form data with comma-separated values (EXACT LEGACY FORMAT)
    const value1String = newSelectedValues.join(', ');
    setFormData(prev => ({ ...prev, value1: value1String }));
  }, [selectedMultiValues]);

  // Handle regular text input changes
  const handleInputChange = useCallback((field: keyof SegmentationDetailForm, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  // ==========================================
  // FORM SUBMISSION - EXACT LEGACY PATTERN
  // ==========================================

  const handleSave = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, saving: true }));

      // Validation - EXACT LEGACY PATTERN
      if (!formData.query_group || !formData.seq || !formData.table_name ||
        !formData.column_name || !formData.data_type || !formData.operator) {
        throw new Error('Please fill in all required fields');
      }

      // Prepare data for submission - EXACT LEGACY PATTERN
      const submitData = {
        segment_id: segmentId,
        query_group: Number(formData.query_group),
        seq: Number(formData.seq),
        table_name: formData.table_name,
        column_name: formData.column_name,
        data_type: formData.data_type,
        operator: formData.operator,
        value1: formData.value1,
        value2: formData.value2,
        condition: formData.condition
      };

      console.log('💾 Submitting segmentation detail:', submitData);

      await onSave(submitData);

      setSnackbar({
        open: true,
        message: `Segmentation detail ${mode === 'add' ? 'created' : 'updated'} successfully`,
        type: 'success'
      });

      // Close modal after successful save
      setTimeout(() => {
        onClose();
      }, 1500);

    } catch (error) {
      console.error('❌ Error saving segmentation detail:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setSnackbar({
        open: true,
        message: `Failed to ${mode === 'add' ? 'create' : 'update'} segmentation detail: ${errorMessage}`,
        type: 'error'
      });
    } finally {
      setLoading(prev => ({ ...prev, saving: false }));
    }
  }, [formData, segmentId, mode, onSave, onClose]);

  // ==========================================
  // RENDER HELPERS - VALUE INPUT COMPONENTS
  // ==========================================

  const renderValueInputs = () => {
    const inputType = getInputType();

    switch (inputType) {
      case 'boolean':
        return (
          <Card variant="outlined" sx={{ p: 2 }}>
            <FormControl component="fieldset">
              <FormLabel component="legend">Value1 (Boolean)</FormLabel>
              <RadioGroup
                row
                value={formData.value1}
                onChange={(e) => handleBooleanChange(e.target.value)}
              >
                <FormControlLabel value="1" control={<Radio />} label="True" />
                <FormControlLabel value="0" control={<Radio />} label="False" />
              </RadioGroup>
            </FormControl>
          </Card>
        );

      case 'date-single':
        return (
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="Value Start (DD-MMM-YYYY)"
              value={datePickerValue1}
              onChange={handleDateValue1Change}
              format="dd-MMM-yyyy"
              slotProps={{
                textField: {
                  fullWidth: true,
                  variant: 'outlined',
                  InputProps: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <CalendarIcon />
                      </InputAdornment>
                    )
                  }
                }
              }}
            />
          </LocalizationProvider>
        );

      case 'date-range':
        return (
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Stack spacing={2}>
              <DatePicker
                label="Value Start (DD-MMM-YYYY)"
                value={datePickerValue1}
                onChange={handleDateValue1Change}
                format="dd-MMM-yyyy"
                slotProps={{
                  textField: {
                    fullWidth: true,
                    variant: 'outlined',
                    InputProps: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <CalendarIcon />
                        </InputAdornment>
                      )
                    }
                  }
                }}
              />
              <DatePicker
                label="Value End (DD-MMM-YYYY)"
                value={datePickerValue2}
                onChange={handleDateValue2Change}
                format="dd-MMM-yyyy"
                slotProps={{
                  textField: {
                    fullWidth: true,
                    variant: 'outlined',
                    InputProps: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <CalendarIcon />
                        </InputAdornment>
                      )
                    }
                  }
                }}
              />
            </Stack>
          </LocalizationProvider>
        );

      case 'multi-select':
        return (
          <Card variant="outlined" sx={{ p: 2, maxHeight: 300, overflow: 'auto' }}>
            <Typography variant="subtitle2" gutterBottom>
              Value 1 (Select Multiple - {selectedMultiValues.length} selected)
            </Typography>
            {loading.columnValues ? (
              <Box display="flex" alignItems="center" gap={1}>
                <CircularProgress size={16} />
                <Typography variant="body2">Loading column values...</Typography>
              </Box>
            ) : columnValues.length > 0 ? (
              <FormGroup>
                {columnValues.map((option) => (
                  <FormControlLabel
                    key={option.id}
                    control={
                      <Checkbox
                        checked={selectedMultiValues.includes(option.value)}
                        onChange={(e) => handleMultiSelectChange(option.value, e.target.checked)}
                        size="small"
                      />
                    }
                    label={`${option.label} (${option.value})`}
                  />
                ))}
              </FormGroup>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No values available for this column
              </Typography>
            )}
          </Card>
        );

      case 'range':
        return (
          <Stack spacing={2}>
            <TextField
              label="Value 1 (Start)"
              fullWidth
              value={formData.value1}
              onChange={(e) => handleInputChange('value1', e.target.value)}
              variant="outlined"
            />
            <TextField
              label="Value 2 (End)"
              fullWidth
              value={formData.value2}
              onChange={(e) => handleInputChange('value2', e.target.value)}
              variant="outlined"
            />
          </Stack>
        );

      case 'single':
      default:
        return (
          <TextField
            label="Value 1"
            fullWidth
            value={formData.value1}
            onChange={(e) => handleInputChange('value1', e.target.value)}
            variant="outlined"
          />
        );
    }
  };

  // ==========================================
  // MAIN RENDER - EXACT LEGACY FORM STRUCTURE
  // ==========================================

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { minHeight: '600px' }
        }}
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            {mode === 'add' ? <AddIcon /> : mode === 'edit' ? <EditIcon /> : <InfoIcon />}
            <Typography variant="h6">
              {mode === 'add' ? 'Add' : mode === 'edit' ? 'Edit' : 'View'} Segmentation Configuration Detail
            </Typography>
          </Box>
        </DialogTitle>

        <DialogContent dividers>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Grid container spacing={3}>
            {/* Basic Fields */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Query Grouping *"
                type="number"
                fullWidth
                value={formData.query_group}
                onChange={(e) => handleInputChange('query_group', e.target.value)}
                disabled={mode === 'view'}
                variant="outlined"
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Sequence *"
                type="number"
                fullWidth
                value={formData.seq}
                onChange={(e) => handleInputChange('seq', e.target.value)}
                disabled={mode === 'view'}
                variant="outlined"
              />
            </Grid>

            {/* Table Dropdown - B0012 */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                select
                label="Table Name *"
                fullWidth
                value={formData.table_name || ''}
                onChange={(e) => handleTableChange(e.target.value)}
                disabled={mode === 'view' || loading.tables}
                variant="outlined"
                InputProps={{
                  endAdornment: loading.tables ? (
                    <InputAdornment position="end">
                      <CircularProgress size={20} />
                    </InputAdornment>
                  ) : null
                }}
              >
                {tables.map((table, idx) => (
                  <MenuItem key={`${table.id}-${idx}`} value={table.value}>
                    {table.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* Column Dropdown - B0013 */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                select
                label="Column Name *"
                fullWidth
                value={formData.column_name}
                onChange={(e) => handleColumnChange(e.target.value)}
                disabled={mode === 'view' || loading.columns || !formData.table_name}
                variant="outlined"
                InputProps={{
                  endAdornment: loading.columns ? (
                    <InputAdornment position="end">
                      <CircularProgress size={20} />
                    </InputAdornment>
                  ) : null
                }}
              >
                {columns.map((column, idx) => (
                  <MenuItem key={`${column.id}-${idx}`} value={column.value}>
                    {column.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* Data Type - Auto-populated from B0013 */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Data Type (Auto-detected)"
                fullWidth
                value={formData.data_type}
                disabled={true}
                variant="outlined"
                InputProps={{
                  startAdornment: loading.dataType ? (
                    <InputAdornment position="start">
                      <CircularProgress size={20} />
                    </InputAdornment>
                  ) : null
                }}
              />
            </Grid>

            {/* Operator Dropdown - B0014 */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                select
                label="Operator *"
                fullWidth
                value={formData.operator}
                onChange={(e) => handleOperatorChange(e.target.value)}
                disabled={mode === 'view' || loading.operators || !formData.data_type}
                variant="outlined"
                InputProps={{
                  endAdornment: loading.operators ? (
                    <InputAdornment position="end">
                      <CircularProgress size={20} />
                    </InputAdornment>
                  ) : null
                }}
              >
                {operators.map((operator, idx) => (
                  <MenuItem key={`${operator.id}-${idx}`} value={operator.value}>
                    {operator.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* Dynamic Value Inputs - EXACT LEGACY PATTERN */}
            <Grid size={{ xs: 12 }}>
              <Card variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Value Configuration
                </Typography>
                <Divider sx={{ mb: 2 }} />
                {renderValueInputs()}
              </Card>
            </Grid>

            {/* Condition Dropdown - B0015 */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                select
                label="And/Or Condition"
                fullWidth
                value={formData.condition}
                onChange={(e) => handleInputChange('condition', e.target.value)}
                disabled={mode === 'view' || loading.conditions}
                variant="outlined"
                InputProps={{
                  endAdornment: loading.conditions ? (
                    <InputAdornment position="end">
                      <CircularProgress size={20} />
                    </InputAdornment>
                  ) : null
                }}
              >
                {conditions.map((condition, idx) => (
                  <MenuItem key={`${condition.id}-${idx}`} value={condition.value}>
                    {condition.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions>
          <Button
            onClick={onClose}
            startIcon={<CancelIcon />}
            disabled={loading.saving}
          >
            Cancel
          </Button>

          {mode !== 'view' && (
            <Button
              onClick={handleSave}
              variant="contained"
              startIcon={loading.saving ? <CircularProgress size={16} /> : <SaveIcon />}
              disabled={loading.saving}
            >
              {loading.saving ? 'Saving...' : 'Save'}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Success/Error Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          severity={snackbar.type}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

console.log('✅ Business Parameter Segmentation Modal loaded - EXACT user specifications implemented');

export default BusinessParameterSegmentationModal;