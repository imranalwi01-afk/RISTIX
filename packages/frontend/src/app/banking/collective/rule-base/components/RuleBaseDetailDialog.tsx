'use client';

<<<<<<< HEAD
import React, { memo } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Autocomplete
} from '@mui/material';
=======
import React, { memo, useMemo } from 'react';
import Autocomplete from '@mui/material/Autocomplete';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import InputLabel from '@mui/material/InputLabel';
import ListItemText from '@mui/material/ListItemText';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';
>>>>>>> 95891788e4270ec54be2165c6c6d8c7a4be96dee
import type { RuleBaseDetail } from '../types';

interface Option {
  label: string;
  value: string;
}

interface RuleBaseDetailDialogProps {
  open: boolean;
  loading: boolean;
  selectedDetail: RuleBaseDetail | null;
  detailFormData: Partial<RuleBaseDetail>;
  detailValidationMessage: string | null;
  canManageRuleBase: boolean;
  conditions: Option[];
  stages: Option[];
  tableOptions: string[];
  detailColumnOptions: string[];
  detailOperatorOptions: string[];
<<<<<<< HEAD
  detailColumnValues?: string[];
=======
  columnValueOptions: string[];
  loadingColumnValues: boolean;
>>>>>>> 95891788e4270ec54be2165c6c6d8c7a4be96dee
  metadataLoading: {
    tables: boolean;
    detailColumns: boolean;
    detailDataType: boolean;
    detailOperators: boolean;
    detailValues?: boolean;
  };
  onClose: () => void;
  onSave: () => void;
  onDetailFormChange: (next: Partial<RuleBaseDetail>) => void;
  onDetailTableChange: (tableName: string) => void;
  onDetailColumnChange: (columnName: string) => void;
  onDetailOperatorChange: (operator: string) => void;
}

const isInOp = (op: string) => ['IN', 'NOT IN'].includes(op);
const isLikeOp = (op: string) => ['LIKE', 'NOT LIKE'].includes(op);
const isNullOp = (op: string) => ['IS NULL', 'IS NOT NULL'].includes(op);
const isBetweenOp = (op: string) => op === 'BETWEEN';

type DataKind = 'date' | 'number' | 'varchar' | 'boolean' | 'unknown';

const getDataKind = (dataType: string): DataKind => {
  const normalized = String(dataType || '').trim().toUpperCase();
  if (['DATE', 'DATETIME', 'TIMESTAMP'].includes(normalized)) return 'date';
  if (['NUMBER', 'NUMERIC', 'INTEGER', 'INT', 'DECIMAL', 'FLOAT', 'DOUBLE'].includes(normalized)) return 'number';
  if (['BOOLEAN', 'BOOL', 'BIT'].includes(normalized)) return 'boolean';
  if (['VARCHAR', 'CHAR', 'STRING', 'TEXT'].includes(normalized)) return 'varchar';
  return 'unknown';
};

