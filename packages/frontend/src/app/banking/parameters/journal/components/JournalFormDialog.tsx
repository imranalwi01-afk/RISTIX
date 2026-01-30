// packages/frontend/src/app/banking/parameters/journal/components/JournalFormDialog.tsx
// ============================================================================
// 🔧 EXTRACTED COMPONENT: Journal Form Dialog with React.memo
// ============================================================================
// ✅ OPTIMIZATION: Prevents re-renders of main page when typing in form fields
// ✅ INTERNAL STATE: Form state managed within dialog, passed via onSave callback
// ============================================================================

'use client';

import React, { useState, useEffect, useCallback, memo } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    MenuItem,
    Box,
    FormControlLabel,
    Switch
} from '@mui/material';

// =====================================================
// TYPE DEFINITIONS
// =====================================================

export interface JournalParameter {
    pkid: number;
    glGroup?: string;
    currency?: string;
    glType?: string;
    glCode?: string;
    glNumber?: string;
    dbcr?: string;
    glDesc?: string;
    activeFlag?: boolean;
    createdby?: string;
    createddate?: string;
    updatedby?: string;
    updateddate?: string;
}

export interface JournalFormData {
    glGroup: string;
    currency: string;
    glType: string;
    glCode: string;
    glNumber: string;
    dbcr: string;
    glDesc: string;
    activeFlag: boolean;
}

export interface JournalDropdownOption {
    id: string;
    name: string;
}

interface JournalFormDialogProps {
    open: boolean;
    onClose: () => void;
    onSave: (data: JournalFormData) => void;
    journal?: JournalParameter | null;
    loading?: boolean;
    optionsLoading?: boolean;
    glGroupOptions: JournalDropdownOption[];
    currencyOptions: JournalDropdownOption[];
    journalTypeOptions: JournalDropdownOption[];
    journalCodeOptions: JournalDropdownOption[];
    dbcrOptions: JournalDropdownOption[];
}

// =====================================================
// MEMOIZED DIALOG COMPONENT
// =====================================================

