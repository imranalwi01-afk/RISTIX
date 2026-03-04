// packages/frontend/src/app/banking/setup/business/components/BusinessParameterDialog.tsx
// ============================================================================
// 🔧 EXTRACTED COMPONENT: Business Parameter Dialog with React.memo
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
    Alert,
    Box,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    FormControlLabel,
    Switch
} from '@mui/material';

// =====================================================
// TYPE DEFINITIONS
// =====================================================

export interface BusinessParameter {
    pkid: string;
    param_code: string;
    param_desc: string;
    param_category: string;
    param_value: string;
    param_type: string;
    is_editable: boolean;
    active_flag: boolean;
    created_by: string;
    created_date: string;
}

export interface BusinessParameterFormData {
    param_code: string;
    param_desc: string;
    param_value: string;
    param_category: string;
    param_type: string;
    is_editable: boolean;
    active_flag: boolean;
}

interface BusinessParameterDialogProps {
    open: boolean;
    onClose: () => void;
    onSave: (data: BusinessParameterFormData) => Promise<void> | void;
    parameter?: BusinessParameter | null;
    loading?: boolean;
}

// =====================================================
// MEMOIZED DIALOG COMPONENT
// =====================================================

const BusinessParameterDialog = memo(function BusinessParameterDialog({
    open,
    onClose,
    onSave,
    parameter,
    loading: isExternalLoading = false
}: BusinessParameterDialogProps) {
    // Internal form state - isolated from parent re-renders
    const [formData, setFormData] = useState<BusinessParameterFormData>({
        param_code: '',
        param_desc: '',
        param_value: '',
        param_category: 'B',
        param_type: 'BUSINESS',
        is_editable: true,
        active_flag: true
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Reset form when dialog opens with a different parameter
    useEffect(() => {
        if (open) {
            if (parameter) {
                setFormData({
                    param_code: parameter.param_code,
                    param_desc: parameter.param_desc,
                    param_value: parameter.param_value,
                    param_category: parameter.param_category,
                    param_type: parameter.param_type,
                    is_editable: parameter.is_editable,
                    active_flag: parameter.active_flag
                });
            } else {
                setFormData({
                    param_code: '',
                    param_desc: '',
                    param_value: '',
                    param_category: 'B',
                    param_type: 'BUSINESS',
                    is_editable: true,
                    active_flag: true
                });
            }
            setError(null);
        }
    }, [open, parameter]);

    // Memoized handlers to prevent re-renders
    const handleParamCodeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, param_code: e.target.value }));
    }, []);

    const handleParamDescChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, param_desc: e.target.value }));
    }, []);

    const handleParamValueChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, param_value: e.target.value }));
    }, []);



    const handleEditableChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, is_editable: e.target.checked }));
    }, []);

    const handleActiveChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, active_flag: e.target.checked }));
    }, []);

    const handleSubmit = useCallback(async () => {
        // Validation
        if (!formData.param_code?.trim()) {
            setError('Parameter Code is required');
            return;
        }

        setError(null);
        setLoading(true);

        try {
            await onSave({
                ...formData,
                param_code: formData.param_code.trim(),
                param_desc: formData.param_desc.trim(),
                param_value: formData.param_value.trim()
            });
            onClose();
        } catch (err) {
            setError(err.message || 'Failed to save parameter');
        } finally {
            setLoading(false);
        }
    }, [formData, onSave, onClose]);

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>
                {parameter ? 'Edit Business Parameter' : 'Create Business Parameter'}
            </DialogTitle>
            <DialogContent sx={{ mt: 2 }}>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
                    <TextField
                        fullWidth
                        label="Parameter Code"
                        value={formData.param_code}
                        onChange={handleParamCodeChange}
                        placeholder="e.g., BIZ001"
                        required
                        disabled={!!parameter}
                        inputProps={{ 'data-testid': 'input-param-code' }}
                    />
                    <TextField
                        fullWidth
                        label="Description"
                        value={formData.param_desc}
                        onChange={handleParamDescChange}
                        placeholder="Enter parameter description"
                        required
                        multiline
                        rows={3}
                        sx={{ gridColumn: 'span 2' }}
                        inputProps={{ 'data-testid': 'input-param-desc' }}
                    />
                    <FormControlLabel
                        control={
                            <Switch
                                checked={formData.is_editable}
                                onChange={handleEditableChange}
                            />
                        }
                        label="Editable"
                    />
                    <Box sx={{ gridColumn: 'span 2' }}>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={formData.active_flag}
                                    onChange={handleActiveChange}
                                />
                            }
                            label="Active"
                        />
                    </Box>
                </Box>

                {error && (
                    <Alert severity="error" sx={{ mt: 2 }}>
                        {error}
                    </Alert>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={loading}>Cancel</Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    disabled={loading}
                    data-testid="btn-submit-business-setting"
                >
                    {parameter ? 'Update' : 'Create'}
                </Button>
            </DialogActions>
        </Dialog>
    );
});

export default BusinessParameterDialog;
