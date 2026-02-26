
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
  CircularProgress
} from '@mui/material';
import { api } from '@/services/api';

interface RuleEditorDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (rule: any) => void;
  initialRule?: any;
}

export default function RuleEditorDialog({ open, onClose, onSave, initialRule }: RuleEditorDialogProps) {
  const [loading, setLoading] = useState(false);
  const [tables, setTables] = useState<any[]>([]);
  const [columns, setColumns] = useState<any[]>([]);
  const [operators, setOperators] = useState<any[]>([]);
  
  const [formData, setFormData] = useState<any>({
    seq: 1,
    table_name: '',
    column_name: '',
    operator: '=',
    value1: '',
    value2: '',
    condition: 'AND'
  });

  useEffect(() => {
    if (open) {
      loadTables();
      loadOperators();
      if (initialRule) {
        setFormData(initialRule);
        if (initialRule.table_name) {
            loadColumns(initialRule.table_name);
        }
      } else {
        setFormData({
            seq: 1,
            table_name: '',
            column_name: '',
            operator: '=',
            value1: '',
            value2: '',
            condition: 'AND'
        });
      }
    }
  }, [open, initialRule]);

  // --- Data Loading ---
  const loadTables = async () => {
    try {
      const res = await api.banking.businessSettings.getTables();
      const tableList = Array.isArray(res) ? res.map((t: string) => ({ id: t, label: t, value: t })) : [];
      setTables(tableList);
    } catch (err) {
      console.error(err);
    }
  };

  const loadColumns = async (tableName: string) => {
    if (!tableName) return;
    try {
      const res = await api.banking.businessSettings.getColumns(tableName);
      const colList = Array.isArray(res) ? res.map((c: string) => ({ id: c, label: c, value: c })) : [];
      setColumns(colList);
    } catch (err) {
        console.error(err);
    }
  };

  const loadOperators = async () => {
    try {
       // Mock or API
       const ops = ['=', '>', '<', '>=', '<=', 'IN', 'LIKE', 'BETWEEN'];
       setOperators(ops.map(o => ({ id: o, label: o, value: o })));
    } catch (err) { }
  };

  // --- Handlers ---
  const handleChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
    
    if (field === 'table_name') {
        loadColumns(value);
        setFormData((prev: any) => ({ ...prev, column_name: '' }));
    }
  };

  const handleSubmit = () => {
    onSave(formData);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{initialRule ? 'Edit Rule' : 'Add New Rule'}</DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
                 <TextField
                    label="Sequence"
                    type="number"
                    fullWidth
                    value={formData.seq}
                    onChange={(e) => handleChange('seq', parseInt(e.target.value))}
                 />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
                 <FormControl fullWidth>
                    <InputLabel>Condition</InputLabel>
                    <Select
                        value={formData.condition || 'AND'}
                        label="Condition"
                        onChange={(e) => handleChange('condition', e.target.value)}
                    >
                        <MenuItem value="AND">AND</MenuItem>
                        <MenuItem value="OR">OR</MenuItem>
                    </Select>
                 </FormControl>
            </Grid>
            
            <Grid size={{ xs: 12 }}>
                <FormControl fullWidth>
                    <InputLabel>Table Name</InputLabel>
                    <Select
                        value={formData.table_name || ''}
                        label="Table Name"
                        onChange={(e) => handleChange('table_name', e.target.value)}
                    >
                        {tables.map(t => (
                            <MenuItem key={t.id} value={t.value}>{t.label}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Grid>

            <Grid size={{ xs: 12 }}>
                <FormControl fullWidth disabled={!formData.table_name}>
                    <InputLabel>Column Name</InputLabel>
                    <Select
                        value={formData.column_name || ''}
                        label="Column Name"
                        onChange={(e) => handleChange('column_name', e.target.value)}
                    >
                        {columns.map(c => (
                            <MenuItem key={c.id} value={c.value}>{c.label}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
                <FormControl fullWidth>
                    <InputLabel>Operator</InputLabel>
                    <Select
                        value={formData.operator || ''}
                        label="Operator"
                        onChange={(e) => handleChange('operator', e.target.value)}
                    >
                        {operators.map(o => (
                            <MenuItem key={o.id} value={o.value}>{o.label}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                    label="Value 1"
                    fullWidth
                    value={formData.value1 || ''}
                    onChange={(e) => handleChange('value1', e.target.value)}
                />
            </Grid>

            {formData.operator === 'BETWEEN' && (
                <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                        label="Value 2"
                        fullWidth
                        value={formData.value2 || ''}
                        onChange={(e) => handleChange('value2', e.target.value)}
                    />
                </Grid>
            )}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">Save Rule</Button>
      </DialogActions>
    </Dialog>
  );
}
