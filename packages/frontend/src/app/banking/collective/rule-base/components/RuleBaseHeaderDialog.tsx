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
  Typography,
} from '@mui/material';
import type { RuleBaseHeader } from '../types';

interface Option {
  label: string;
  value: string;
}

interface RuleBaseHeaderDialogProps {
  open: boolean;
  loading: boolean;
  selectedHeader: RuleBaseHeader | null;
  headerFormData: Partial<RuleBaseHeader>;
  headerValidationMessage: string | null;
  ruleTypes: Option[];
  tableOptions: string[];
  headerColumnOptions: string[];
  metadataLoading: {
    tables: boolean;
    headerColumns: boolean;
  };
  canManageRuleBase: boolean;
  onClose: () => void;
  onSave: () => void;
  onHeaderTableChange: (tableName: string) => void;
  onHeaderFormChange: (next: Partial<RuleBaseHeader>) => void;
}

function RuleBaseHeaderDialogComponent({
  open,
  loading,
  selectedHeader,
  headerFormData,
  headerValidationMessage,
  ruleTypes,
  tableOptions,
  headerColumnOptions,
  metadataLoading,
  canManageRuleBase,
  onClose,
  onSave,
  onHeaderTableChange,
  onHeaderFormChange,
}: RuleBaseHeaderDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {selectedHeader ? 'Edit Rule Header' : 'Create Rule Header'}
      </DialogTitle>
      <DialogContent sx={{ mt: 2 }}>
        <Alert severity="info" sx={{ mb: 2 }}>
          <strong>Rule Configuration:</strong><br />
          Configure the main rule parameters that will be used for IFRS 9 collective impairment calculations.
        </Alert>
        {headerValidationMessage ? (
          <Alert severity="warning" sx={{ mb: 2 }}>
            {headerValidationMessage}
          </Alert>
        ) : null}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
          <TextField
            label="Rule Name"
            value={headerFormData.rule_name || ''}
            onChange={(e) => onHeaderFormChange({ ...headerFormData, rule_name: e.target.value })}
            fullWidth
            required
            placeholder="e.g., Stage Classification Rule"
            data-testid="rule-name-field"
          />
          <FormControl fullWidth required>
            <InputLabel>Rule Type</InputLabel>
            <Select
              value={headerFormData.rule_type || ''}
              onChange={(e) => onHeaderFormChange({ ...headerFormData, rule_type: e.target.value })}
              label="Rule Type"
              data-testid="rule-type-field"
            >
              {ruleTypes.length > 0 ? (
                ruleTypes.map((type, idx) => (
                  <MenuItem key={`${type.value}-${idx}`} value={type.value}>{type.label}</MenuItem>
                ))
              ) : (
                [
                  <MenuItem key="STAGE-0" value="STAGE">STAGE</MenuItem>,
                  <MenuItem key="DEFAULT-1" value="DEFAULT">DEFAULT</MenuItem>,
                  <MenuItem key="GL-2" value="GL">GL</MenuItem>,
                  <MenuItem key="CUSTOM-3" value="CUSTOM">CUSTOM</MenuItem>
                ]
              )}
            </Select>
          </FormControl>
          <FormControl fullWidth required>
            <InputLabel>Updated Table</InputLabel>
            <Select
              value={headerFormData.updated_table || ''}
              onChange={(e) => onHeaderTableChange(e.target.value)}
              label="Updated Table"
              data-testid="updated-table-field"
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
          <FormControl fullWidth required disabled={!headerFormData.updated_table}>
            <InputLabel>Updated Column</InputLabel>
            <Select
              value={headerFormData.updated_column || ''}
              onChange={(e) => onHeaderFormChange({ ...headerFormData, updated_column: e.target.value })}
              label="Updated Column"
              data-testid="updated-column-field"
            >
              {metadataLoading.headerColumns ? <MenuItem disabled>Loading...</MenuItem> : null}
              {!metadataLoading.headerColumns && headerColumnOptions.length === 0 ? (
                <MenuItem disabled value="">
                  No options from Business Settings B0013
                </MenuItem>
              ) : null}
              {headerColumnOptions.map((columnName) => (
                <MenuItem key={columnName} value={columnName}>{columnName}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Value"
            value={headerFormData.value || ''}
            onChange={(e) => onHeaderFormChange({ ...headerFormData, value: e.target.value })}
            fullWidth
            required
            placeholder="Target value to set"
            data-testid="rule-value-field"
          />
          <TextField
            label="Sequence"
            type="number"
            value={headerFormData.seq || 1}
            onChange={(e) => onHeaderFormChange({ ...headerFormData, seq: parseInt(e.target.value) || 1 })}
            fullWidth
            required
            inputProps={{ min: 1 }}
            data-testid="rule-seq-field"
          />
        </Box>
        <Box sx={{ mt: 2 }}>
          <FormControl component="fieldset">
            <Typography component="legend">Status</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <input
                type="checkbox"
                checked={headerFormData.active_flag !== false}
                onChange={(e) => onHeaderFormChange({ ...headerFormData, active_flag: e.target.checked })}
                data-testid="rule-active-checkbox"
              />
              <Typography sx={{ ml: 1 }}>Active</Typography>
            </Box>
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
            disabled={loading || Boolean(headerValidationMessage)}
            data-testid="save-rule-header-btn"
          >
            {loading ? <CircularProgress size={20} /> : (selectedHeader ? 'Update' : 'Create')}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}

export const RuleBaseHeaderDialog = memo(RuleBaseHeaderDialogComponent);
