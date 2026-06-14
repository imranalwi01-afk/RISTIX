// packages/frontend/src/app/banking/setup/application/components/DisplaySettingsCard.tsx
// ============================================================================
// Display Settings Card - Currency symbol toggle with live preview
// ============================================================================

'use client';

import React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import Divider from '@mui/material/Divider';

interface DisplaySettingsCardProps {
  currencySymbolEnabled: boolean;
  setCurrencySymbolEnabled: (value: boolean) => void;
  currencySettingDirty: boolean;
  setCurrencySettingDirty: (value: boolean) => void;
  canManageApplication: boolean;
  currencySettingLoading: boolean;
  currencySettingSaving: boolean;
  saveCurrencySymbolSetting: () => void;
  formatPreviewAmount: (value: number, currency: 'IDR' | 'USD', showSymbol: boolean) => string;
}

export function DisplaySettingsCard({
  currencySymbolEnabled,
  setCurrencySymbolEnabled,
  currencySettingDirty,
  setCurrencySettingDirty,
  canManageApplication,
  currencySettingLoading,
  currencySettingSaving,
  saveCurrencySymbolSetting,
  formatPreviewAmount,
}: DisplaySettingsCardProps) {
  return (
    <Card sx={{ mb: 2, width: '100%', maxWidth: '100%', minWidth: 0, overflow: 'hidden' }}>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 0.5, fontWeight: 700 }}>
          Display Settings
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Affects all modules. Numeric values are unchanged.
        </Typography>
        <Divider sx={{ mb: 2 }} />

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center', justifyContent: 'space-between' }}>
          <FormControlLabel
            control={
              <Switch
                checked={currencySymbolEnabled}
                onChange={(event) => {
                  setCurrencySymbolEnabled(event.target.checked);
                  setCurrencySettingDirty(true);
                }}
                disabled={!canManageApplication || currencySettingLoading || currencySettingSaving}
              />
            }
            label="Show Currency Symbol"
          />
          <Button
            variant="contained"
            onClick={() => { void saveCurrencySymbolSetting(); }}
            disabled={!canManageApplication || !currencySettingDirty || currencySettingLoading || currencySettingSaving}
          >
            {currencySettingSaving ? 'Saving...' : 'Save Display Setting'}
          </Button>
        </Box>

        <Box sx={{ mt: 2, p: 1.5, border: '1px dashed', borderColor: 'divider', borderRadius: 1 }}>
          <Typography variant="caption" color="text.secondary">Live Preview</Typography>
          <Typography variant="body2">
            {formatPreviewAmount(1250000, 'IDR', currencySymbolEnabled)} | {formatPreviewAmount(10500, 'USD', currencySymbolEnabled)}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}
