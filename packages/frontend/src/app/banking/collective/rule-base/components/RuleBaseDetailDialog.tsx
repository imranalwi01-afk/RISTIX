'use client';

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
} from '@mui/material';
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
  metadataLoading: {
    tables: boolean;
    detailColumns: boolean;
    detailDataType: boolean;
    detailOperators: boolean;
  };
  onClose: () => void;
  onSave: () => void;
  onDetailFormChange: (next: Partial<RuleBaseDetail>) => void;
  onDetailTableChange: (tableName: string) => void;
  onDetailColumnChange: (columnName: string) => void;
  onDetailOperatorChange: (operator: string) => void;
}

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
  metadataLoading,
  onClose,
  onSave,
  onDetailFormChange,
  onDetailTableChange,
  onDetailColumnChange,
  onDetailOperatorChange,
}: RuleBaseDetailDialogProps) {
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
          <TextField
            label="Value 1"
            value={detailFormData.value1 || ''}
            onChange={(e) => onDetailFormChange({ ...detailFormData, value1: e.target.value })}
            fullWidth
            disabled={['IS NULL', 'IS NOT NULL'].includes(String(detailFormData.operator || '').toUpperCase())}
            placeholder="Primary comparison value"
            data-testid="val1-field"
          />
          <TextField
            label="Value 2"
            value={detailFormData.value2 || ''}
            onChange={(e) => onDetailFormChange({ ...detailFormData, value2: e.target.value })}
            fullWidth
            disabled={String(detailFormData.operator || '').toUpperCase() !== 'BETWEEN'}
            placeholder="Secondary value (for BETWEEN, etc.)"
            data-testid="val2-field"
          />
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
