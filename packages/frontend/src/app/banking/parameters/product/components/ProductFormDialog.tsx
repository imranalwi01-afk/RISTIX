// packages/frontend/src/app/banking/parameters/product/components/ProductFormDialog.tsx
// ============================================================================
// 🔧 EXTRACTED COMPONENT: Product Form Dialog with React.memo
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

export interface ProductParameter {
    pkid: number;
    dataSource: string;
    prdGroup: string;
    prdType: string;
    prdCode: string;
    prdDesc: string;
    currency: string;
    amortizationType?: string;
    alFlag?: string;
    impairedFlag?: boolean;
    bmFlag?: boolean;
    expectedLife?: number;
    borrowingRate?: number;
    marketRate?: number;
    activeFlag: boolean;
    createdby?: string;
    createddate?: string;
    updatedby?: string;
    updateddate?: string;
}

export interface ProductFormData {
    dataSource: string;
    prdGroup: string;
    prdType: string;
    prdCode: string;
    prdDesc: string;
    currency: string;
    amortizationType: string;
    instrumentClass: string;
    impairedFlag: boolean;
    bmFlag: boolean;
    expectedLife: number | '';
    borrowingRate: number | '';
    marketRate: number | '';
    activeFlag: boolean;
}

export interface DropdownOption {
    value: string;
    label: string;
}

interface ProductFormDialogProps {
    open: boolean;
    onClose: () => void;
    onSave: (data: ProductFormData) => Promise<void> | void;
    product?: ProductParameter | null;
    isExternalLoading?: boolean;
    currencyOptions: DropdownOption[];
    amortizationOptions: DropdownOption[];
    instrumentClassOptions: DropdownOption[];
}

// =====================================================
// MEMOIZED DIALOG COMPONENT
// =====================================================

