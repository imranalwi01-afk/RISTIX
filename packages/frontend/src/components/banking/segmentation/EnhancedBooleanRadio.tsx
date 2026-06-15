'use client';

// packages/frontend/src/components/banking/segmentation/EnhancedBooleanRadio.tsx
import React, { useEffect, useState } from 'react';
import {
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormHelperText,
  Box,
  Chip,
} from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';

interface EnhancedBooleanRadioProps {
  label: string;
  value: string | boolean | null | undefined;
  onChange: (value: string) => void;
  required?: boolean;
  disabled?: boolean;
  error?: boolean;
  helperText?: string;
  row?: boolean;
  showChips?: boolean;
  allowNull?: boolean;
  sx?: any;
}

/**
 * Enhanced Boolean Radio Component with proper pre-selection handling
 * Handles various boolean value formats and edit mode pre-selection
 */
export const EnhancedBooleanRadio: React.FC<EnhancedBooleanRadioProps> = ({
  label,
  value,
  onChange,
  required = false,
  disabled = false,
  error = false,
  helperText = '',
  row = true,
  showChips = false,
  allowNull = false,
  sx = {},
}) => {
  const [internalValue, setInternalValue] = useState<string>('');

  // Normalize various boolean value formats
  const normalizeValue = (val: any): string => {
    // Handle null/undefined
    if (val === null || val === undefined || val === '') {
      return allowNull ? 'null' : '';
    }

    // Handle boolean types
    if (typeof val === 'boolean') {
      return val ? 'true' : 'false';
    }

    // Handle string types
    const strVal = String(val).toLowerCase().trim();
    
    // Check for true values
    if (['true', '1', 'yes', 'y', 't'].includes(strVal)) {
      return 'true';
    }
    
    // Check for false values
    if (['false', '0', 'no', 'n', 'f'].includes(strVal)) {
      return 'false';
    }
    
    // Check for null values
    if (['null', 'nil', 'none'].includes(strVal) && allowNull) {
      return 'null';
    }

    // Default
    return allowNull ? 'null' : '';
  };

  // Initialize and update internal value
  useEffect(() => {
    const normalized = normalizeValue(value);
    setInternalValue(normalized);
    
    // Log for debugging
    console.log('🔘 Boolean Radio Value Normalization:', {
      originalValue: value,
      originalType: typeof value,
      normalizedValue: normalized,
      label
    });
  }, [value, allowNull, label]);

  // Handle change
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    setInternalValue(newValue);
    onChange(newValue);
    
    console.log('🔘 Boolean Radio Changed:', {
      label,
      newValue,
      willEmit: newValue
    });
  };

  // Get display color for chips
  const getChipColor = (val: string): 'success' | 'error' | 'default' => {
    if (val === 'true') return 'success';
    if (val === 'false') return 'error';
    return 'default';
  };

  // Get display icon for chips
  const getChipIcon = (val: string) => {
    if (val === 'true') return <CheckIcon />;
    if (val === 'false') return <CloseIcon />;
    return undefined;
  };

  // Get display label
  const getDisplayLabel = (val: string): string => {
    if (val === 'true') return 'True';
    if (val === 'false') return 'False';
    if (val === 'null') return 'Not Set';
    return val;
  };

  return (
    <FormControl 
      component="fieldset" 
      fullWidth 
      error={error}
      disabled={disabled}
      required={required}
      sx={sx}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <FormLabel component="legend" sx={{ mb: 0 }}>
          {label}
          {required && <span style={{ color: 'error.main', marginLeft: 4 }}> *</span>}
        </FormLabel>
        
        {showChips && internalValue && (
          <Chip
            size="small"
            label={getDisplayLabel(internalValue)}
            color={getChipColor(internalValue)}
            icon={getChipIcon(internalValue)}
            variant="outlined"
          />
        )}
      </Box>

      <RadioGroup
        value={internalValue}
        onChange={handleChange}
        row={row}
        aria-labelledby={`${label}-radio-group`}
      >
        <FormControlLabel 
          value="true" 
          control={
            <Radio 
              color="success"
              size="small"
            />
          } 
          label={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              {showChips && <CheckIcon fontSize="small" color="success" />}
              <span>True</span>
            </Box>
          }
        />
        
        <FormControlLabel 
          value="false" 
          control={
            <Radio 
              color="error"
              size="small"
            />
          } 
          label={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              {showChips && <CloseIcon fontSize="small" color="error" />}
              <span>False</span>
            </Box>
          }
        />
        
        {allowNull && (
          <FormControlLabel 
            value="null" 
            control={
              <Radio 
                size="small"
              />
            } 
            label="Not Set"
          />
        )}
      </RadioGroup>

      {helperText && (
        <FormHelperText error={error}>
          {helperText}
        </FormHelperText>
      )}

      {/* Debug info in development */}
      {process.env.NODE_ENV === 'development' && (
        <Box sx={{ mt: 1, p: 1, bgcolor: 'grey.100', borderRadius: 1, display: 'none' }}>
          <pre style={{ fontSize: '10px', margin: 0 }}>
            {JSON.stringify({
              originalValue: value,
              type: typeof value,
              normalized: internalValue,
              willEmit: internalValue
            }, null, 2)}
          </pre>
        </Box>
      )}
    </FormControl>
  );
};

export default EnhancedBooleanRadio;