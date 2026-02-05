'use client';

import React, { useState, useEffect } from 'react';
import { Box, Button, IconButton, Grid, TextField, MenuItem, Paper, Typography } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { MockLookupService, MOCK_COLUMNS, LookupItem } from '@/services/mock/lookup.service';

export interface ConditionRow {
    id: number;
    table: string;
    column: string;
    operator: string;
    value: string;
}

interface ConditionBuilderProps {
    value?: ConditionRow[];
    onChange?: (rows: ConditionRow[]) => void;
}

export const ConditionBuilder: React.FC<ConditionBuilderProps> = ({ value = [], onChange }) => {
    const [rows, setRows] = useState<ConditionRow[]>(value.length > 0 ? value : []);
    const [tables, setTables] = useState<LookupItem[]>([]);
    const [operators, setOperators] = useState<LookupItem[]>([]);

    // Load initial metadata
    useEffect(() => {
        MockLookupService.getByCode('B0012').then(setTables);
        MockLookupService.getByCode('OPERATORS').then(setOperators);
    }, []);

    // Notify parent on change
    useEffect(() => {
        if (onChange) onChange(rows);
    }, [rows, onChange]);

    const addRow = () => {
        const newRow: ConditionRow = {
            id: Date.now(),
            table: '',
            column: '',
            operator: '',
            value: ''
        };
        setRows([...rows, newRow]);
    };

    const removeRow = (id: number) => {
        setRows(rows.filter(r => r.id !== id));
    };

    const updateRow = (id: number, field: keyof ConditionRow, val: string) => {
        setRows(rows.map(r => {
            if (r.id === id) {
                // Reset column if table changes
                if (field === 'table') {
                    return { ...r, [field]: val, column: '' };
                }
                return { ...r, [field]: val };
            }
            return r;
        }));
    };

    return (
        <Paper variant="outlined" sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="subtitle2">Condition Builder</Typography>
                <Button startIcon={<AddIcon />} size="small" onClick={addRow}>Add Condition</Button>
            </Box>

            {rows.length === 0 && (
                <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 2 }}>
                    No conditions defined. Click "Add Condition" to start.
                </Typography>
            )}

            <Grid container spacing={2}>
                {rows.map((row) => {
                    const columns = row.table ? (MOCK_COLUMNS[row.table] || []) : [];

                    return (
                        <Grid size={{ xs: 12 }} key={row.id}>
                            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                {/* Table Select */}
                                <TextField
                                    select size="small" label="Table" sx={{ width: 150 }}
                                    value={row.table}
                                    onChange={(e) => updateRow(row.id, 'table', e.target.value)}
                                >
                                    {tables.map(t => <MenuItem key={t.code} value={t.code}>{t.label}</MenuItem>)}
                                </TextField>

                                {/* Column Select */}
                                <TextField
                                    select size="small" label="Column" sx={{ width: 150 }}
                                    value={row.column}
                                    onChange={(e) => updateRow(row.id, 'column', e.target.value)}
                                    disabled={!row.table}
                                >
                                    {columns.map(c => <MenuItem key={c.code} value={c.code}>{c.label}</MenuItem>)}
                                </TextField>

                                {/* Operator Select */}
                                <TextField
                                    select size="small" label="Operator" sx={{ width: 120 }}
                                    value={row.operator}
                                    onChange={(e) => updateRow(row.id, 'operator', e.target.value)}
                                >
                                    {operators.map(o => <MenuItem key={o.code} value={o.code}>{o.label}</MenuItem>)}
                                </TextField>

                                {/* Value Input */}
                                <TextField
                                    size="small" label="Value" sx={{ flexGrow: 1 }}
                                    value={row.value}
                                    onChange={(e) => updateRow(row.id, 'value', e.target.value)}
                                    placeholder="Value..."
                                />

                                <IconButton size="small" color="error" onClick={() => removeRow(row.id)}>
                                    <DeleteIcon />
                                </IconButton>
                            </Box>
                        </Grid>
                    );
                })}
            </Grid>
        </Paper>
    );
};
