// packages/frontend/src/app/banking/setup/application/components/DetailFormDialog.tsx
// ============================================================================
// Parameter Detail Create/Edit Dialog - Memoized for performance
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
    CircularProgress,
    Alert
} from '@mui/material';
import type { ApplicationSettingDetailDataTable, DetailFormData } from './types';

interface DetailFormDialogProps {
    open: boolean;
    onClose: () => void;
    onSave: (formData: DetailFormData) => Promise<void>;
    selectedDetail: ApplicationSettingDetailDataTable | null;
    parentParamCode: string;
    nextSeqNo: number;
    loading: boolean;
}

function DetailFormDialogComponent({
    open,
    onClose,
    onSave,
    selectedDetail,
    parentParamCode,
    nextSeqNo,
    loading
}: DetailFormDialogProps) {
    const [formData, setFormData] = useState<DetailFormData>({
        ParamCode: '',
        SeqNo: 1,
        Value1: '',
        Value2: '',
        Value3: '',
        Description: ''
    });

    // Reset form when dialog opens/closes
    useEffect(() => {
        if (open) {
            if (selectedDetail) {
                setFormData({
                    ParamCode: selectedDetail.param_code || parentParamCode,
                    SeqNo: selectedDetail.param_seq || selectedDetail.SeqNo || 1,
                    Value1: selectedDetail.value1 || selectedDetail.Value1 || '',
                    Value2: selectedDetail.value2 || selectedDetail.Value2 || '',
                    Value3: selectedDetail.value3 || selectedDetail.Value3 || '',
                    Description: selectedDetail.paramdesc || selectedDetail.Description || ''
                });
            } else {
                setFormData({
                    ParamCode: parentParamCode,
                    SeqNo: nextSeqNo,
                    Value1: '',
                    Value2: '',
                    Value3: '',
                    Description: ''
                });
            }
        }
    }, [open, selectedDetail, parentParamCode, nextSeqNo]);

    // Memoized handlers
    const handleSeqNoChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, SeqNo: parseInt(e.target.value) || 1 }));
    }, []);

    const handleValue1Change = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, Value1: e.target.value }));
    }, []);

    const handleValue2Change = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, Value2: e.target.value }));
    }, []);

    const handleValue3Change = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, Value3: e.target.value }));
    }, []);

    const handleDescriptionChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, Description: e.target.value }));
    }, []);

    const handleSubmit = useCallback(async () => {
        await onSave(formData);
    }, [formData, onSave]);

    const isValid = formData.Value1?.trim();

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>
                {selectedDetail ? 'Edit Parameter Detail' : 'Create Parameter Detail'}
            </DialogTitle>
            <DialogContent sx={{ mt: 2 }}>
                <Alert severity="info" sx={{ mb: 2 }}>
                    Adding detail for parameter: <strong>{formData.ParamCode}</strong>
                </Alert>
                <Box sx={{ display: 'grid', gap: 2 }}>
                    <TextField
                        label="Sequence"
                        type="number"
                        value={formData.SeqNo}
                        onChange={handleSeqNoChange}
                        fullWidth
                        required
                        slotProps={{ htmlInput: { min: 1, 'data-testid': 'input-detail-seq' } }}
                    />
                    <TextField
                        label="Value 1"
                        value={formData.Value1}
                        onChange={handleValue1Change}
                        fullWidth
                        required
                        placeholder="Primary value"
                        slotProps={{ htmlInput: { 'data-testid': 'input-detail-value1' } }}
                    />
                    <TextField
                        label="Value 2"
                        value={formData.Value2}
                        onChange={handleValue2Change}
                        fullWidth
                        placeholder="Secondary value (optional)"
                        slotProps={{ htmlInput: { 'data-testid': 'input-detail-value2' } }}
                    />
                    <TextField
                        label="Value 3"
                        value={formData.Value3}
                        onChange={handleValue3Change}
                        fullWidth
                        placeholder="Tertiary value (optional)"
                        slotProps={{ htmlInput: { 'data-testid': 'input-detail-value3' } }}
                    />
                    <TextField
                        label="Description"
                        value={formData.Description}
                        onChange={handleDescriptionChange}
                        fullWidth
                        multiline
                        rows={3}
                        placeholder="Describe the purpose of this detail configuration"
                        slotProps={{ htmlInput: { 'data-testid': 'input-detail-description' } }}
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
                    data-testid="btn-submit-detail"
                >
                    {loading ? 'Saving...' : (selectedDetail ? 'Update' : 'Create')}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

// Memoize to prevent re-renders from parent
export const DetailFormDialog = memo(DetailFormDialogComponent);