const ProductFormDialog = memo(function ProductFormDialog({
    open,
    onClose,
    onSave,
    product,
    isExternalLoading = false,
    currencyOptions,
    amortizationOptions,
    instrumentClassOptions
}: ProductFormDialogProps) {
    // Internal form state - isolated from parent re-renders
    const [formData, setFormData] = useState<ProductFormData>({
        dataSource: 'Core System',
        prdGroup: 'Financing',
        prdType: 'Baru',
        prdCode: '',
        prdDesc: '',
        currency: 'IDR',
        amortizationType: 'EIR',
        instrumentClass: '',
        impairedFlag: false,
        bmFlag: false,
        expectedLife: '',
        borrowingRate: '',
        marketRate: '',
        activeFlag: true
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Reset form when dialog opens
    useEffect(() => {
        if (open) {
            if (product) {
                setFormData({
                    dataSource: product.dataSource || '',
                    prdGroup: product.prdGroup || '',
                    prdType: product.prdType || '',
                    prdCode: product.prdCode || '',
                    prdDesc: product.prdDesc || '',
                    currency: product.currency || '',
                    amortizationType: product.amortizationType || 'EIR',
                    instrumentClass: product.alFlag || '',
                    impairedFlag: Boolean(product.impairedFlag),
                    bmFlag: Boolean(product.bmFlag),
                    expectedLife: product.expectedLife || '',
                    borrowingRate: product.borrowingRate || '',
                    marketRate: product.marketRate || '',
                    activeFlag: Boolean(product.activeFlag)
                });
            } else {
                setFormData({
                    dataSource: 'Core System',
                    prdGroup: 'Financing',
                    prdType: 'Baru',
                    prdCode: '',
                    prdDesc: '',
                    currency: 'IDR',
                    amortizationType: 'EIR',
                    instrumentClass: '',
                    impairedFlag: false,
                    bmFlag: false,
                    expectedLife: '',
                    borrowingRate: '',
                    marketRate: '',
                    activeFlag: true
                });
            }
            setError(null);
        }
    }, [open, product]);

    // Memoized handlers
    const handleFieldChange = useCallback((field: keyof ProductFormData) =>
        (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            const value = e.target.type === 'number'
                ? (e.target.value ? Number(e.target.value) : '')
                : e.target.value;
            setFormData(prev => ({ ...prev, [field]: value }));
        }, []);

    const handleSwitchChange = useCallback((field: keyof ProductFormData) =>
        (e: React.ChangeEvent<HTMLInputElement>) => {
            setFormData(prev => ({ ...prev, [field]: e.target.checked }));
        }, []);

    const handleSubmit = useCallback(async () => {
        const errors: string[] = [];
        if (!formData.dataSource.trim()) errors.push('Data Source is required');
        if (!formData.prdGroup.trim()) errors.push('Product Group is required');
        if (!formData.prdType.trim()) errors.push('Product Type is required');
        if (!formData.prdCode.trim()) errors.push('Product Code is required');
        if (!formData.currency.trim()) errors.push('Currency is required');
        if (!formData.instrumentClass.trim()) errors.push('Instrument Class is required');

        if (errors.length > 0) {
            setError(errors.join(', '));
            return;
        }

        setError(null);
        setLoading(true);
        console.log('🚀 [ProductDialog] Submitting product parameter:', formData.prdCode);

        try {
            await onSave(formData);
            console.log('✅ [ProductDialog] Save successful, closing dialog');
            onClose();
        } catch (err: any) {
            console.error('❌ [ProductDialog] Save failed:', err);
            setError(err.message || 'Failed to save product parameter');
        } finally {
            setLoading(false);
        }
    }, [formData, onSave, onClose]);

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>
                {product ? 'Edit Product Parameter' : 'Create Product Parameter'}
            </DialogTitle>
            <DialogContent>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2, mt: 2 }}>
                    <TextField
                        label="Data Source *"
                        value={formData.dataSource}
                        onChange={handleFieldChange('dataSource')}
                        fullWidth
                        required
                        slotProps={{ htmlInput: { maxLength: 20 } }}
                        error={!formData.dataSource.trim()}
                        helperText={!formData.dataSource.trim() && 'Data Source is required'}
                    />
                    <TextField
                        label="Product Group *"
                        value={formData.prdGroup}
                        onChange={handleFieldChange('prdGroup')}
                        fullWidth
                        required
                        slotProps={{ htmlInput: { maxLength: 20 } }}
                        error={!formData.prdGroup.trim()}
                        helperText={!formData.prdGroup.trim() && 'Product Group is required'}
                    />
                    <TextField
                        label="Product Type *"
                        value={formData.prdType}
                        onChange={handleFieldChange('prdType')}
                        fullWidth
                        required
                        slotProps={{ htmlInput: { maxLength: 20 } }}
                        error={!formData.prdType.trim()}
                        helperText={!formData.prdType.trim() && 'Product Type is required'}
                    />
                    <TextField
                        label="Product Code *"
                        value={formData.prdCode}
                        onChange={handleFieldChange('prdCode')}
                        fullWidth
                        required
                        disabled={!!product}
                        slotProps={{ htmlInput: { maxLength: 20 } }}
                        error={!formData.prdCode.trim()}
                        helperText={!formData.prdCode.trim() && 'Product Code is required'}
                    />
                    <TextField
                        label="Product Description"
                        value={formData.prdDesc}
                        onChange={handleFieldChange('prdDesc')}
                        fullWidth
                        sx={{ gridColumn: 'span 2' }}
                        slotProps={{ htmlInput: { maxLength: 255 } }}
                    />
                    <TextField
                        label="Currency *"
                        select
                        value={formData.currency}
                        onChange={handleFieldChange('currency')}
                        fullWidth
                        required
                        error={!formData.currency.trim()}
                        helperText={!formData.currency.trim() ? 'Currency is required' : 'Source: Business Setting B0001'}
                    >
                        {currencyOptions.length > 0 ? (
                            currencyOptions.map((option, idx) => (
                                <MenuItem key={`${option.value}-${idx}`} value={option.value}>{option.label}</MenuItem>
                            ))
                        ) : (
                            <MenuItem disabled value="">No options — configure B0001 in Business Settings</MenuItem>
                        )}
                    </TextField>
                    <TextField
                        label="Amortization Type"
                        select
                        value={formData.amortizationType}
                        onChange={handleFieldChange('amortizationType')}
                        fullWidth
                        helperText="Source: Business Setting B0002"
                    >
                        {amortizationOptions.length > 0 ? (
                            amortizationOptions.map((option, idx) => (
                                <MenuItem key={`${option.value}-${idx}`} value={option.value}>{option.label}</MenuItem>
                            ))
                        ) : (
                            <MenuItem disabled value="">No options — configure B0002 in Business Settings</MenuItem>
                        )}
                    </TextField>
                    <TextField
                        label="Instrument Class *"
                        select
                        value={formData.instrumentClass}
                        onChange={handleFieldChange('instrumentClass')}
                        fullWidth
                        required
                        error={!formData.instrumentClass.trim()}
                        helperText={!formData.instrumentClass.trim() ? 'Instrument Class is required' : 'Source: Business Setting B0003'}
                    >
                        {instrumentClassOptions.length > 0 ? (
                            instrumentClassOptions.map((option, idx) => (
                                <MenuItem key={`${option.value}-${idx}`} value={option.value}>{option.label}</MenuItem>
                            ))
                        ) : (
                            <MenuItem disabled value="">No options — configure B0003 in Business Settings</MenuItem>
                        )}
                    </TextField>
                    <TextField
                        label="Expected Life"
                        type="number"
                        value={formData.expectedLife}
                        onChange={handleFieldChange('expectedLife')}
                        fullWidth
                    />
                    <TextField
                        label="Borrowing Rate"
                        type="number"
                        value={formData.borrowingRate}
                        onChange={handleFieldChange('borrowingRate')}
                        fullWidth
                        slotProps={{ htmlInput: { step: 0.001 } }}
                    />
                    <TextField
                        label="Market Rate"
                        type="number"
                        value={formData.marketRate}
                        onChange={handleFieldChange('marketRate')}
                        fullWidth
                        slotProps={{ htmlInput: { step: 0.001 } }}
                    />
                    <Box sx={{ gridColumn: 'span 2', display: 'flex', gap: 2 }}>
                        <FormControlLabel
                            control={<Switch checked={formData.impairedFlag} onChange={handleSwitchChange('impairedFlag')} />}
                            label="Impaired Flag"
                        />
                        <FormControlLabel
                            control={<Switch checked={formData.bmFlag} onChange={handleSwitchChange('bmFlag')} />}
                            label="BM Flag"
                        />
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
                <Button onClick={onClose} disabled={loading || isExternalLoading}>Cancel</Button>
                <Button onClick={handleSubmit} variant="contained" disabled={loading || isExternalLoading}>
                    {loading || isExternalLoading ? 'Saving...' : (product ? 'Update' : 'Create')}
                </Button>
            </DialogActions>
        </Dialog>
    );
});

export default ProductFormDialog;
