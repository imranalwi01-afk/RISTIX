import React, { useEffect, useState } from 'react';
import { Controller, Control } from 'react-hook-form';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  CircularProgress,
  SelectProps
} from '@mui/material';
import { MockLookupService, LookupItem } from '@/services/mock/lookup.service';

interface LookupSelectProps extends Omit<SelectProps, 'control' | 'name'> {
  name: string;
  control: Control<any>;
  categoryCode: string; // The lookup code (e.g., 'B0001')
  label: string;
  rules?: any;
}

export const LookupSelect: React.FC<LookupSelectProps> = ({
  name,
  control,
  categoryCode,
  label,
  rules,
  ...props
}) => {
  const [items, setItems] = useState<LookupItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await MockLookupService.getByCode(categoryCode);
        if (mounted) {
          setItems(data);
        }
      } catch (error) {
        console.error(`Failed to fetch lookup for ${categoryCode}`, error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      mounted = false;
    };
  }, [categoryCode]);

  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field, fieldState: { error } }) => (
        <FormControl fullWidth error={!!error} size="small" disabled={props.disabled || loading}>
          <InputLabel id={`${name}-label`}>{label}</InputLabel>
          <Select
            {...field}
            value={field.value ?? ''}
            {...props}
            labelId={`${name}-label`}
            label={label}
            id={name}
            endAdornment={loading ? <CircularProgress size={20} sx={{ mr: 2 }} /> : null}
          >
            {items.map((item) => (
              <MenuItem key={item.code} value={item.code}>
                {item.label}
              </MenuItem>
            ))}
            {items.length === 0 && !loading && (
              <MenuItem disabled value="">
                <em>No items found</em>
              </MenuItem>
            )}
          </Select>
          {error && <FormHelperText>{error.message}</FormHelperText>}
        </FormControl>
      )}
    />
  );
};