function RuleBaseDetailDialogComponent({
  open,
  loading,
  selectedDetail,
  detailFormData,
  detailValidationMessage,
  canManageRuleBase,
  conditions,
  stages,
  tableOptions,
  detailColumnOptions,
  detailOperatorOptions,
<<<<<<< HEAD
  detailColumnValues = [],
=======
  columnValueOptions,
  loadingColumnValues,
>>>>>>> 95891788e4270ec54be2165c6c6d8c7a4be96dee
  metadataLoading,
  onClose,
  onSave,
  onDetailFormChange,
  onDetailTableChange,
  onDetailColumnChange,
  onDetailOperatorChange,
}: RuleBaseDetailDialogProps) {
<<<<<<< HEAD

  const isSetOperator = (operator: string) => ['IN', 'NOT IN'].includes(String(operator || '').toUpperCase());
  const isBetweenOperator = (operator: string) => String(operator || '').toUpperCase() === 'BETWEEN';

  const getDataKind = (dataType: string) => {
    const normalized = String(dataType || '').trim().toUpperCase();
    if (['DATE', 'DATETIME', 'TIMESTAMP'].includes(normalized)) return 'date';
    if (['NUMBER', 'NUMERIC', 'INTEGER', 'INT', 'DECIMAL', 'FLOAT', 'DOUBLE'].includes(normalized)) return 'number';
    if (['BOOLEAN', 'BOOL', 'BIT'].includes(normalized)) return 'boolean';
    if (['VARCHAR', 'CHAR', 'STRING', 'TEXT'].includes(normalized)) return 'varchar';
    return 'unknown';
  };

  const currentDataKind = getDataKind(detailFormData.data_type || '');
=======
  const operator = String(detailFormData.operator || '').toUpperCase();

  const selectedValues = useMemo(() => {
    if (!detailFormData.value1) return [];
    return String(detailFormData.value1).split(',').map(v => v.trim()).filter(Boolean);
  }, [detailFormData.value1]);

  const handleMultiSelectChange = (_: any, values: string[]) => {
    onDetailFormChange({ ...detailFormData, value1: values.join(',') });
  };

  const renderValue1Field = () => {
    if (isNullOp(operator)) {
      return (
        <TextField
          label="Value 1"
          value=""
          fullWidth
          disabled
          helperText="No value needed for IS NULL / IS NOT NULL"
          data-testid="val1-field"
        />
      );
    }

    const dataType = String(detailFormData.data_type || '').toUpperCase();
    const dataKind = getDataKind(dataType);

    if (isInOp(operator)) {
      if (dataKind === 'number') {
        return (
          <TextField
            label="Value 1"
            value={detailFormData.value1 || ''}
            onChange={(e) => onDetailFormChange({ ...detailFormData, value1: e.target.value })}
            fullWidth
            placeholder="e.g. 10,20,30"
            helperText="Comma-separated numeric values"
            data-testid="val1-field"
          />
        );
      }

      return (
        <FormControl fullWidth>
          <Autocomplete
            multiple
            freeSolo={dataKind === 'varchar'}
            options={columnValueOptions}
            value={selectedValues}
            onChange={handleMultiSelectChange}
            disableCloseOnSelect
            loading={loadingColumnValues}
            renderTags={(values, getTagProps) =>
              values.map((value, idx) => {
                const { key, ...chipProps } = getTagProps({ index: idx });
                return <Chip key={key ?? value} label={value} size="small" {...chipProps} />;
              })
            }
            renderOption={(props, option, { selected }) => (
              <li {...props}>
                <Checkbox checked={selected} sx={{ mr: 1 }} />
                <ListItemText primary={option} />
              </li>
            )}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Value 1"
                placeholder="Select values..."
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {loadingColumnValues ? <CircularProgress size={16} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
            data-testid="val1-multi-select"
          />
          <FormHelperText>
            {columnValueOptions.length === 0 && !loadingColumnValues
              ? 'No values available for this column'
              : `Select one or more values (${columnValueOptions.length} options)`}
          </FormHelperText>
        </FormControl>
      );
    }

    if (isLikeOp(operator)) {
      return (
        <TextField
          label="Value 1"
          value={detailFormData.value1 || ''}
          onChange={(e) => onDetailFormChange({ ...detailFormData, value1: e.target.value })}
          fullWidth
          placeholder={'Use % for wildcard, e.g. R% or %account%'}
          helperText={'Use % as wildcard: R% starts with R, %W% contains W'}
          data-testid="val1-field"
        />
      );
    }

    if (dataKind === 'date') {
      return (
        <TextField
          label="Value 1"
          type="date"
          value={detailFormData.value1 || ''}
          onChange={(e) => onDetailFormChange({ ...detailFormData, value1: e.target.value })}
          fullWidth
          InputLabelProps={{ shrink: true }}
          helperText="Date (YYYY-MM-DD)"
          data-testid="val1-field"
        />
      );
    }

    if (dataKind === 'number') {
      return (
        <TextField
          label="Value 1"
          type="number"
          value={detailFormData.value1 || ''}
          onChange={(e) => onDetailFormChange({ ...detailFormData, value1: e.target.value })}
          fullWidth
          placeholder="Numeric value"
          data-testid="val1-field"
        />
      );
    }

    if (dataKind === 'boolean') {
      return (
        <FormControl fullWidth>
          <InputLabel id="boolean-value-label">Value 1</InputLabel>
          <Select
            labelId="boolean-value-label"
            label="Value 1"
            value={String(detailFormData.value1 || '')}
            onChange={(e) => onDetailFormChange({ ...detailFormData, value1: e.target.value })}
            data-testid="val1-field"
          >
            <MenuItem value="1">True</MenuItem>
            <MenuItem value="0">False</MenuItem>
          </Select>
        </FormControl>
      );
    }

    return (
      <TextField
        label="Value 1"
        value={detailFormData.value1 || ''}
        onChange={(e) => onDetailFormChange({ ...detailFormData, value1: e.target.value })}
        fullWidth
        placeholder="Primary comparison value"
        data-testid="val1-field"
      />
    );
  };

  const renderValue2Field = () => {
    const dataType = String(detailFormData.data_type || '').toUpperCase();
    const dataKind = getDataKind(dataType);

    if (dataKind === 'date') {
      return (
        <TextField
          label="Value 2"
          type="date"
          value={detailFormData.value2 || ''}
          onChange={(e) => onDetailFormChange({ ...detailFormData, value2: e.target.value })}
          fullWidth
          InputLabelProps={{ shrink: true }}
          helperText="End date (YYYY-MM-DD)"
          data-testid="val2-field"
        />
      );
    }

    if (dataKind === 'number') {
      return (
        <TextField
          label="Value 2"
          type="number"
          value={detailFormData.value2 || ''}
          onChange={(e) => onDetailFormChange({ ...detailFormData, value2: e.target.value })}
          fullWidth
          placeholder="End value"
          data-testid="val2-field"
        />
      );
    }

    return (
      <TextField
        label="Value 2"
        value={detailFormData.value2 || ''}
        onChange={(e) => onDetailFormChange({ ...detailFormData, value2: e.target.value })}
        fullWidth
        placeholder="Secondary value"
        data-testid="val2-field"
      />
    );
  };

>>>>>>> 95891788e4270ec54be2165c6c6d8c7a4be96dee
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {selectedDetail ? 'Edit Rule Detail' : 'Create Rule Detail'}
      </DialogTitle>
      <DialogContent sx={{ mt: 2 }}>
        <Alert severity="info" sx={{ mb: 2 }}>
          <strong>Detail Configuration:</strong><br />
          Configure the specific conditions and logic for this rule detail.
        </Alert>
        {detailValidationMessage ? (
          <Alert severity="warning" sx={{ mb: 2 }}>
            {detailValidationMessage}
          </Alert>
        ) : null}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
          <TextField
            label="Query Group"
            type="number"
            value={detailFormData.query_group || 1}
            onChange={(e) => onDetailFormChange({ ...detailFormData, query_group: parseInt(e.target.value) || 1 })}
            fullWidth
            required
            inputProps={{ min: 1 }}
            data-testid="group-field"
          />
          <TextField
            label="Sequence"
            type="number"
            value={detailFormData.seq || 1}
            onChange={(e) => onDetailFormChange({ ...detailFormData, seq: parseInt(e.target.value) || 1 })}
            fullWidth
            required
            inputProps={{ min: 1 }}
            data-testid="detail-seq-field"
          />
          <FormControl fullWidth required>
            <InputLabel>Table Name</InputLabel>
            <Select
              value={detailFormData.table_name || ''}
              onChange={(e) => onDetailTableChange(e.target.value)}
              label="Table Name"
              data-testid="table-field"
            >
              {metadataLoading.tables ? <MenuItem disabled>Loading...</MenuItem> : null}
              {!metadataLoading.tables && tableOptions.length === 0 ? (
                <MenuItem disabled value="">
                  No options from Business Settings B0012
                </MenuItem>
              ) : null}
              {tableOptions.map((tableName) => (
                <MenuItem key={tableName} value={tableName}>{tableName}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth required disabled={!detailFormData.table_name}>
            <InputLabel>Column Name</InputLabel>
            <Select
              value={detailFormData.column_name || ''}
              onChange={(e) => onDetailColumnChange(e.target.value)}
              label="Column Name"
              data-testid="column-field"
            >
              {metadataLoading.detailColumns ? <MenuItem disabled>Loading...</MenuItem> : null}
              {!metadataLoading.detailColumns && detailColumnOptions.length === 0 ? (
                <MenuItem disabled value="">
                  No options from Business Settings B0013
                </MenuItem>
              ) : null}
              {detailColumnOptions.map((columnName) => (
                <MenuItem key={columnName} value={columnName}>{columnName}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Data Type"
            value={detailFormData.data_type || ''}
            fullWidth
            required
            disabled
            placeholder="Auto-detected from Business Settings"
            data-testid="datatype-field"
            InputProps={{
              startAdornment: metadataLoading.detailDataType ? <CircularProgress size={16} sx={{ mr: 1 }} /> : undefined
            }}
          />
          <FormControl fullWidth required>
            <InputLabel>Operator</InputLabel>
            <Select
              value={detailFormData.operator || ''}
              onChange={(e) => onDetailOperatorChange(e.target.value)}
              label="Operator"
              disabled={!detailFormData.data_type}
              data-testid="operator-select"
            >
              {metadataLoading.detailOperators ? <MenuItem disabled>Loading...</MenuItem> : null}
              {!metadataLoading.detailOperators && detailOperatorOptions.length === 0 ? (
                <MenuItem disabled value="">
                  No options from Business Settings B0014
                </MenuItem>
              ) : null}
              {detailOperatorOptions.map((operator) => (
                <MenuItem key={operator} value={operator}>{operator}</MenuItem>
              ))}
            </Select>
          </FormControl>
<<<<<<< HEAD
          {isSetOperator(detailFormData.operator || '') && currentDataKind === 'varchar' ? (
            <Autocomplete
              multiple
              freeSolo
              options={detailColumnValues}
              value={String(detailFormData.value1 || '')
                .split(',')
                .map((value) => value.trim())
                .filter(Boolean)}
              onChange={(_, newValues) =>
                onDetailFormChange({
                  ...detailFormData,
                  value1: newValues
                    .map((value) => String(value).trim())
                    .filter(Boolean)
                    .join(',')
                })
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Value 1"
                  placeholder="Select one or more values..."
                  fullWidth
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {metadataLoading.detailValues ? <CircularProgress color="inherit" size={20} /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                  data-testid="val1-field"
                />
              )}
              sx={{ gridColumn: isBetweenOperator(detailFormData.operator || '') ? 'span 1' : 'span 2' }}
            />
          ) : currentDataKind === 'date' ? (
            <TextField
              label={isBetweenOperator(detailFormData.operator || '') ? 'Start Date (Value 1)' : 'Date (Value 1)'}
              type="date"
              value={detailFormData.value1 || ''}
              onChange={(e) => onDetailFormChange({ ...detailFormData, value1: e.target.value })}
              fullWidth
              slotProps={{ inputLabel: { shrink: true } }}
              disabled={['IS NULL', 'IS NOT NULL'].includes(String(detailFormData.operator || '').toUpperCase())}
              data-testid="val1-field"
              sx={{ gridColumn: isBetweenOperator(detailFormData.operator || '') ? 'span 1' : 'span 2' }}
            />
          ) : currentDataKind === 'number' ? (
            <TextField
              label={isSetOperator(detailFormData.operator || '') ? 'Value List 1' : 'Value 1'}
              type={isSetOperator(detailFormData.operator || '') ? 'text' : 'number'}
              value={detailFormData.value1 || ''}
              onChange={(e) => onDetailFormChange({ ...detailFormData, value1: e.target.value })}
              fullWidth
              placeholder={isSetOperator(detailFormData.operator || '') ? 'e.g. 10,20,30' : 'Primary comparison value'}
              slotProps={{ htmlInput: isSetOperator(detailFormData.operator || '') ? { inputMode: 'text' } : { inputMode: 'decimal', step: 'any' } }}
              disabled={['IS NULL', 'IS NOT NULL'].includes(String(detailFormData.operator || '').toUpperCase())}
              data-testid="val1-field"
              sx={{ gridColumn: isBetweenOperator(detailFormData.operator || '') ? 'span 1' : 'span 2' }}
            />
          ) : currentDataKind === 'boolean' ? (
            <FormControl fullWidth sx={{ gridColumn: isBetweenOperator(detailFormData.operator || '') ? 'span 1' : 'span 2' }}>
              <InputLabel>Value 1</InputLabel>
              <Select
                value={String(detailFormData.value1 || '')}
                onChange={(e) => onDetailFormChange({ ...detailFormData, value1: e.target.value })}
                label="Value 1"
                disabled={['IS NULL', 'IS NOT NULL'].includes(String(detailFormData.operator || '').toUpperCase())}
                data-testid="val1-field"
              >
                <MenuItem value="1">True</MenuItem>
                <MenuItem value="0">False</MenuItem>
              </Select>
            </FormControl>
          ) : (
            <TextField
              label="Value 1"
              value={detailFormData.value1 || ''}
              onChange={(e) => onDetailFormChange({ ...detailFormData, value1: e.target.value })}
              fullWidth
              disabled={['IS NULL', 'IS NOT NULL'].includes(String(detailFormData.operator || '').toUpperCase())}
              placeholder="Primary comparison value"
              data-testid="val1-field"
              sx={{ gridColumn: isBetweenOperator(detailFormData.operator || '') ? 'span 1' : 'span 2' }}
            />
          )}

          {isBetweenOperator(detailFormData.operator || '') && (
            currentDataKind === 'date' ? (
              <TextField
                label="End Date (Value 2)"
                type="date"
                value={detailFormData.value2 || ''}
                onChange={(e) => onDetailFormChange({ ...detailFormData, value2: e.target.value })}
                fullWidth
                slotProps={{ inputLabel: { shrink: true } }}
                data-testid="val2-field"
              />
            ) : currentDataKind === 'number' ? (
              <TextField
                label="End Value (Value 2)"
                type="number"
                value={detailFormData.value2 || ''}
                onChange={(e) => onDetailFormChange({ ...detailFormData, value2: e.target.value })}
                fullWidth
                slotProps={{ htmlInput: { inputMode: 'decimal', step: 'any' } }}
                data-testid="val2-field"
              />
            ) : (
              <TextField
                label="Value 2"
                value={detailFormData.value2 || ''}
                onChange={(e) => onDetailFormChange({ ...detailFormData, value2: e.target.value })}
                fullWidth
                placeholder="Secondary value (for BETWEEN)"
                data-testid="val2-field"
              />
            )
=======
          {renderValue1Field()}
          {isBetweenOp(operator) && (
            renderValue2Field()
>>>>>>> 95891788e4270ec54be2165c6c6d8c7a4be96dee
          )}
          <FormControl fullWidth required>
            <InputLabel>Condition</InputLabel>
            <Select
              value={detailFormData.condition || 'AND'}
              onChange={(e) => onDetailFormChange({ ...detailFormData, condition: e.target.value as 'AND' | 'OR' })}
              label="Condition"
              data-testid="condition-select"
            >
              {conditions.length > 0 ? (
                conditions.map((cond, idx) => (
                  <MenuItem key={`${cond.value}-${idx}`} value={cond.value}>{cond.label}</MenuItem>
                ))
              ) : (
                [
                  <MenuItem key="AND-0" value="AND">AND</MenuItem>,
                  <MenuItem key="OR-1" value="OR">OR</MenuItem>
                ]
              )}
            </Select>
          </FormControl>
          <TextField
            label="Detail Type"
            value={detailFormData.detail_type || ''}
            onChange={(e) => onDetailFormChange({ ...detailFormData, detail_type: e.target.value })}
            fullWidth
            placeholder="e.g., SICR, DEFAULT, 1, 2, 3"
            data-testid="detail-type-field"
          />
          <FormControl fullWidth>
            <InputLabel>Stage From</InputLabel>
            <Select
              value={String(detailFormData.stage_from || '')}
              onChange={(e) => onDetailFormChange({ ...detailFormData, stage_from: e.target.value })}
              label="Stage From"
              data-testid="stage-from-field"
            >
              <MenuItem value="">None</MenuItem>
              {stages.map((stage) => (
                <MenuItem key={`from-${stage.value}`} value={stage.value}>{stage.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel>Stage To</InputLabel>
            <Select
              value={String(detailFormData.stage_to || '')}
              onChange={(e) => onDetailFormChange({ ...detailFormData, stage_to: e.target.value })}
              label="Stage To"
              data-testid="stage-to-field"
            >
              <MenuItem value="">None</MenuItem>
              {stages.map((stage) => (
                <MenuItem key={`to-${stage.value}`} value={stage.value}>{stage.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        {canManageRuleBase && (
          <Button
            onClick={onSave}
            variant="contained"
            disabled={loading || Boolean(detailValidationMessage)}
            data-testid="save-rule-detail-btn"
          >
            {loading ? <CircularProgress size={20} /> : (selectedDetail ? 'Update' : 'Create')}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}

export const RuleBaseDetailDialog = memo(RuleBaseDetailDialogComponent);
