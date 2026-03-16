'use client';

import React, { memo, useCallback, useEffect, useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  MenuItem,
  Switch,
  TextField,
} from '@mui/material';

export interface ProductParameter {
  pkid: number;
  dataSource?: string;
  prdGroup?: string;
  prdType?: string;
  prdCode?: string;
  prdDesc?: string;
  currency?: string;
  amortizationType?: string;
  alFlag?: string;
  impairedFlag?: boolean;
  bmFlag?: boolean;
  expectedLife?: number;
  borrowingRate?: number;
  marketRate?: number;
  activeFlag?: boolean;
  _clone?: boolean;
}

export interface ProductFormData {
  dataSource: string;
  prdGroup: string;
  prdType: string;
  prdCode: string;
  prdDesc: string;
  currency: string;
  amortizationType: string;
  alFlag: string;
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
  dataSourceOptions: DropdownOption[];
  productGroupOptions: DropdownOption[];
  productTypeOptions: DropdownOption[];
  currencyOptions: DropdownOption[];
  amortizationOptions: DropdownOption[];
  instrumentClassOptions: DropdownOption[];
}

const withSourceHelper = (error: string | undefined, sourceCode: string) => {
  if (error) return `${error} Source: Business Setting ${sourceCode}`;
  return `Source: Business Setting ${sourceCode}`;
};

const initialFormData: ProductFormData = {
  dataSource: '',
  prdGroup: '',
  prdType: '',
  prdCode: '',
  prdDesc: '',
  currency: '',
  amortizationType: '',
  alFlag: '',
  impairedFlag: false,
  bmFlag: false,
  expectedLife: '',
  borrowingRate: '',
  marketRate: '',
  activeFlag: true,
};

