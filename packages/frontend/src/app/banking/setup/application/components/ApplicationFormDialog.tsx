// packages/frontend/src/app/banking/setup/application/components/ApplicationFormDialog.tsx
// ============================================================================
// Application Setting Create/Edit Dialog - Memoized for performance
// ============================================================================

'use client';

import React, { memo, useCallback, useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Box,
    CircularProgress
} from '@mui/material';
import type { ApplicationSettingDataTable, ApplicationSettingFormData } from './types';

interface ApplicationFormDialogProps {
    open: boolean;
    onClose: () => void;
    onSave: (formData: ApplicationSettingFormData) => Promise<void>;
    selectedRecord: ApplicationSettingDataTable | null;
    loading: boolean;
}

function ApplicationFormDialogComponent({
    open,
    onClose,
    onSave,
    selectedRecord,
    loading
}: ApplicationFormDialogProps) {
    const [formData, setFormData] = useState<ApplicationSettingFormData>({
        ParamCode: '',
        ParamName: '',
        ParamUsage: ''
    });

    // Reset form when dialog opens/closes or selected record changes
    useEffect(() => {
        if (open) {
            if (selectedRecord) {
                setFormData({
                    ParamCode: selectedRecord.CommonCode || '',
                    ParamName: selectedRecord.Description || '',
                    ParamUsage: selectedRecord.Value || ''
                });
            } else {
                setFormData({
                    ParamCode: '',
                    ParamName: '',
                    ParamUsage: ''
                });
            }
        }
    }, [open, selectedRecord]);

    // Memoized handlers
    const handleParamCodeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const formatted = e.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, '');
        setFormData(prev => ({ ...prev, ParamCode: formatted }));
    }, []);

    const handleParamNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, ParamName: e.target.value }));
    }, []);

    const handleParamUsageChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, ParamUsage: e.target.value }));
    }, []);

    const handleSubmit = useCallback(async () => {
        await onSave(formData);
    }, [formData, onSave]);

    const isValid = formData.ParamCode?.trim() && formData.ParamName?.trim();

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>
                {selectedRecord ? 'Edit Application Setting' : 'Create Application Setting'}
            </DialogTitle>
            <DialogContent sx={{ mt: 2 }}>
                <Box sx={{ display: 'grid', gap: 2 }}>
                    <TextField
                        label="Common Code"
                        value={formData.ParamCode}
                        onChange={handleParamCodeChange}
                        fullWidth
                        required
                        disabled={!!selectedRecord}
                        placeholder="e.g., APP001"
                        slotProps={{ htmlInput: { maxLength: 10, 'data-testid': 'input-param-code' } }}
                    />
                    <TextField
                        label="Parameter Name"
                        value={formData.ParamName}
                        onChange={handleParamNameChange}
                        fullWidth
                        required
                        placeholder="e.g., System Configuration"
                        slotProps={{ htmlInput: { 'data-testid': 'input-param-name' } }}
                    />
                    <TextField
                        label="Usage Description"
                        value={formData.ParamUsage}
                        onChange={handleParamUsageChange}
                        fullWidth
                        multiline
                        rows={3}
                        placeholder="Describe how this parameter is used in the system"
                        slotProps={{ htmlInput: { 'data-testid': 'input-param-usage' } }}
                    />
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={loading}>
                    Cancel
                </Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    disabled={loading || !isValid}
                    startIcon={loading ? <CircularProgress size={16} /> : null}
                    data-testid="btn-submit-application-setting"
                >
                    {loading ? 'Saving...' : (selectedRecord ? 'Update' : 'Create')}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

// Memoize to prevent re-renders from parent
export const ApplicationFormDialog = memo(ApplicationFormDialogComponent);