const JournalFormDialog = memo(function JournalFormDialog({
    open,
    onClose,
    onSave,
    journal,
    loading = false,
    optionsLoading = false,
    glGroupOptions,
    currencyOptions,
    journalTypeOptions,
    journalCodeOptions,
    dbcrOptions
}: JournalFormDialogProps) {
    // Internal form state - isolated from parent re-renders
    const [formData, setFormData] = useState<JournalFormData>({
        glGroup: '',
        currency: '',
        glType: '',
        glCode: '',
        glNumber: '',
        dbcr: '',
        glDesc: '',
        activeFlag: true
    });
    const [error, setError] = useState<string | null>(null);

    // Reset form when dialog opens
    useEffect(() => {
        if (open) {
            if (journal) {
                setFormData({
                    glGroup: journal.glGroup || (glGroupOptions.length > 0 ? glGroupOptions[0].id : ''),
                    currency: journal.currency || (currencyOptions.length > 0 ? currencyOptions[0].id : ''),
                    glType: journal.glType || (journalTypeOptions.length > 0 ? journalTypeOptions[0].id : ''),
                    glCode: journal.glCode || '',
                    glNumber: journal.glNumber || '',
                    dbcr: journal.dbcr || (dbcrOptions.length > 0 ? dbcrOptions[0].id : ''),
                    glDesc: journal.glDesc || '',
                    activeFlag: journal.activeFlag ?? true
                });
            } else {
                setFormData({
                    glGroup: glGroupOptions.length > 0 ? glGroupOptions[0].id : '',
                    currency: currencyOptions.length > 0 ? currencyOptions[0].id : '',
                    glType: journalTypeOptions.length > 0 ? journalTypeOptions[0].id : '',
                    glCode: '',
                    glNumber: '',
                    dbcr: dbcrOptions.length > 0 ? dbcrOptions[0].id : '',
                    glDesc: '',
                    activeFlag: true
                });
            }
            setError(null);
        }
    }, [open, journal, glGroupOptions, currencyOptions, journalTypeOptions, dbcrOptions]);

    // Memoized handlers
    const handleFieldChange = useCallback((field: keyof JournalFormData) =>
        (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            setFormData(prev => ({ ...prev, [field]: e.target.value }));
        }, []);

    const handleSwitchChange = useCallback((field: keyof JournalFormData) =>
        (e: React.ChangeEvent<HTMLInputElement>) => {
            setFormData(prev => ({ ...prev, [field]: e.target.checked }));
        }, []);

    const handleSubmit = useCallback(() => {
        const errors: string[] = [];
        if (!formData.glGroup.trim()) errors.push('Journal Group is required');
        if (!formData.currency.trim()) errors.push('Currency is required');
        if (!formData.glType.trim()) errors.push('Journal Type is required');
        if (!formData.glCode.trim()) errors.push('Journal Code is required');
        if (!formData.dbcr.trim()) errors.push('DB/CR is required');

        if (errors.length > 0) {
            setError(errors.join(', '));
            return;
        }

        setError(null);
        onSave(formData);
    }, [formData, onSave]);

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>
                {journal ? 'Edit Journal Parameter' : 'Create Journal Parameter'}
            </DialogTitle>
            <DialogContent>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2, mt: 2 }}>
                    <TextField
                        label="Journal Group *"
                        select
                        value={formData.glGroup}
                        onChange={handleFieldChange('glGroup')}
                        fullWidth
                        required
                        disabled={optionsLoading}
                        error={!formData.glGroup.trim()}
                        helperText={!formData.glGroup.trim() && 'Journal Group is required'}
                    >
                        {glGroupOptions.length > 0 ? (
                            glGroupOptions.map(option => (
                                <MenuItem key={option.id} value={option.id}>{option.name}</MenuItem>
                            ))
                        ) : (
                            <MenuItem value="">Loading...</MenuItem>
                        )}
                    </TextField>
                    <TextField
                        label="Currency *"
                        select
                        value={formData.currency}
                        onChange={handleFieldChange('currency')}
                        fullWidth
                        required
                        disabled={optionsLoading}
                        error={!formData.currency.trim()}
                        helperText={!formData.currency.trim() && 'Currency is required'}
                    >
                        {currencyOptions.length > 0 ? (
                            currencyOptions.map(option => (
                                <MenuItem key={option.id} value={option.id}>{option.name}</MenuItem>
                            ))
                        ) : (
                            <MenuItem value="">Loading...</MenuItem>
                        )}
                    </TextField>
                    <TextField
                        label="Journal Type *"
                        select
                        value={formData.glType}
                        onChange={handleFieldChange('glType')}
                        fullWidth
                        required
                        disabled={optionsLoading}
                        error={!formData.glType.trim()}
                        helperText={!formData.glType.trim() && 'Journal Type is required'}
                    >
                        {journalTypeOptions.length > 0 ? (
                            journalTypeOptions.map(option => (
                                <MenuItem key={option.id} value={option.id}>{option.name}</MenuItem>
                            ))
                        ) : (
                            <MenuItem value="">Loading...</MenuItem>
                        )}
                    </TextField>
                    <TextField
                        label="Journal Code *"
                        select
                        value={formData.glCode}
                        onChange={handleFieldChange('glCode')}
                        fullWidth
                        required
                        disabled={optionsLoading}
                        error={!formData.glCode.trim()}
                        helperText={!formData.glCode.trim() && 'Journal Code is required'}
                    >
                        {journalCodeOptions.length > 0 ? (
                            journalCodeOptions.map(option => (
                                <MenuItem key={option.id} value={option.id}>{option.id} - {option.name}</MenuItem>
                            ))
                        ) : (
                            <MenuItem value="">Loading...</MenuItem>
                        )}
                    </TextField>
                    <TextField
                        label="COA (GL Number)"
                        value={formData.glNumber}
                        onChange={handleFieldChange('glNumber')}
                        fullWidth
                        placeholder="COA Number"
                        slotProps={{ htmlInput: { maxLength: 20 } }}
                        helperText="Chart of Accounts number (optional)"
                    />
                    <TextField
                        label="DB/CR *"
                        select
                        value={formData.dbcr}
                        onChange={handleFieldChange('dbcr')}
                        fullWidth
                        required
                        disabled={optionsLoading}
                        error={!formData.dbcr.trim()}
                        helperText={!formData.dbcr.trim() && 'DB/CR is required'}
                    >
                        {dbcrOptions.length > 0 ? (
                            dbcrOptions.map(option => (
                                <MenuItem key={option.id} value={option.id}>{option.name}</MenuItem>
                            ))
                        ) : (
                            <MenuItem value="">Loading...</MenuItem>
                        )}
                    </TextField>
                    <TextField
                        label="Journal Description"
                        value={formData.glDesc}
                        onChange={handleFieldChange('glDesc')}
                        fullWidth
                        multiline
                        rows={3}
                        sx={{ gridColumn: 'span 2' }}
                        placeholder="Journal Description (optional)"
                        slotProps={{ htmlInput: { maxLength: 255 } }}
                    />
                    <Box sx={{ gridColumn: 'span 2' }}>
                        <FormControlLabel
                            control={<Switch checked={formData.activeFlag} onChange={handleSwitchChange('activeFlag')} />}
                            label="Active"
                        />
                    </Box>
                </Box>
                {error && (
                    <Box sx={{ mt: 2, color: 'error.main', fontSize: '0.875rem' }}>
                        {error}
                    </Box>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={loading}>Cancel</Button>
                <Button onClick={handleSubmit} variant="contained" disabled={loading}>
                    {journal ? 'Update' : 'Create'}
                </Button>
            </DialogActions>
        </Dialog>
    );
});

export default JournalFormDialog;