const ProductFormDialog = memo(function ProductFormDialog({
  open,
  onClose,
  onSave,
  product,
  isExternalLoading = false,
  dataSourceOptions,
  productGroupOptions,
  productTypeOptions,
  currencyOptions,
  amortizationOptions,
  instrumentClassOptions,
}: ProductFormDialogProps) {
  const [formData, setFormData] = useState<ProductFormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const isClone = Boolean(product?._clone);
  const isEdit = Boolean(product && !isClone);

  useEffect(() => {
    if (!open) return;

    if (product) {
      setFormData({
        dataSource: product.dataSource ?? '',
        prdGroup: product.prdGroup ?? '',
        prdType: product.prdType ?? '',
        prdCode: product.prdCode ?? '',
        prdDesc: product.prdDesc ?? '',
        currency: product.currency ?? '',
        amortizationType: product.amortizationType ?? '',
        alFlag: product.alFlag ?? '',
        impairedFlag: Boolean(product.impairedFlag),
        bmFlag: Boolean(product.bmFlag),
        expectedLife: product.expectedLife ?? '',
        borrowingRate: product.borrowingRate ?? '',
        marketRate: product.marketRate ?? '',
        activeFlag: product.activeFlag !== undefined ? Boolean(product.activeFlag) : true,
      });
      return;
    }

    setFormData(initialFormData);
    setErrors({});
  }, [open, product]);

  const handleFieldChange = useCallback(
    (field: keyof ProductFormData) =>
      (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const value =
          event.target.type === 'number'
            ? event.target.value === ''
              ? ''
              : Number(event.target.value)
            : event.target.value;

        setFormData((prev) => ({ ...prev, [field]: value }));
        setErrors((prev) => {
          if (!prev[field]) return prev;
          const next = { ...prev };
          delete next[field];
          return next;
        });
      },
    []
  );

  const handleSwitchChange = useCallback(
    (field: keyof ProductFormData) => (event: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({ ...prev, [field]: event.target.checked }));
    },
    []
  );

  const validate = useCallback(() => {
    const nextErrors: Record<string, string> = {};

    if (!formData.dataSource.trim()) nextErrors.dataSource = 'Data Source is required.';
    if (!formData.prdGroup.trim()) nextErrors.prdGroup = 'Product Group is required.';
    if (!formData.prdType.trim()) nextErrors.prdType = 'Product Type is required.';
    if (!formData.prdCode.trim()) nextErrors.prdCode = 'Product Code is required.';
    if (!formData.prdDesc.trim()) nextErrors.prdDesc = 'Product Description is required.';
    if (!formData.currency.trim()) nextErrors.currency = 'Currency is required.';

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }, [formData]);

  const handleSubmit = useCallback(async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      await onSave(formData);
      onClose();
    } finally {
      setLoading(false);
    }
  }, [formData, onClose, onSave, validate]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {isEdit ? 'Edit Product Parameter' : isClone ? 'Clone Product Parameter' : 'Create Product Parameter'}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2, display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 2 }}>
          <TextField
            label="Product Code *"
            value={formData.prdCode}
            onChange={handleFieldChange('prdCode')}
            fullWidth
            disabled={isEdit}
            error={Boolean(errors.prdCode)}
            helperText={errors.prdCode}
            slotProps={{ htmlInput: { maxLength: 50, 'data-testid': 'input-product-code' } }}
          />

          <TextField
            label="Data Source *"
            select
            value={formData.dataSource}
            onChange={handleFieldChange('dataSource')}
            fullWidth
            error={Boolean(errors.dataSource)}
            helperText={withSourceHelper(errors.dataSource, 'B0028')}
            SelectProps={{ inputProps: { 'data-testid': 'select-product-data-source' } }}
          >
            {dataSourceOptions.length > 0 ? (
              dataSourceOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))
            ) : (
              <MenuItem disabled value="">
                No options - configure B0028 in Business Settings
              </MenuItem>
            )}
          </TextField>

          <TextField
            label="Product Description *"
            value={formData.prdDesc}
            onChange={handleFieldChange('prdDesc')}
            fullWidth
            error={Boolean(errors.prdDesc)}
            helperText={errors.prdDesc}
            sx={{ gridColumn: '1 / -1' }}
            slotProps={{ htmlInput: { maxLength: 255, 'data-testid': 'input-product-desc' } }}
          />

          <TextField
            label="Product Group *"
            select
            value={formData.prdGroup}
            onChange={handleFieldChange('prdGroup')}
            fullWidth
            error={Boolean(errors.prdGroup)}
            helperText={withSourceHelper(errors.prdGroup, 'B0029')}
            SelectProps={{ inputProps: { 'data-testid': 'select-product-group' } }}
          >
            {productGroupOptions.length > 0 ? (
              productGroupOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))
            ) : (
              <MenuItem disabled value="">
                No options - configure B0029 in Business Settings
              </MenuItem>
            )}
          </TextField>

          <TextField
            label="Product Type *"
            select
            value={formData.prdType}
            onChange={handleFieldChange('prdType')}
            fullWidth
            error={Boolean(errors.prdType)}
            helperText={withSourceHelper(errors.prdType, 'B0030')}
            SelectProps={{ inputProps: { 'data-testid': 'select-product-type' } }}
          >
            {productTypeOptions.length > 0 ? (
              productTypeOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))
            ) : (
              <MenuItem disabled value="">
                No options - configure B0030 in Business Settings
              </MenuItem>
            )}
          </TextField>

          <TextField
            label="Currency *"
            select
            value={formData.currency}
            onChange={handleFieldChange('currency')}
            fullWidth
            error={Boolean(errors.currency)}
            helperText={withSourceHelper(errors.currency, 'B0001')}
            SelectProps={{ inputProps: { 'data-testid': 'select-product-currency' } }}
          >
            {currencyOptions.length > 0 ? (
              currencyOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))
            ) : (
              <MenuItem disabled value="">
                No options - configure B0001 in Business Settings
              </MenuItem>
            )}
          </TextField>

          <TextField
            label="Instrument Class"
            select
            value={formData.alFlag}
            onChange={handleFieldChange('alFlag')}
            fullWidth
            helperText="Source: Business Setting B0003"
            SelectProps={{ inputProps: { 'data-testid': 'select-product-instrument-class' } }}
          >
            {instrumentClassOptions.length > 0 ? (
              instrumentClassOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))
            ) : (
              <MenuItem disabled value="">
                No options - configure B0003 in Business Settings
              </MenuItem>
            )}
          </TextField>

          <TextField
            label="Amortization Type"
            select
            value={formData.amortizationType}
            onChange={handleFieldChange('amortizationType')}
            fullWidth
            sx={{ gridColumn: '1 / -1' }}
            helperText="Source: Business Setting B0002"
            SelectProps={{ inputProps: { 'data-testid': 'select-product-amortization-type' } }}
          >
            {amortizationOptions.length > 0 ? (
              amortizationOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))
            ) : (
              <MenuItem disabled value="">
                No options - configure B0002 in Business Settings
              </MenuItem>
            )}
          </TextField>

          <TextField
            label="Exp. Life (Mths)"
            type="number"
            value={formData.expectedLife}
            onChange={handleFieldChange('expectedLife')}
            fullWidth
          />

          <TextField
            label="Borrowing %"
            type="number"
            value={formData.borrowingRate}
            onChange={handleFieldChange('borrowingRate')}
            fullWidth
            slotProps={{ htmlInput: { step: '0.001' } }}
          />

          <TextField
            label="Market %"
            type="number"
            value={formData.marketRate}
            onChange={handleFieldChange('marketRate')}
            fullWidth
            slotProps={{ htmlInput: { step: '0.001' } }}
          />

          <Box sx={{ gridColumn: '1 / -1', display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <FormControlLabel
              control={<Switch checked={formData.impairedFlag} onChange={handleSwitchChange('impairedFlag')} />}
              label="Impaired"
            />
            <FormControlLabel
              control={<Switch checked={formData.bmFlag} onChange={handleSwitchChange('bmFlag')} />}
              label="Below Market"
            />
            <FormControlLabel
              control={<Switch checked={formData.activeFlag} onChange={handleSwitchChange('activeFlag')} />}
              label="Active"
            />
          </Box>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={loading || isExternalLoading}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} variant="contained" disabled={loading || isExternalLoading} data-testid="btn-submit-product">
          {loading || isExternalLoading ? 'Saving...' : isEdit ? 'Update Product' : 'Save Product'}
        </Button>
      </DialogActions>
    </Dialog>
  );
});

export default ProductFormDialog;
